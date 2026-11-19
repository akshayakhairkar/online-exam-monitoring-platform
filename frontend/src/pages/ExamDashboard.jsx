import { useState } from 'react';
import API from '../api/axios';

export default function ExamDashboard() {
    const [candidateId, setCandidateId] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [status, setStatus] = useState('');
    const [message, setMessage] = useState('');

    const startExam = async () => {
        try {
            const res = await API.post('/sessions/start', { candidate_id: parseInt(candidateId) });
            setSessionId(res.data.id);
            setStatus(res.data.status);
            setMessage(`✅ Exam started! Session ID: ${res.data.id}`);
        } catch (err) {
            setMessage(`❌ ${err.response?.data?.detail}`);
        }
    };

    const pauseExam = async () => {
        const res = await API.post(`/sessions/${sessionId}/pause`);
        setStatus(res.data.status);
        setMessage('⏸️ Exam paused.');
    };

    const resumeExam = async () => {
        const res = await API.post(`/sessions/${sessionId}/resume`);
        setStatus(res.data.status);
        setMessage('▶️ Exam resumed.');
    };

    const submitExam = async () => {
        const res = await API.post(`/sessions/${sessionId}/submit`);
        setStatus(res.data.status);
        setMessage(`✅ Exam submitted at ${new Date(res.data.end_time).toLocaleTimeString()}`);
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2>📝 Exam Dashboard</h2>
                <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </div>

            {!sessionId ? (
                <div>
                    <input
                        placeholder="Enter your Candidate ID"
                        value={candidateId}
                        onChange={(e) => setCandidateId(e.target.value)}
                        style={styles.input}
                    />
                    <button onClick={startExam} style={styles.startBtn}>▶ Start Exam</button>
                </div>
            ) : (
                <div>
                    <div style={styles.statusBox}>
                        <p><strong>Session ID:</strong> {sessionId}</p>
                        <p><strong>Status:</strong> <span style={{ color: statusColor(status) }}>{status}</span></p>
                    </div>
                    <div style={styles.buttonRow}>
                        <button onClick={pauseExam} disabled={status !== 'IN_PROGRESS'} style={styles.pauseBtn}>⏸ Pause</button>
                        <button onClick={resumeExam} disabled={status !== 'PAUSED'} style={styles.resumeBtn}>▶ Resume</button>
                        <button onClick={submitExam} disabled={status === 'SUBMITTED'} style={styles.submitBtn}>✅ Submit</button>
                    </div>
                </div>
            )}
            {message && <p style={styles.message}>{message}</p>}
        </div>
    );
}

const statusColor = (s) => ({ IN_PROGRESS: 'green', PAUSED: 'orange', SUBMITTED: 'blue' }[s] || 'gray');

const styles = {
    container: { maxWidth: '500px', margin: '60px auto', padding: '30px', border: '1px solid #ccc', borderRadius: '10px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    input: { width: '100%', padding: '10px', fontSize: '16px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ddd' },
    startBtn: { width: '100%', padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' },
    statusBox: { background: '#f9fafb', padding: '15px', borderRadius: '8px', marginBottom: '20px' },
    buttonRow: { display: 'flex', gap: '10px' },
    pauseBtn: { flex: 1, padding: '12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    resumeBtn: { flex: 1, padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    submitBtn: { flex: 1, padding: '12px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    logoutBtn: { padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    message: { marginTop: '20px', fontWeight: 'bold' }
};
