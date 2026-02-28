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
