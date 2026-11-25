import asyncio
import json
import unittest

from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import hash_password
from app.database.database import Base, get_db
from app.models.admin import Admin
from app.models.candidate import Candidate
from app.routes.auth import router as auth_router
from app.routes.exam_session import router as session_router
from app.routes.monitoring_event import router as monitoring_event_router


class ExamMonitoringFlowTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(self.engine)
        self.session_factory = sessionmaker(bind=self.engine)

        with self.session_factory() as db:
            db.add_all(
                [
                    Candidate(
                        name="Candidate One",
                        email="candidate1@example.com",
                        password_hash=hash_password("candidate-one-pass"),
                    ),
                    Candidate(
                        name="Candidate Two",
                        email="candidate2@example.com",
                        password_hash=hash_password("candidate-two-pass"),
                    ),
                    Admin(
                        username="invigilator",
                        password_hash=hash_password("admin-test-pass"),
                    ),
                ]
            )
            db.commit()

        self.app = FastAPI()
        self.app.include_router(auth_router)
        self.app.include_router(session_router)
        self.app.include_router(monitoring_event_router)

        def override_get_db():
            with self.session_factory() as db:
                yield db

        self.app.dependency_overrides[get_db] = override_get_db

    def tearDown(self):
        self.engine.dispose()

    def request(self, method, path, body=None, token=None):
        raw_body = b"" if body is None else json.dumps(body).encode("utf-8")
        headers = [(b"host", b"testserver")]
        if body is not None:
            headers.append((b"content-type", b"application/json"))
        if token:
            headers.append((b"authorization", f"Bearer {token}".encode("ascii")))

        messages = []
        body_sent = False

        async def receive():
            nonlocal body_sent
            if not body_sent:
                body_sent = True
                return {
                    "type": "http.request",
                    "body": raw_body,
                    "more_body": False,
                }
            return {"type": "http.disconnect"}

        async def send(message):
            messages.append(message)

        scope = {
            "type": "http",
            "asgi": {"version": "3.0"},
            "http_version": "1.1",
            "method": method,
            "scheme": "http",
            "path": path,
            "raw_path": path.encode("ascii"),
            "query_string": b"",
            "root_path": "",
            "headers": headers,
            "client": ("127.0.0.1", 12345),
            "server": ("testserver", 80),
        }
        asyncio.run(self.app(scope, receive, send))

        response_start = next(
            message for message in messages
            if message["type"] == "http.response.start"
        )
        response_body = b"".join(
            message.get("body", b"")
            for message in messages
            if message["type"] == "http.response.body"
        )
        response_headers = {
            key.decode("latin-1").lower(): value.decode("latin-1")
            for key, value in response_start["headers"]
        }
        decoded_body = json.loads(response_body) if response_body else None
        return response_start["status"], response_headers, decoded_body

    def login_candidate(self, email, password):
        status_code, _, response = self.request(
            "POST",
            "/auth/login",
            {"email": email, "password": password},
        )
        self.assertEqual(status_code, 200)
        return response["access_token"]

    def test_candidate_session_event_and_admin_review_flow(self):
        status_code, _, _ = self.request("POST", "/sessions/start")
        self.assertEqual(status_code, 401)

        candidate_one_token = self.login_candidate(
            "candidate1@example.com",
            "candidate-one-pass",
        )
        candidate_two_token = self.login_candidate(
            "candidate2@example.com",
            "candidate-two-pass",
        )
        status_code, _, admin_login = self.request(
            "POST",
            "/auth/admin-login",
            {"username": "invigilator", "password": "admin-test-pass"},
        )
        self.assertEqual(status_code, 200)
        admin_token = admin_login["access_token"]

        status_code, _, _ = self.request(
            "POST",
            "/sessions/start",
            token=admin_token,
        )
        self.assertEqual(status_code, 403)

        status_code, _, session = self.request(
            "POST",
            "/sessions/start",
            token=candidate_one_token,
        )
        self.assertEqual(status_code, 200)
        session_id = session["id"]

        status_code, _, _ = self.request(
            "GET",
            f"/sessions/{session_id}",
            token=candidate_two_token,
        )
        self.assertEqual(status_code, 404)

        event_path = f"/sessions/{session_id}/events"
        status_code, _, _ = self.request(
            "POST",
            event_path,
            {"event_type": "FACE_MISSING"},
        )
        self.assertEqual(status_code, 401)

        status_code, _, _ = self.request(
            "POST",
            event_path,
            {"event_type": "TAB_HIDDEN"},
            token=candidate_two_token,
        )
        self.assertEqual(status_code, 404)

        status_code, _, _ = self.request(
            "POST",
            event_path,
            {"event_type": "FACE_MISSING"},
            token=candidate_one_token,
        )
        self.assertEqual(status_code, 201)

        status_code, response_headers, _ = self.request(
            "POST",
            event_path,
            {"event_type": "FACE_MISSING"},
            token=candidate_one_token,
        )
        self.assertEqual(status_code, 429)
        self.assertEqual(response_headers["retry-after"], "5")

        for event_type in ("TAB_HIDDEN", "WINDOW_BLUR", "CAMERA_UNAVAILABLE"):
            status_code, _, _ = self.request(
                "POST",
                event_path,
                {"event_type": event_type},
                token=candidate_one_token,
            )
            self.assertEqual(status_code, 201)

        report_path = f"/sessions/{session_id}/report"
        status_code, _, _ = self.request(
            "GET",
            report_path,
            token=candidate_one_token,
        )
        self.assertEqual(status_code, 403)

        status_code, _, report = self.request("GET", report_path, token=admin_token)
        self.assertEqual(status_code, 200)
        self.assertEqual(report["total_events"], 4)
        self.assertEqual(report["event_counts"]["FACE_MISSING"], 1)
        self.assertEqual(report["event_counts"]["CAMERA_UNAVAILABLE"], 1)

        status_code, _, paused = self.request(
            "POST",
            f"/sessions/{session_id}/pause",
            token=candidate_one_token,
        )
        self.assertEqual(status_code, 200)
        self.assertEqual(paused["status"], "PAUSED")

        status_code, _, _ = self.request(
            "POST",
            event_path,
            {"event_type": "CAMERA_UNAVAILABLE"},
            token=candidate_one_token,
        )
        self.assertEqual(status_code, 400)

        status_code, _, resumed = self.request(
            "POST",
            f"/sessions/{session_id}/resume",
            token=candidate_one_token,
        )
        self.assertEqual(status_code, 200)
        self.assertEqual(resumed["status"], "IN_PROGRESS")

        status_code, _, submitted = self.request(
            "POST",
            f"/sessions/{session_id}/submit",
            token=candidate_one_token,
        )
        self.assertEqual(status_code, 200)
        self.assertEqual(submitted["status"], "SUBMITTED")

        status_code, _, _ = self.request(
            "POST",
            event_path,
            {"event_type": "CAMERA_UNAVAILABLE"},
            token=candidate_one_token,
        )
        self.assertEqual(status_code, 400)

        status_code, _, final_report = self.request(
            "GET",
            report_path,
            token=admin_token,
        )
        self.assertEqual(status_code, 200)
        self.assertEqual(final_report["session_status"], "SUBMITTED")
        self.assertEqual(final_report["total_events"], 4)


if __name__ == "__main__":
    unittest.main()
