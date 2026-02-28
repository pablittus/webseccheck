"""WebSecCheck - FastAPI backend for passive web security scanning."""

import asyncio
import time
from typing import Optional
from urllib.parse import urlparse

import aiohttp
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, field_validator

from checks import ssl_tls, http_headers, dns_records, server_exposure, cookies, cms_detection, mixed_content, redirects
from report_generator import generate_pdf
from token_manager import generate_token, validate_token
from email_sender import send_report_email, send_scan_alert, RESEND_API_KEY, FROM_EMAIL
from report_html import generate_report_html
import os
from fastapi import Request, Depends

import db


app = FastAPI(
    title="WebSecCheck API",
    description="Passive web security scanner — checks SSL/TLS, HTTP headers, DNS, cookies, and more.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
db.init_db()

ADMIN_KEY = os.environ.get("ADMIN_API_KEY", "")


def verify_admin(request: Request):
    key = request.headers.get("X-Admin-Key", "")
    if not ADMIN_KEY or key != ADMIN_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")



@app.get("/report/{token}", response_class=HTMLResponse)
async def serve_report(token: str):
    """Serve report pages — either token-based dynamic reports or legacy static ones."""
    import os, re
    # First check if it's a legacy static report name
    if re.match(r'^[a-zA-Z0-9_-]{1,30}$', token) and not any(c in token for c in '._'):
        path = os.path.join(os.path.dirname(__file__), "static", f"report-{token}.html")
        if os.path.exists(path):
            with open(path, "r") as f:
                return HTMLResponse(content=f.read())
    
    # Try as a token-based report
    token_data = validate_token(token)
    if token_data:
        html_content = generate_report_html(token_data["scan_data"])
        return HTMLResponse(content=html_content)
    
    return HTMLResponse(content="Report not found", status_code=404)

@app.get("/report-demo", response_class=HTMLResponse)
async def report_demo():
    """Redirect old URL."""
    import os
    path = os.path.join(os.path.dirname(__file__), "static", "report-demo.html")
    if os.path.exists(path):
        with open(path, "r") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse(content="Report not found", status_code=404)


class ScanRequest(BaseModel):
    url: str

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        v = v.strip()
        if not v.startswith(("http://", "https://")):
            v = f"https://{v}"
        parsed = urlparse(v)
        if not parsed.hostname:
            raise ValueError("Invalid URL")
        return v


class CheckResult(BaseModel):
    id: str
    name: str
    category: str
    status: str  # pass, warn, fail
    description: str
    details: Optional[dict] = None


class ScanResponse(BaseModel):
    url: str
    hostname: str
    score: int
    grade: str
    checks: list[CheckResult]
    scan_time_seconds: float
    total_checks: int
    passed: int
    warnings: int
    failed: int


def compute_score(checks: list[dict]) -> int:
    if not checks:
        return 0
    total = len(checks)
    score = 0
    for c in checks:
        if c["status"] == "pass":
            score += 100
        elif c["status"] == "warn":
            score += 50
    return round(score / total)


def score_to_grade(score: int) -> str:
    if score >= 90:
        return "A"
    if score >= 80:
        return "B"
    if score >= 65:
        return "C"
    if score >= 50:
        return "D"
    return "F"


async def fetch_site(url: str) -> tuple[dict, list, str]:
    """Fetch the target URL and return (headers_dict, set-cookie_list, body)."""
    timeout = aiohttp.ClientTimeout(total=10)
    async with aiohttp.ClientSession(timeout=timeout) as session:
        async with session.get(url, allow_redirects=True, ssl=False) as resp:
            headers = {k.lower(): v for k, v in resp.headers.items()}
            raw_cookies = resp.headers.getall("set-cookie", [])
            body = await resp.text(errors="replace")
            return headers, raw_cookies, body[:200_000]


@app.post("/scan", response_model=ScanResponse)
async def scan(request: ScanRequest, raw_request: Request = None):
    start = time.time()
    url = request.url
    parsed = urlparse(url)
    hostname = parsed.hostname

    # Fetch the site
    try:
        headers, raw_cookies, body = await asyncio.wait_for(fetch_site(url), timeout=15)
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Target site did not respond in time.")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Could not reach target site: {type(e).__name__}: {e}")

    # Run all checks concurrently with overall timeout
    try:
        all_results = await asyncio.wait_for(
            asyncio.gather(
                ssl_tls.run_all(hostname, headers),
                http_headers.run_all(headers),
                dns_records.run_all(hostname),
                server_exposure.run_all(headers),
                cookies.run_all(raw_cookies),
                cms_detection.run_all(body, headers),
                mixed_content.run_all(body, url),
                redirects.run_all(headers, url),
                return_exceptions=True,
            ),
            timeout=25,
        )
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Security checks timed out.")

    # Flatten results
    checks = []
    for result in all_results:
        if isinstance(result, list):
            checks.extend(result)
        elif isinstance(result, Exception):
            checks.append({
                "id": "error",
                "name": "Check Error",
                "category": "Error",
                "status": "fail",
                "description": str(result),
            })

    score = compute_score(checks)
    elapsed = round(time.time() - start, 2)

    passed = sum(1 for c in checks if c["status"] == "pass")
    warnings = sum(1 for c in checks if c["status"] == "warn")
    failed = sum(1 for c in checks if c["status"] == "fail")

    result = ScanResponse(
        url=url,
        hostname=hostname,
        score=score,
        grade=score_to_grade(score),
        checks=[CheckResult(**c) for c in checks],
        scan_time_seconds=elapsed,
        total_checks=len(checks),
        passed=passed,
        warnings=warnings,
        failed=failed,
    )

    # Save to database
    try:
        ip = ""
        ua = ""
        if raw_request:
            ip = raw_request.headers.get("x-forwarded-for", raw_request.client.host if raw_request.client else "")
            ua = raw_request.headers.get("user-agent", "")
        scan_id = db.save_scan(result.model_dump(), ip, ua)
        # Send scan alert email in background
        import threading
        threading.Thread(target=send_scan_alert, args=(hostname, score, score_to_grade(score), ip), daemon=True).start()
        if raw_request:
            raw_request.state.last_scan_id = scan_id
    except Exception:
        pass

    return result


class ReportRequest(BaseModel):
    url: str
    email: str = ""

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        v = v.strip()
        if not v.startswith(("http://", "https://")):
            v = f"https://{v}"
        parsed = urlparse(v)
        if not parsed.hostname:
            raise ValueError("Invalid URL")
        return v


@app.post("/report")
async def report(request: ReportRequest, raw_request: Request = None):
    """Run a scan, generate token, and email the report link."""
    if not request.email:
        raise HTTPException(status_code=400, detail="Email is required to receive the report.")

    # Run the scan
    scan_req = ScanRequest(url=request.url)
    scan_result = await scan(scan_req)
    scan_dict = scan_result.model_dump()

    # Generate token and store scan results
    token = generate_token(request.email, scan_dict)

    # Send email with report link
    email_sent = send_report_email(
        to_email=request.email,
        token=token,
        hostname=scan_dict["hostname"],
        score=scan_dict["score"],
        grade=scan_dict["grade"],
    )

    # Save report to db
    try:
        scan_id = getattr(raw_request.state, "last_scan_id", None) if raw_request else None
        db.save_report(scan_id or 0, request.email, token)
    except Exception:
        pass

    return {
        "status": "success",
        "message": f"Report link sent to {request.email}",
        "email_sent": email_sent,
        "token": token,
        "score": scan_dict["score"],
        "grade": scan_dict["grade"],
    }


@app.post("/report/pdf")
async def report_pdf(request: ReportRequest):
    """Generate a PDF report (legacy/VIP endpoint)."""
    scan_req = ScanRequest(url=request.url)
    scan_result = await scan(scan_req)
    scan_dict = scan_result.model_dump()
    pdf_bytes = generate_pdf(scan_dict)
    hostname = scan_dict["hostname"].replace(".", "_")
    filename = f"webseccheck_{hostname}_report.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )



# ---- Admin Panel & API ----

@app.get("/admin", response_class=HTMLResponse)
async def admin_panel():
    import os as _os
    path = _os.path.join(_os.path.dirname(__file__), "admin.html")
    with open(path, "r") as f:
        return HTMLResponse(content=f.read())


@app.get("/admin/stats")
async def admin_stats(_=Depends(verify_admin)):
    return db.get_stats()


@app.get("/admin/scans")
async def admin_scans(page: int = 1, limit: int = 50, hostname: str = "", _=Depends(verify_admin)):
    scans, total = db.get_scans(page, min(limit, 200), hostname)
    for s in scans:
        s.pop("checks", None)
    return {"scans": scans, "total": total, "page": page}


@app.get("/admin/scans/{scan_id}")
async def admin_scan_detail(scan_id: int, _=Depends(verify_admin)):
    scan = db.get_scan(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan


@app.get("/admin/reports")
async def admin_reports(page: int = 1, limit: int = 50, _=Depends(verify_admin)):
    reports, total = db.get_reports(page, min(limit, 200))
    return {"reports": reports, "total": total, "page": page}


@app.get("/")
async def root():
    return {"status": "ok", "service": "WebSecCheck API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


class ContactRequest(BaseModel):
    name: str
    email: str
    subject: str
    message: str
    turnstile_token: str


@app.post("/contact")
async def contact(request: ContactRequest, raw_request: Request = None):
    """Handle contact form with Turnstile verification."""
    import requests as req
    # Verify Turnstile token
    TURNSTILE_SECRET = os.environ.get("TURNSTILE_SECRET", "0x4AAAAAACjW7E94djEA1arV0WKbLRul2nE")
    ip = ""
    if raw_request:
        ip = raw_request.headers.get("x-forwarded-for", raw_request.client.host if raw_request.client else "")
    
    verify = req.post("https://challenges.cloudflare.com/turnstile/v0/siteverify", json={
        "secret": TURNSTILE_SECRET,
        "response": request.turnstile_token,
        "remoteip": ip,
    }, timeout=10)
    
    if not verify.json().get("success"):
        raise HTTPException(status_code=400, detail="Captcha verification failed. Please try again.")
    
    # Send contact email to admin
    ALERT_EMAIL = os.environ.get("ALERT_EMAIL", "pablo.sonder@gmail.com")
    try:
        req.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": FROM_EMAIL,
                "to": [ALERT_EMAIL],
                "reply_to": request.email,
                "subject": f"📩 Contact: {request.subject} — {request.name}",
                "html": f"""<div style="font-family:sans-serif;background:#0a0a0a;color:#ccc;padding:30px;">
                    <h2 style="color:#00FF41;">New Contact Form Submission</h2>
                    <p><strong>Name:</strong> {request.name}</p>
                    <p><strong>Email:</strong> {request.email}</p>
                    <p><strong>Subject:</strong> {request.subject}</p>
                    <p><strong>Message:</strong></p>
                    <div style="background:#111;padding:16px;border-radius:8px;border:1px solid #333;">{request.message}</div>
                    <p style="color:#666;font-size:12px;margin-top:20px;">IP: {ip}</p>
                </div>""",
            },
            timeout=10,
        )
    except Exception as e:
        print(f"Contact email error: {e}")
    
    return {"status": "success", "message": "Message received. We'll get back to you within 24 hours."}


# ---- Mercado Pago Integration ----

import uuid
import requests as sync_requests

MP_ACCESS_TOKEN = os.environ.get("MP_ACCESS_TOKEN", "")

# Initialize payments table
db.init_payments_table()


class CheckoutRequest(BaseModel):
    url: str
    email: str

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        v = v.strip()
        if not v.startswith(("http://", "https://")):
            v = f"https://{v}"
        parsed = urlparse(v)
        if not parsed.hostname:
            raise ValueError("Invalid URL")
        return v


@app.post("/checkout")
async def checkout(request: CheckoutRequest):
    """Create a Mercado Pago checkout preference and return the payment URL."""
    if not MP_ACCESS_TOKEN:
        raise HTTPException(status_code=500, detail="Payment system not configured")
    if not request.email:
        raise HTTPException(status_code=400, detail="Email is required")

    external_reference = f"{request.email}|||{request.url}|||{uuid.uuid4().hex[:8]}"

    preference = {
        "items": [
            {
                "title": "WebSecCheck Security Report",
                "quantity": 1,
                "unit_price": 49,
                "currency_id": "USD",
            }
        ],
        "payer": {"email": request.email},
        "back_urls": {
            "success": "https://webseccheck.com/report/success",
            "failure": "https://webseccheck.com/report/failure",
            "pending": "https://webseccheck.com/report/pending",
        },
        "auto_return": "approved",
        "notification_url": "https://api.webseccheck.com/webhook/mercadopago",
        "external_reference": external_reference,
    }

    try:
        resp = sync_requests.post(
            "https://api.mercadopago.com/checkout/preferences",
            json=preference,
            headers={
                "Authorization": f"Bearer {MP_ACCESS_TOKEN}",
                "Content-Type": "application/json",
            },
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print(f"MP preference error: {e}")
        raise HTTPException(status_code=502, detail="Could not create payment preference")

    # Save pending payment
    try:
        db.save_payment(
            payment_id="",
            status="pending",
            email=request.email,
            url=request.url,
            external_reference=external_reference,
            amount=49,
        )
    except Exception as e:
        print(f"DB save payment error: {e}")

    return {"init_point": data.get("init_point"), "preference_id": data.get("id")}


@app.post("/webhook/mercadopago")
async def webhook_mercadopago(raw_request: Request):
    """Handle Mercado Pago IPN notifications."""
    try:
        body = await raw_request.json()
    except Exception:
        return {"status": "ok"}

    print(f"MP webhook received: {body}")

    # MP sends topic=payment with data.id = payment_id
    topic = body.get("topic") or body.get("type", "")
    
    if topic in ("payment", "payment.created", "payment.updated"):
        payment_id = None
        if "data" in body and "id" in body["data"]:
            payment_id = str(body["data"]["id"])
        elif "resource" in body:
            # Extract ID from resource URL
            payment_id = body["resource"].split("/")[-1]
        
        if not payment_id:
            return {"status": "ok"}

        # Fetch payment details from MP
        try:
            resp = sync_requests.get(
                f"https://api.mercadopago.com/v1/payments/{payment_id}",
                headers={"Authorization": f"Bearer {MP_ACCESS_TOKEN}"},
                timeout=15,
            )
            resp.raise_for_status()
            payment_data = resp.json()
        except Exception as e:
            print(f"MP fetch payment error: {e}")
            return {"status": "error"}

        status = payment_data.get("status", "")
        external_reference = payment_data.get("external_reference", "")
        amount = payment_data.get("transaction_amount", 0)

        print(f"MP payment {payment_id}: status={status}, ref={external_reference}")

        # Update or save payment in DB
        try:
            existing = db.get_payment_by_ext_ref(external_reference)
            if existing:
                db.update_payment_status(payment_id, status)
                # Also update payment_id if it was empty
                conn = db.get_conn()
                conn.execute(
                    "UPDATE payments SET payment_id = ? WHERE external_reference = ?",
                    (payment_id, external_reference),
                )
                conn.commit()
            else:
                # Parse email and url from external_reference
                parts = external_reference.split("|||")
                email = parts[0] if len(parts) > 0 else ""
                url = parts[1] if len(parts) > 1 else ""
                db.save_payment(payment_id, status, email, url, external_reference, amount)
        except Exception as e:
            print(f"DB payment update error: {e}")

        # If approved, generate and send report
        if status == "approved" and external_reference:
            parts = external_reference.split("|||")
            if len(parts) >= 2:
                email = parts[0]
                url = parts[1]
                # Generate report in background thread
                import threading

                def _generate_and_send(email: str, url: str):
                    try:
                        import asyncio
                        loop = asyncio.new_event_loop()
                        asyncio.set_event_loop(loop)
                        
                        scan_req = ScanRequest(url=url)
                        scan_result = loop.run_until_complete(scan(scan_req))
                        scan_dict = scan_result.model_dump()
                        
                        from token_manager import generate_token
                        token = generate_token(email, scan_dict)
                        
                        send_report_email(
                            to_email=email,
                            token=token,
                            hostname=scan_dict["hostname"],
                            score=scan_dict["score"],
                            grade=scan_dict["grade"],
                        )
                        print(f"Report sent to {email} for {url}")
                        
                        # Save report record
                        db.save_report(0, email, token)
                    except Exception as e:
                        print(f"Report generation error for {email}: {e}")

                threading.Thread(target=_generate_and_send, args=(email, url), daemon=True).start()

    return {"status": "ok"}
