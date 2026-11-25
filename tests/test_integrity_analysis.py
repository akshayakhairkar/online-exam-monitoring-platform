import unittest

from app.services.integrity_analysis import calculate_integrity_score


class IntegrityAnalysisTests(unittest.TestCase):
    def test_score_uses_documented_event_penalties(self):
        score, penalties = calculate_integrity_score(
            {
                "TAB_HIDDEN": 1,
                "WINDOW_BLUR": 2,
                "FACE_MISSING": 1,
                "CAMERA_UNAVAILABLE": 1,
            }
        )

        self.assertEqual(score, 65)
        self.assertEqual(
            penalties,
            {
                "TAB_HIDDEN": 10,
                "WINDOW_BLUR": 10,
                "FACE_MISSING": 15,
                "CAMERA_UNAVAILABLE": 0,
            },
        )

    def test_score_does_not_fall_below_zero(self):
        score, _ = calculate_integrity_score({"FACE_MISSING": 10})

        self.assertEqual(score, 0)

    def test_empty_session_starts_at_one_hundred(self):
        score, penalties = calculate_integrity_score({})

        self.assertEqual(score, 100)
        self.assertEqual(set(penalties.values()), {0})


if __name__ == "__main__":
    unittest.main()
