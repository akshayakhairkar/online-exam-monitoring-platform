from collections.abc import Mapping


EVENT_PENALTIES = {
    "TAB_HIDDEN": 10,
    "WINDOW_BLUR": 5,
    "FACE_MISSING": 15,
    "CAMERA_UNAVAILABLE": 0,
}
EVENT_COOLDOWN_SECONDS = 5


def calculate_integrity_score(event_counts: Mapping[str, int]) -> tuple[int, dict[str, int]]:
    penalties = {
        event_type: event_counts.get(event_type, 0) * penalty
        for event_type, penalty in EVENT_PENALTIES.items()
    }
    score = max(0, 100 - sum(penalties.values()))
    return score, penalties
