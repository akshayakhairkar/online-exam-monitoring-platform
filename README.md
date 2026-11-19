# ExamGuard

ExamGuard is an Online Examination Monitoring and Integrity Analysis Platform.
This project currently contains the Stage 1 application foundation for Candidate
Authentication.

## Development

```bash
npm install
npm run dev
```

## Project structure

- `src/assets/` - Static images and other imported assets.
- `src/components/` - Reusable UI components and application layout.
- `src/pages/` - Route-level page components.
- `src/services/` - API clients and service integrations.
- `src/context/` - Shared React context providers and hooks.
- `src/styles/` - Shared or feature-level stylesheet location.
- `src/App.jsx` - Browser router and top-level application composition.
- `src/main.jsx` - React application entry point.

The current candidate flow includes the welcome page, frontend registration
validation, a mock Phone OTP Verification flow, and a registration success
destination. Use `123456` as the clearly labelled frontend test OTP. Account
creation, OTP delivery, and Google authentication require backend APIs and are
not connected. The OTP route keeps its navigation and verification boundary
ready for a future Python API integration. Admin dashboard, exam interface,
webcam monitoring, and analytics are intentionally not included.

The Admin Panel Stage 2 dashboard is available at `/admin/dashboard`. It
contains empty states until backend data is connected and includes routed
placeholders for Exam Management, Candidate Management, Live Monitoring,
Integrity Alerts, and Reports. These modules are not connected to backend data
or operational functionality.
