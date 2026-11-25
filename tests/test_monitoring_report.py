import unittest
from typing import cast

from fastapi import HTTPException
from fastapi.routing import APIRoute
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.database import Base
from app.models.candidate import Candidate
from app.models.exam_session import ExamSession
from app.models.monitoring_event import MonitoringEvent
from app.core.security import get_current_admin_id
from app.routes.monitoring_event import get_session_report, record_event, router
from app.schemas.monitoring_event import (
    MonitoringEventCreate,
    SessionMonitoringReport,
)


class MonitoringReportTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        self.db = sessionmaker(bind=self.engine)()

        candidate = Candidate(
            name="Report Test",
            email="report-test@example.com",
            password_hash="test-hash",
        )
        self.db.add(candidate)
        self.db.flush()

        session = ExamSession(candidate_id=candidate.id, status="IN_PROGRESS")
        self.db.add(session)
        self.db.flush()
        self.session_id = cast(int, session.id)

        self.db.add_all(
            [
                MonitoringEvent(session_id=session.id, event_type="TAB_HIDDEN"),
                MonitoringEvent(session_id=session.id, event_type="FACE_MISSING"),
                MonitoringEvent(
                    session_id=session.id,
                    event_type="CAMERA_UNAVAILABLE",
                ),
            ]
        )
        self.db.commit()

    def tearDown(self):
        self.db.close()
        self.engine.dispose()

    def test_report_contains_full_counts_score_and_timeline(self):
        report_data = get_session_report(self.session_id, self.db)
        report = SessionMonitoringReport(**report_data)

        self.assertEqual(report.total_events, 3)
        self.assertEqual(report.event_counts["TAB_HIDDEN"], 1)
        self.assertEqual(report.event_counts["FACE_MISSING"], 1)
        self.assertEqual(report.event_counts["CAMERA_UNAVAILABLE"], 1)
        self.assertEqual(report.integrity_score, 75)
        self.assertEqual(report.score_penalties["CAMERA_UNAVAILABLE"], 0)
        self.assertEqual(len(report.events), 3)
        self.assertEqual(report.session_status, "IN_PROGRESS")

    def test_report_returns_not_found_for_unknown_session(self):
        with self.assertRaises(HTTPException) as error:
            get_session_report(999, self.db)

        self.assertEqual(error.exception.status_code, 404)

    def test_report_route_requires_admin_dependency(self):
        report_route = next(
            route
            for route in router.routes
            if isinstance(route, APIRoute)
            and route.path == "/sessions/{session_id}/report"
        )
        dependencies = {
            dependency.call
            for dependency in report_route.dependant.dependencies
        }

        self.assertIn(get_current_admin_id, dependencies)

    def test_repeated_event_type_is_rejected_during_cooldown(self):
        self.db.query(MonitoringEvent).delete()
        self.db.commit()
        payload = MonitoringEventCreate(event_type="TAB_HIDDEN")

        record_event(self.session_id, payload, self.db, 1)
        with self.assertRaises(HTTPException) as error:
            record_event(self.session_id, payload, self.db, 1)

        self.assertEqual(error.exception.status_code, 429)
        self.assertEqual(
            (error.exception.headers or {}).get("Retry-After"),
            "5",
        )

        different_event = record_event(
            self.session_id,
            MonitoringEventCreate(event_type="WINDOW_BLUR"),
            self.db,
            1,
        )
        self.assertEqual(different_event.event_type, "WINDOW_BLUR")


if __name__ == "__main__":
    unittest.main()
