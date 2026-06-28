'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const router = useRouter();

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('researchHistory');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const examples = ['NVIDIA', 'Tesla', 'Apple', 'Reliance Industries', 'Palantir', 'Coinbase'];

  const handleSearch = async (company: string) => {
    if (!company.trim() || loading) return;
    
    setLoading(true);
    
    try {
      // Save to history
      const newHistory = [company.trim(), ...history.filter(h => h !== company.trim())].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('researchHistory', JSON.stringify(newHistory));
      
      // Store company name
      sessionStorage.setItem('researchCompany', company.trim());
      
      // Navigate to research page
      router.push('/research');
    } catch (error) {
      console.error('Search error:', error);
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('researchHistory');
  };

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Background Glow */}
      <div style={{
        position: 'fixed',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(ellipse at 50% 30%, rgba(0,255,136,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }}></div>

      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        marginBottom: '60px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            background: 'linear-gradient(135deg, #00ff88, #00ccff)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '900',
            fontSize: '20px',
            color: '#0a0a0f'
          }}>F</div>
          <div>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              letterSpacing: '2px',
              background: 'linear-gradient(135deg, #00ff88, #00ccff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>FINEXUS</div>
            <div style={{
              fontSize: '11px',
              fontWeight: '300',
              color: '#8892b0',
              letterSpacing: '3px',
              textTransform: 'uppercase'
            }}>AI INVEST · RESEARCH AGENT</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            background: 'rgba(20,20,30,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '20px',
            fontSize: '12px',
            color: '#8892b0'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              background: '#00ff88',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></span>
            GEMINI 3 FLASH · FAST
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '20px 0 50px',
        position: 'relative',
        zIndex: 1
      }}>
        <h1 style={{
          fontSize: '52px',
          fontWeight: '700',
          letterSpacing: '-1px',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #ffffff 0%, #00ff88 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>SHOULD YOU<br/>INVEST IN</h1>
        <p style={{
          fontSize: '18px',
          color: '#8892b0',
          maxWidth: '600px',
          margin: '0 auto 40px',
          lineHeight: '1.7',
          fontWeight: '300'
        }}>
          Type any company. Our agent pulls fundamentals, scans recent news, weighs
          the bull and bear case, and delivers an analyst-grade verdict with reasoning —
          in seconds.
        </p>

        {/* Search Box */}
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            gap: '12px',
            background: 'rgba(20,20,30,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '6px',
            backdropFilter: 'blur(20px)',
            transition: 'all 0.3s'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              color: '#8892b0',
              fontSize: '11px',
              borderRight: '1px solid rgba(255,255,255,0.06)'
            }}>GEMINI 3 FLASH</div>
            <input
              type="text"
              placeholder="e.g. NVIDIA, Tesla, Reliance Industries"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                padding: '14px 20px',
                color: '#ffffff',
                fontSize: '15px',
                outline: 'none'
              }}
            />
            <button 
              type="submit" 
              disabled={loading}
              style={{
                padding: '12px 32px',
                background: 'linear-gradient(135deg, #00ff88, #00ccff)',
                border: 'none',
                borderRadius: '12px',
                color: '#0a0a0f',
                fontWeight: '600',
                fontSize: '15px',
                cursor: 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.3s'
              }}
            >
              {loading ? 'ANALYZING...' : 'ANALYZE →'}
            </button>
          </form>

          {/* Example Companies */}
          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            marginTop: '18px',
            flexWrap: 'wrap'
          }}>
            {examples.map((company) => (
              <button
                key={company}
                onClick={() => {
                  setQuery(company);
                  handleSearch(company);
                }}
                disabled={loading}
                style={{
                  padding: '5px 16px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '20px',
                  color: '#4a4a5a',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#00ff88';
                  e.currentTarget.style.color = '#00ff88';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = '#4a4a5a';
                }}
              >
                {company}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* History Section */}
      {history.length > 0 && (
        <div style={{
          maxWidth: '640px',
          margin: '0 auto',
          padding: '20px 0',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{
              fontSize: '12px',
              color: '#8892b0',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>📋 HISTORY</span>
            <button
              onClick={clearHistory}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#4a4a5a',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Clear All
            </button>
          </div>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {history.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(item);
                  handleSearch(item);
                }}
                style={{
                  padding: '4px 14px',
                  background: 'rgba(20,20,30,0.6)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  color: '#8892b0',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#00ff88';
                  e.currentTarget.style.color = '#00ff88';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = '#8892b0';
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}