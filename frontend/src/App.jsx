import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CandidateRegister from './pages/CandidateRegister';
import CandidateLogin from './pages/CandidateLogin';
import AdminLogin from './pages/AdminLogin';
import ExamDashboard from './pages/ExamDashboard';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<CandidateRegister />} />
                <Route path="/register"        element={<CandidateRegister />} />
                <Route path="/login"           element={<CandidateLogin />} />
                <Route path="/admin-login"     element={<AdminLogin />} />
                <Route path="/exam"            element={<ExamDashboard />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;