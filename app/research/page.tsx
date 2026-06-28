'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResearchPage() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(0);
  const [time, setTime] = useState(0);
  const [company, setCompany] = useState('');
  const router = useRouter();

  const steps = ['RESOLVE_TICKER', 'FETCH_FUNDAMENTALS', 'SCAN_NEWS', 'ANALYZE_SENTIMENT', 'WEIGH_THESIS', 'SYNTHESIZE_VERDICT'];

  useEffect(() => {
    const name = sessionStorage.getItem('researchCompany');
    if (!name) {
      router.push('/');
      return;
    }
    setCompany(name);
    doResearch(name);
  }, []);

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [loading]);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setStep(s => {
          if (s < steps.length - 1) return s + 1;
          return s;
        });
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const doResearch = async (name) => {
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => router.push('/');

  const fmtTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  // Error
  if (error) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ maxWidth: '400px', margin: '80px auto', padding: '40px', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.15)', borderRadius: '16px', textAlign: 'center' }}>
          <h3 style={{ color: '#ff6b6b' }}>Error</h3>
          <p style={{ color: '#8892b0', margin: '16px 0' }}>{error}</p>
          <button onClick={goBack} style={{ padding: '10px 24px', background: '#00ff88', border: 'none', borderRadius: '12px', color: '#0a0a0f', fontWeight: '600', cursor: 'pointer' }}>Go Back</button>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #00ff88, #00ccff)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '20px', color: '#0a0a0f' }}>F</div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '2px', background: 'linear-gradient(135deg, #00ff88, #00ccff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FINEXUS</div>
              <div style={{ fontSize: '11px', fontWeight: '300', color: '#8892b0', letterSpacing: '3px', textTransform: 'uppercase' }}>AI INVEST · RESEARCH AGENT</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(20,20,30,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', fontSize: '12px', color: '#8892b0' }}>
              <span style={{ width: '6px', height: '6px', background: '#00ff88', borderRadius: '50%', animation: 'pulse 0.5s infinite' }}></span>
              AGENT.RUNNING
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: '#8892b0' }}>
              <span>target: {company}</span>
              <span style={{ color: '#4a4a5a' }}>·</span>
              <span>model: gemini-fast</span>
            </div>
          </div>
        </div>

        {/* Processing */}
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 style={{ fontSize: '20px', color: '#00ff88', letterSpacing: '1px' }}>AGENT.RUNNING</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8892b0', fontSize: '14px' }}>
              <span>⏱️ {fmtTime(time)}</span>
            </div>
          </div>

          {steps.map((s, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '14px 20px',
              background: 'rgba(20,20,30,0.8)',
              border: i === step ? '1px solid #00ff88' : i < step ? '1px solid rgba(0,255,136,0.2)' : '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px',
              marginBottom: '10px',
              opacity: i <= step ? 1 : 0.3
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                borderRadius: '50%',
                background: i === step ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.05)'
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10px', color: '#4a4a5a', letterSpacing: '1px' }}>STEP {i + 1}</div>
                <div style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff' }}>{s}</div>
              </div>
              {i === step && (
                <div style={{ width: '14px', height: '14px', border: '2px solid #00ff88', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              )}
              {i < step && (
                <div style={{ color: '#00ff88', fontSize: '16px', fontWeight: '700' }}>✓</div>
              )}
            </div>
          ))}

          <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '14px', padding: '16px 20px', border: '1px solid rgba(255,255,255,0.06)', maxHeight: '200px', overflowY: 'auto', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#8892b0', fontSize: '11px' }}>
              <span>AGENT.TRACE.LOG</span>
              <span>updating...</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '11px' }}>
              <span style={{ color: '#4a4a5a', minWidth: '40px' }}>[002]</span>
              <span style={{ minWidth: '45px', fontWeight: '600', fontSize: '10px', color: '#ffc107' }}>THINK</span>
              <span style={{ color: '#8892b0' }}>I need to identify the publicly-listed ticker for '{company}'.</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '11px' }}>
              <span style={{ color: '#4a4a5a', minWidth: '40px' }}>[003]</span>
              <span style={{ minWidth: '45px', fontWeight: '600', fontSize: '10px', color: '#00ff88' }}>ACT</span>
              <span style={{ color: '#8892b0' }}>resolve_ticker({'{'}company:'{company}'{'}'})</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '11px' }}>
              <span style={{ color: '#4a4a5a', minWidth: '40px' }}>[005]</span>
              <span style={{ minWidth: '45px', fontWeight: '600', fontSize: '10px', color: '#ffc107' }}>THINK</span>
              <span style={{ color: '#8892b0' }}>Pulling fundamentals from market data.</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden', marginBottom: '10px' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, #00ff88, #00ccff)', borderRadius: '2px', transition: 'width 0.5s ease', width: `${((step + 1) / steps.length) * 100}%` }}></div>
            </div>
            <span style={{ fontSize: '13px', color: '#8892b0' }}>Processing {step + 1} of {steps.length} steps...</span>
          </div>
        </div>

        <style>{`
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // Result
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #00ff88, #00ccff)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '20px', color: '#0a0a0f' }}>F</div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '2px', background: 'linear-gradient(135deg, #00ff88, #00ccff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FINEXUS</div>
            <div style={{ fontSize: '11px', fontWeight: '300', color: '#8892b0', letterSpacing: '3px', textTransform: 'uppercase' }}>AI INVEST · RESEARCH AGENT</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={goBack} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: '#8892b0', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px' }}>New Search</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: '#8892b0' }}>
            <span style={{ color: '#00ff88' }}>✓ COMPLETE</span>
            <span style={{ color: '#4a4a5a' }}>·</span>
            <span>{fmtTime(result?.processingTime || 60)}</span>
          </div>
        </div>
      </div>

      {result && (
        <div>
          {/* Verdict */}
          <div style={{ background: 'rgba(20,20,30,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px 28px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '26px', fontWeight: '600' }}>{result.company}</h2>
                <span style={{ color: '#8892b0', fontSize: '14px' }}>{result.ticker} • {result.exchange}</span>
              </div>
              <div style={{
                padding: '6px 18px',
                borderRadius: '20px',
                fontWeight: '600',
                fontSize: '13px',
                background: result.verdict === 'bullish' ? 'rgba(0,255,136,0.12)' : result.verdict === 'bearish' ? 'rgba(255,107,107,0.12)' : 'rgba(255,193,7,0.12)',
                color: result.verdict === 'bullish' ? '#00ff88' : result.verdict === 'bearish' ? '#ff6b6b' : '#ffc107',
                border: result.verdict === 'bullish' ? '1px solid rgba(0,255,136,0.2)' : result.verdict === 'bearish' ? '1px solid rgba(255,107,107,0.2)' : '1px solid rgba(255,193,7,0.2)'
              }}>
                {result.verdict === 'bullish' ? 'BUY' : result.verdict === 'bearish' ? 'SELL' : 'HOLD'}
              </div>
            </div>
            <p style={{ color: '#8892b0', fontSize: '15px', lineHeight: '1.7' }}>{result.verdictSummary}</p>
          </div>

          {/* Fundamentals */}
          <div style={{ background: 'rgba(20,20,30,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px 28px', marginBottom: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '14px' }}>Fundamentals</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
              {[
                ['Price', `$${result.fundamentals.currentPrice.toFixed(2)}`],
                ['P/E', result.fundamentals.trailingPE.toFixed(1)],
                ['Revenue Growth', `${(result.fundamentals.revenueGrowth * 100).toFixed(1)}%`],
                ['Profit Margin', `${(result.fundamentals.profitMargins * 100).toFixed(1)}%`],
                ['Analyst Rating', result.fundamentals.recommendationKey.toUpperCase()]
              ].map(([label, value]) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ color: '#8892b0', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', marginTop: '3px', color: value.includes('%') ? '#00ff88' : '#ffffff' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Trace */}
          <div style={{ background: 'rgba(20,20,30,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px 28px', marginBottom: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '14px' }}>Agent Reasoning</div>
            <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '14px 18px', fontSize: '12px', maxHeight: '250px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#8892b0', fontSize: '11px' }}>
                <span>AGENT.TRACE.LOG</span>
                <span>{result.trace.length} steps</span>
              </div>
              {result.trace.map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '11px' }}>
                  <span style={{ color: '#4a4a5a', minWidth: '40px' }}>{t.id}</span>
                  <span style={{ minWidth: '45px', fontWeight: '600', fontSize: '10px', color: t.status === 'think' ? '#ffc107' : t.status === 'act' ? '#00ff88' : '#64b5f6' }}>{t.status.toUpperCase()}</span>
                  <span style={{ color: '#8892b0' }}>{t.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bull/Bear */}
          <div style={{ background: 'rgba(20,20,30,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px 28px', marginBottom: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '14px' }}>Investment Thesis</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.1)' }}>
                <h4 style={{ color: '#00ff88', marginBottom: '10px', fontSize: '14px' }}>BULL CASE</h4>
                {result.bullCase.map((p, i) => (
                  <div key={i} style={{ color: '#8892b0', fontSize: '13px', padding: '3px 0', paddingLeft: '14px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: '#00ff88' }}>▸</span>{p}
                  </div>
                ))}
              </div>
              <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255,107,107,0.04)', border: '1px solid rgba(255,107,107,0.1)' }}>
                <h4 style={{ color: '#ff6b6b', marginBottom: '10px', fontSize: '14px' }}>BEAR CASE</h4>
                {result.bearCase.map((p, i) => (
                  <div key={i} style={{ color: '#8892b0', fontSize: '13px', padding: '3px 0', paddingLeft: '14px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: '#ff6b6b' }}>▸</span>{p}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Risks */}
          <div style={{ background: 'rgba(20,20,30,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px 28px', marginBottom: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '14px' }}>Key Risks</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {result.keyRisks.map((r, i) => (
                <span key={i} style={{ padding: '4px 14px', background: 'rgba(255,107,107,0.06)', border: '1px solid rgba(255,107,107,0.12)', borderRadius: '14px', fontSize: '12px', color: '#ff6b6b' }}>{r}</span>
              ))}
            </div>
          </div>

          {/* News */}
          <div style={{ background: 'rgba(20,20,30,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px 28px' }}>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '14px' }}>Recent News</div>
            {result.news.map((n, i) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: i < result.news.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', color: '#8892b0', fontSize: '13px' }}>{n}</div>
            ))}
          </div>

          <div style={{ textAlign: 'center', color: '#4a4a5a', fontSize: '11px', marginTop: '16px' }}>
            Completed in {result.processingTime || 60}s • {new Date(result.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}