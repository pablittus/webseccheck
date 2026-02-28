"""Simple in-memory rate limiter for WebSecCheck."""

import time
import threading
from collections import defaultdict


class RateLimiter:
    def __init__(self):
        self._lock = threading.Lock()
        self.requests: dict[str, list[tuple[float, str]]] = defaultdict(list)
        # Start cleanup thread
        self._cleanup_thread = threading.Thread(target=self._periodic_cleanup, daemon=True)
        self._cleanup_thread.start()

    def _periodic_cleanup(self):
        while True:
            time.sleep(3600)
            self.cleanup()

    def cleanup(self):
        cutoff = time.time() - 3600
        with self._lock:
            to_delete = []
            for ip, entries in self.requests.items():
                self.requests[ip] = [(ts, ep) for ts, ep in entries if ts > cutoff]
                if not self.requests[ip]:
                    to_delete.append(ip)
            for ip in to_delete:
                del self.requests[ip]

    def check(self, ip: str, endpoint: str, max_per_minute: int, max_per_hour: int) -> dict:
        """
        Returns dict with:
          - allowed: bool
          - limit: int (hourly)
          - remaining: int
          - reset: int (timestamp)
          - retry_after: int (seconds)
        """
        now = time.time()
        minute_ago = now - 60
        hour_ago = now - 3600

        with self._lock:
            entries = self.requests[ip]
            # Filter to this endpoint
            ep_entries = [ts for ts, ep in entries if ep == endpoint]

            count_minute = sum(1 for ts in ep_entries if ts > minute_ago)
            count_hour = sum(1 for ts in ep_entries if ts > hour_ago)

            if count_minute >= max_per_minute:
                oldest_in_minute = min((ts for ts in ep_entries if ts > minute_ago), default=now)
                return {
                    "allowed": False,
                    "limit": max_per_hour,
                    "remaining": max(0, max_per_hour - count_hour),
                    "reset": int(oldest_in_minute + 60),
                    "retry_after": int(oldest_in_minute + 60 - now) + 1,
                }

            if count_hour >= max_per_hour:
                oldest_in_hour = min((ts for ts in ep_entries if ts > hour_ago), default=now)
                return {
                    "allowed": False,
                    "limit": max_per_hour,
                    "remaining": 0,
                    "reset": int(oldest_in_hour + 3600),
                    "retry_after": int(oldest_in_hour + 3600 - now) + 1,
                }

            # Allowed - record it
            entries.append((now, endpoint))
            return {
                "allowed": True,
                "limit": max_per_hour,
                "remaining": max(0, max_per_hour - count_hour - 1),
                "reset": int(now + 3600),
                "retry_after": 0,
            }


# Singleton
limiter = RateLimiter()
