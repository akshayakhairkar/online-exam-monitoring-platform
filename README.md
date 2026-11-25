# online-exam-monitoring-platform
An AI-powered online exam monitoring and integrity analytics platform.

## Candidate API authentication

Set a private `SECRET_KEY` of at least 32 characters in the project-root
`.env` file before starting the backend. Generate one with
`python -c "import secrets; print(secrets.token_urlsafe(32))"` and keep it
out of source control.

Candidate login returns a bearer token. Exam-session operations and candidate
photo capture require that token, and candidates can only manage their own
sessions. In Swagger, use **Authorize** and enter the token returned by login.

Admins can review the latest 100 monitoring events for a session from the
`/admin` page after signing in. The event-review API requires an admin token.

The candidate event API allows an event type to be recorded once per session
every 5 seconds. A repeated event within that cooldown receives HTTP 429 and a
`Retry-After` header. Admin report timestamps are displayed in Indian Standard
Time (IST); stored event timestamps remain UTC.

## Webcam face-presence monitoring

During an `IN_PROGRESS` exam, the candidate dashboard requests camera access
and checks for a face in the browser. A `FACE_MISSING` event is recorded after
8 seconds without a detected face; `CAMERA_UNAVAILABLE` is recorded if camera
access fails or the camera disconnects. Monitoring stops when the exam is
paused or submitted.

Video frames are processed locally and are not uploaded. Only monitoring event
types are sent to the backend. The face-detection model is served from the
frontend, while MediaPipe's WebAssembly runtime is loaded from jsDelivr, so
initialization requires an internet connection. Camera access requires
localhost or HTTPS and candidate permission.

## Module 3.1: Integrity analysis and session reports

Admins can load `/sessions/{session_id}/report` from the admin dashboard to
review the session status, event counts, integrity indicator, and complete
event timeline. Reports can be downloaded as CSV or JSON. The endpoint requires
an admin token.

The initial indicator is a transparent review aid: it starts at 100 and
subtracts 10 per `TAB_HIDDEN`, 5 per `WINDOW_BLUR`, and 15 per `FACE_MISSING`
event, with a floor of 0. `CAMERA_UNAVAILABLE` is counted and displayed but
does not lower the indicator because it may represent a technical problem.
This score is not proof of misconduct and must not be used as an automatic
disciplinary decision.
