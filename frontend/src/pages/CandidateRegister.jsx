import { useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function CandidateRegister() {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let candidateId;

        try {
            const res = await API.post('/candidates/register', form);
            candidateId = res.data.candidate_id;
        } catch (err) {
            setMessage(`❌ ${err.response?.data?.detail || 'Registration failed'}`);
            return;
        }

        setMessage(`Candidate created (ID ${candidateId}). Check the camera window...`);

        try {
            await API.post(`/candidates/${candidateId}/capture-photo`);
            setMessage('✅ Registration and photo capture complete. Redirecting...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setMessage(
                `⚠️ Account created (ID ${candidateId}), but photo capture failed: ${err.response?.data?.detail || 'Check that the camera is available.'
                }`
            );
        }
    };

    return (
        <div style={styles.container}>
            <h2>Candidate Registration</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    name="name"
                    placeholder="Full Name"
                    onChange={handleChange}
                    style={styles.input}
                    required
                />
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    onChange={handleChange}
                    style={styles.input}
                    required
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password (min 8 chars)"
                    onChange={handleChange}
                    style={styles.input}
                    required
                />
                <button type="submit" style={styles.button}>Register</button>
            </form>
            {message && <p>{message}</p>}
            <p>Already registered? <a href="/login">Login here</a></p>
        </div>
    );
}

const styles = {
    container: { maxWidth: '400px', margin: '80px auto', padding: '30px', border: '1px solid #ccc', borderRadius: '10px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    input: { padding: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ddd' },
    button: { padding: '12px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }
};
