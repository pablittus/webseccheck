"""SQLite persistence for scans and reports."""

import json
import os
import sqlite3
import threading
from datetime import datetime

DB_PATH = "/app/data/scans.db"

_local = threading.local()


def get_conn() -> sqlite3.Connection:
    if not hasattr(_local, "conn"):
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        _local.conn = sqlite3.connect(DB_PATH)
        _local.conn.row_factory = sqlite3.Row
        _local.conn.execute("PRAGMA journal_mode=WAL")
    return _local.conn


def init_db():
    conn = get_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            hostname TEXT NOT NULL,
            score INTEGER,
            grade TEXT,
            checks TEXT,
            scan_time_seconds REAL,
            total_checks INTEGER,
            passed INTEGER,
            warnings INTEGER,
            failed INTEGER,
            ip_address TEXT,
            user_agent TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scan_id INTEGER,
            email TEXT,
            token TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_scans_created ON scans(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_scans_hostname ON scans(hostname);
    """)
    conn.commit()


def save_scan(scan_data: dict, ip_address: str = "", user_agent: str = "") -> int:
    conn = get_conn()
    cur = conn.execute(
        """INSERT INTO scans (url, hostname, score, grade, checks, scan_time_seconds,
           total_checks, passed, warnings, failed, ip_address, user_agent)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            scan_data["url"],
            scan_data["hostname"],
            scan_data["score"],
            scan_data["grade"],
            json.dumps(scan_data.get("checks", [])),
            scan_data.get("scan_time_seconds", 0),
            scan_data.get("total_checks", 0),
            scan_data.get("passed", 0),
            scan_data.get("warnings", 0),
            scan_data.get("failed", 0),
            ip_address,
            user_agent,
        ),
    )
    conn.commit()
    return cur.lastrowid


def save_report(scan_id: int, email: str, token: str) -> int:
    conn = get_conn()
    cur = conn.execute(
        "INSERT INTO reports (scan_id, email, token) VALUES (?, ?, ?)",
        (scan_id, email, token),
    )
    conn.commit()
    return cur.lastrowid


def get_scans(page: int = 1, limit: int = 50, hostname: str = ""):
    conn = get_conn()
    offset = (page - 1) * limit
    if hostname:
        rows = conn.execute(
            "SELECT * FROM scans WHERE hostname LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
            (f"%{hostname}%", limit, offset),
        ).fetchall()
        total = conn.execute("SELECT COUNT(*) FROM scans WHERE hostname LIKE ?", (f"%{hostname}%",)).fetchone()[0]
    else:
        rows = conn.execute("SELECT * FROM scans ORDER BY created_at DESC LIMIT ? OFFSET ?", (limit, offset)).fetchall()
        total = conn.execute("SELECT COUNT(*) FROM scans").fetchone()[0]
    return [dict(r) for r in rows], total


def get_scan(scan_id: int):
    conn = get_conn()
    row = conn.execute("SELECT * FROM scans WHERE id = ?", (scan_id,)).fetchone()
    return dict(row) if row else None


def get_reports(page: int = 1, limit: int = 50):
    conn = get_conn()
    offset = (page - 1) * limit
    rows = conn.execute("SELECT * FROM reports ORDER BY created_at DESC LIMIT ? OFFSET ?", (limit, offset)).fetchall()
    total = conn.execute("SELECT COUNT(*) FROM reports").fetchone()[0]
    return [dict(r) for r in rows], total


def get_stats():
    conn = get_conn()
    total_scans = conn.execute("SELECT COUNT(*) FROM scans").fetchone()[0]
    total_reports = conn.execute("SELECT COUNT(*) FROM reports").fetchone()[0]
    scans_per_day = [
        dict(r) for r in conn.execute(
            "SELECT date(created_at) as day, COUNT(*) as count FROM scans GROUP BY date(created_at) ORDER BY day DESC LIMIT 30"
        ).fetchall()
    ]
    top_domains = [
        dict(r) for r in conn.execute(
            "SELECT hostname, COUNT(*) as count FROM scans GROUP BY hostname ORDER BY count DESC LIMIT 20"
        ).fetchall()
    ]
    return {
        "total_scans": total_scans,
        "total_reports": total_reports,
        "scans_per_day": scans_per_day,
        "top_domains": top_domains,
    }


def init_payments_table():
    conn = get_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            payment_id TEXT,
            status TEXT,
            email TEXT,
            url TEXT,
            external_reference TEXT,
            amount REAL,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_payments_ext_ref ON payments(external_reference);
        CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);
    """)
    conn.commit()


def save_payment(payment_id: str, status: str, email: str, url: str, external_reference: str, amount: float = 0) -> int:
    conn = get_conn()
    cur = conn.execute(
        "INSERT INTO payments (payment_id, status, email, url, external_reference, amount) VALUES (?, ?, ?, ?, ?, ?)",
        (payment_id, status, email, url, external_reference, amount),
    )
    conn.commit()
    return cur.lastrowid


def update_payment_status(payment_id: str, status: str):
    conn = get_conn()
    conn.execute(
        "UPDATE payments SET status = ?, updated_at = datetime('now') WHERE payment_id = ?",
        (status, payment_id),
    )
    conn.commit()


def get_payment_by_ext_ref(external_reference: str):
    conn = get_conn()
    row = conn.execute("SELECT * FROM payments WHERE external_reference = ?", (external_reference,)).fetchone()
    return dict(row) if row else None


def init_pentest_table():
    conn = get_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS pentest_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            url TEXT NOT NULL,
            repo_url TEXT,
            description TEXT,
            payment_status TEXT DEFAULT 'pending',
            payment_id TEXT,
            external_reference TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_pentest_ext_ref ON pentest_requests(external_reference);
    """)
    conn.commit()


def save_pentest_request(email: str, url: str, repo_url: str, description: str, external_reference: str) -> int:
    conn = get_conn()
    cur = conn.execute(
        "INSERT INTO pentest_requests (email, url, repo_url, description, external_reference) VALUES (?, ?, ?, ?, ?)",
        (email, url, repo_url, description, external_reference),
    )
    conn.commit()
    return cur.lastrowid


def update_pentest_status(external_reference: str, status: str, payment_id: str = ""):
    conn = get_conn()
    if payment_id:
        conn.execute(
            "UPDATE pentest_requests SET payment_status = ?, payment_id = ?, updated_at = datetime('now') WHERE external_reference = ?",
            (status, payment_id, external_reference),
        )
    else:
        conn.execute(
            "UPDATE pentest_requests SET payment_status = ?, updated_at = datetime('now') WHERE external_reference = ?",
            (status, external_reference),
        )
    conn.commit()


def get_pentest_by_ext_ref(external_reference: str):
    conn = get_conn()
    row = conn.execute("SELECT * FROM pentest_requests WHERE external_reference = ?", (external_reference,)).fetchone()
    return dict(row) if row else None


# ---- Analytics ----

def init_page_views_table():
    conn = get_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS page_views (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT NOT NULL,
            referrer TEXT DEFAULT '',
            user_agent TEXT DEFAULT '',
            ip_address TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_pv_created ON page_views(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_pv_path ON page_views(path);
    """)
    conn.commit()


def save_page_view(path: str, referrer: str = "", user_agent: str = "", ip_address: str = ""):
    conn = get_conn()
    conn.execute(
        "INSERT INTO page_views (path, referrer, user_agent, ip_address) VALUES (?, ?, ?, ?)",
        (path, referrer[:500], user_agent[:500], ip_address),
    )
    conn.commit()


def get_analytics_overview():
    conn = get_conn()
    today = conn.execute("SELECT COUNT(*) FROM page_views WHERE date(created_at) = date('now')").fetchone()[0]
    week = conn.execute("SELECT COUNT(*) FROM page_views WHERE created_at >= datetime('now', '-7 days')").fetchone()[0]
    month = conn.execute("SELECT COUNT(*) FROM page_views WHERE created_at >= datetime('now', '-30 days')").fetchone()[0]
    total = conn.execute("SELECT COUNT(*) FROM page_views").fetchone()[0]
    unique_today = conn.execute("SELECT COUNT(DISTINCT ip_address) FROM page_views WHERE date(created_at) = date('now')").fetchone()[0]
    unique_week = conn.execute("SELECT COUNT(DISTINCT ip_address) FROM page_views WHERE created_at >= datetime('now', '-7 days')").fetchone()[0]
    unique_month = conn.execute("SELECT COUNT(DISTINCT ip_address) FROM page_views WHERE created_at >= datetime('now', '-30 days')").fetchone()[0]
    views_per_day = [dict(r) for r in conn.execute(
        "SELECT date(created_at) as day, COUNT(*) as views, COUNT(DISTINCT ip_address) as unique_visitors FROM page_views WHERE created_at >= datetime('now', '-30 days') GROUP BY date(created_at) ORDER BY day"
    ).fetchall()]
    top_pages = [dict(r) for r in conn.execute(
        "SELECT path, COUNT(*) as views FROM page_views WHERE created_at >= datetime('now', '-30 days') GROUP BY path ORDER BY views DESC LIMIT 15"
    ).fetchall()]
    top_referrers = [dict(r) for r in conn.execute(
        "SELECT referrer, COUNT(*) as views FROM page_views WHERE referrer != '' AND created_at >= datetime('now', '-30 days') GROUP BY referrer ORDER BY views DESC LIMIT 15"
    ).fetchall()]
    return {
        "views_today": today, "views_week": week, "views_month": month, "views_total": total,
        "unique_today": unique_today, "unique_week": unique_week, "unique_month": unique_month,
        "views_per_day": views_per_day, "top_pages": top_pages, "top_referrers": top_referrers,
    }


def get_analytics_scans():
    conn = get_conn()
    scans_per_day = [dict(r) for r in conn.execute(
        "SELECT date(created_at) as day, COUNT(*) as count FROM scans WHERE created_at >= datetime('now', '-30 days') GROUP BY date(created_at) ORDER BY day"
    ).fetchall()]
    top_domains = [dict(r) for r in conn.execute(
        "SELECT hostname, COUNT(*) as count FROM scans WHERE created_at >= datetime('now', '-30 days') GROUP BY hostname ORDER BY count DESC LIMIT 20"
    ).fetchall()]
    total_30d = conn.execute("SELECT COUNT(*) FROM scans WHERE created_at >= datetime('now', '-30 days')").fetchone()[0]
    return {"scans_per_day": scans_per_day, "top_domains": top_domains, "total_30d": total_30d}


def get_analytics_conversions():
    conn = get_conn()
    total_scans = conn.execute("SELECT COUNT(*) FROM scans").fetchone()[0]
    total_reports = conn.execute("SELECT COUNT(*) FROM reports").fetchone()[0]
    total_pentests = conn.execute("SELECT COUNT(*) FROM pentest_requests").fetchone()[0]
    paid_reports = conn.execute("SELECT COUNT(*) FROM payments WHERE status = 'approved'").fetchone()[0]
    paid_pentests = conn.execute("SELECT COUNT(*) FROM pentest_requests WHERE payment_status = 'approved'").fetchone()[0]
    report_rate = round((total_reports / total_scans * 100), 1) if total_scans > 0 else 0
    paid_rate = round((paid_reports / total_scans * 100), 1) if total_scans > 0 else 0
    return {
        "total_scans": total_scans, "total_reports": total_reports, "total_pentests": total_pentests,
        "paid_reports": paid_reports, "paid_pentests": paid_pentests,
        "report_conversion_rate": report_rate, "paid_conversion_rate": paid_rate,
    }
