'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/login', { email, password });
      if (response.status === 200) {
        localStorage.setItem('token', 'logged_in');
        localStorage.setItem('user', JSON.stringify(response.data));
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="login-card">
        <div className="card">
          <h1>🔐 Login</h1>
          <p className="subtitle">Welcome back to FlatMate Expenses</p>
          
          {error && (
            <div style={{ 
              background: '#fef2f2', 
              color: '#dc2626', 
              padding: '12px', 
              borderRadius: '12px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <p style={{ marginTop: '16px', fontSize: '14px' }}>
            Don't have an account? <Link href="/register" style={{ color: '#667eea' }}>Register</Link>
          </p>
          
          <p className="demo-note">
            Demo: aisha@example.com / password123
          </p>
        </div>
      </div>
    </div>
  );
}