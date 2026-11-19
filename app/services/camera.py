import os
from pathlib import Path
import cv2

# Define path to the uploads directory in project root
BASE_DIR = Path(__file__).resolve().parents[2]
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)


def capture_registration_photo(candidate_id: int) -> str | None:
    """
    Opens the candidate's webcam using OpenCV, displays a live preview,
    and captures a frame when the user presses SPACEBAR.
    
    Returns the file path of the saved photo, or None if cancelled.
    """
    # 0 accesses the default integrated webcam
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        raise RuntimeError("Unable to access the webcam. Please check your camera connection/permissions.")

    saved_photo_path = None

    try:
        while True:
            # Read a single frame from the camera stream
            ret, frame = cap.read()
            if not ret:
                break

            # Overlay instructional text onto the live video feed
            display_frame = frame.copy()
            cv2.putText(
                display_frame,
                "Press SPACE to Capture | Press Q to Cancel",
                (30, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2
            )

            # Show the video feed in a popup window
            cv2.imshow("ExamGuard - Candidate Registration Photo", display_frame)

            # Wait 1ms for keyboard input
            key = cv2.waitKey(1) & 0xFF

            # If user presses SPACEBAR (ASCII 32) or 's' -> Save photo
            if key == 32 or key == ord('s'):
                filename = f"candidate_{candidate_id}.jpg"
                file_dest = UPLOADS_DIR / filename
                
                # Write the raw frame to disk
                cv2.imwrite(str(file_dest), frame)
                saved_photo_path = str(file_dest)
                break

            # If user presses 'q' or ESC (ASCII 27) -> Exit without saving
            elif key == ord('q') or key == 27:
                break

    finally:
        # Always release camera hardware and close all GUI windows
        cap.release()
        cv2.destroyAllWindows()

    return saved_photo_path