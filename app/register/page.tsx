'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/register', { name, email, password });
      if (response.status === 201) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="app-container">
        <div className="login-card">
          <div className="card">
            <h1>✅ Registration Successful!</h1>
            <p className="subtitle">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="login-card">
        <div className="card">
          <h1>📝 Register</h1>
          <p className="subtitle">Join FlatMate Expenses</p>
          
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
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>
          
          <p style={{ marginTop: '16px', fontSize: '14px' }}>
            Already have an account? <Link href="/login" style={{ color: '#667eea' }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}