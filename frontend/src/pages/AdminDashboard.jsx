import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import formatDateTime from '../utils/formatDateTime';

const EVENT_LABELS = {
    TAB_HIDDEN: 'Exam tab hidden',
    WINDOW_BLUR: 'Exam window lost focus',
    FACE_MISSING: 'No face detected for 8+ seconds',
    CAMERA_UNAVAILABLE: 'Camera unavailable',
};

const downloadFile = (content, filename, contentType) => {
    const url = URL.createObjectURL(new Blob([content], { type: contentType }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export default function AdminDashboard() {
    const [sessionId, setSessionId] = useState('');
    const [report, setReport] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token') || localStorage.getItem('role') !== 'admin') {
            navigate('/admin-login', { replace: true });
        }
    }, [navigate]);

    const fetchReport = async (targetSessionId) => {
        setMessage('');
        setLoading(true);

        try {
            const response = await API.get(`/sessions/${targetSessionId}/report`);
            setReport(response.data);
            if (response.data.total_events === 0) {
                setMessage('No events have been recorded for this session.');
            }
        } catch (error) {
            setMessage(error.response?.data?.detail || 'Could not load the session report.');
        } finally {
            setLoading(false);
        }
    };

    const loadReport = (event) => {
        event.preventDefault();
        setReport(null);
        void fetchReport(sessionId);
    };

    const refreshReport = () => {
        if (report) {
            void fetchReport(report.session_id);
        }
    };

    const downloadCsv = () => {
        const rows = [
            ['Session ID', report.session_id],
            ['Session status', report.session_status],
            ['Started at (IST)', formatDateTime(report.start_time) || ''],
            ['Submitted at (IST)', formatDateTime(report.end_time) || ''],
            ['Total events', report.total_events],
            ['Integrity indicator', report.integrity_score],
            [],
            ['Event type', 'Count', 'Score penalty'],
            ...Object.entries(report.event_counts).map(([eventType, count]) => [
                eventType,
                count,
                report.score_penalties[eventType] ?? 0,
            ]),
            [],
            ['Event', 'Event type', 'Recorded at (IST)'],
            ...report.events.map((item) => [
                EVENT_LABELS[item.event_type] || item.event_type,
                item.event_type,
                formatDateTime(item.occurred_at),
            ]),
        ];
        const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
        downloadFile(
            `\uFEFF${csv}`,
            `session-${report.session_id}-report.csv`,
            'text/csv;charset=utf-8'
        );
    };

    const downloadJson = () => {
        downloadFile(
            JSON.stringify(report, null, 2),
            `session-${report.session_id}-report.json`,
            'application/json'
        );
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/admin-login', { replace: true });
    };

    return (
        <main style={styles.container}>
            <header style={styles.header}>
                <h1>Session Integrity Reports</h1>
                <button type="button" onClick={logout} style={styles.button}>
                    Logout
                </button>
            </header>

            <form onSubmit={loadReport} style={styles.form}>
                <label htmlFor="session-id">Session ID</label>
                <input
                    id="session-id"
                    type="number"
                    min="1"
                    value={sessionId}
                    onChange={(event) => setSessionId(event.target.value)}
                    required
                    style={styles.input}
                />
                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? 'Loading...' : 'Load report'}
                </button>
            </form>

            {message && <p role="status">{message}</p>}

            {report && (
                <section aria-label={`Report for session ${report.session_id}`}>
                    <div style={styles.reportHeader}>
                        <div>
                            <h2>Session {report.session_id}</h2>
                            <p>Status: {report.session_status}</p>
                            <p>
                                Started: {report.start_time
                                    ? formatDateTime(report.start_time)
                                    : 'Not started'}
                            </p>
                            <p>
                                Submitted: {report.end_time
                                    ? formatDateTime(report.end_time)
                                    : 'Not submitted'}
                            </p>
                        </div>
                        <div style={styles.downloads}>
                            <button
                                type="button"
                                onClick={refreshReport}
                                disabled={loading}
                                style={styles.button}
                            >
                                {loading ? 'Refreshing...' : 'Refresh report'}
                            </button>
                            <button type="button" onClick={downloadCsv} style={styles.button}>
                                Download CSV
                            </button>
                            <button type="button" onClick={downloadJson} style={styles.button}>
                                Download JSON
                            </button>
                        </div>
                    </div>

                    <h3>Integrity indicator: {report.integrity_score}/100</h3>
                    <p style={styles.notice}>
                        This is a rule-based review aid, not proof of misconduct.
                        Camera-unavailable events are reported but do not reduce the score.
                    </p>

                    <h3>Event summary ({report.total_events} total)</h3>
                    <div style={styles.summary}>
                        {Object.entries(report.event_counts).map(([eventType, count]) => (
                            <div key={eventType} style={styles.summaryItem}>
                                <strong>{count}</strong>
                                <span>{EVENT_LABELS[eventType] || eventType}</span>
                                <small>
                                    Score penalty: {report.score_penalties[eventType] ?? 0}
                                </small>
                            </div>
                        ))}
                    </div>

                    <h3>Event timeline</h3>
                    {report.events.length > 0 ? (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.cell}>Event</th>
                                    <th style={styles.cell}>Recorded at</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.events.map((item) => (
                                    <tr key={item.id}>
                                        <td style={styles.cell}>
                                            <strong>
                                                {EVENT_LABELS[item.event_type] || item.event_type}
                                            </strong>
                                            <br />
                                            <small>{item.event_type}</small>
                                        </td>
                                        <td style={styles.cell}>
                                            {formatDateTime(item.occurred_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No events to show.</p>
                    )}
                </section>
            )}
        </main>
    );
}

const styles = {
    container: { maxWidth: '900px', margin: '50px auto', padding: '24px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    form: { display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' },
    input: { padding: '8px', width: '140px' },
    button: { padding: '9px 14px', cursor: 'pointer' },
    reportHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '16px',
        marginTop: '24px',
    },
    downloads: { display: 'flex', gap: '8px' },
    notice: { padding: '12px', background: '#fff7ed', borderRadius: '6px' },
    summary: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '12px',
    },
    summaryItem: {
        display: 'grid',
        gap: '6px',
        padding: '14px',
        border: '1px solid #ddd',
        borderRadius: '8px',
    },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    cell: { borderBottom: '1px solid #ddd', padding: '10px' },
};
