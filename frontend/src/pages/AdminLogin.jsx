import { useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/auth/admin-login', form);
            localStorage.setItem('token', res.data.access_token);
            localStorage.setItem('role', 'admin');
            setMessage('✅ Admin login successful!');
            setTimeout(() => navigate('/admin'), 1500);
        } catch (err) {
            setMessage(`❌ ${err.response?.data?.detail || 'Login failed'}`);
        }
    };

    return (
        <div style={styles.container}>
            <h2>Admin Login</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <input name="username" placeholder="Username" onChange={handleChange} style={styles.input} required />
                <input name="password" type="password" placeholder="Password" onChange={handleChange} style={styles.input} required />
                <button type="submit" style={styles.button}>Admin Login</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

const styles = {
    container: { maxWidth: '400px', margin: '80px auto', padding: '30px', border: '1px solid #ccc', borderRadius: '10px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    input: { padding: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ddd' },
    button: { padding: '12px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }
};