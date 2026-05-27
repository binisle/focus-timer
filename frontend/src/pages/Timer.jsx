import { useState, useEffect, useRef } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Timer() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef(null);
  const FOCUS_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;

  useEffect(() => {
    fetch(`${API}/subjects`)
      .then(r => r.json())
      .then(data => {
        setSubjects(data);
        if (data.length > 0) setSelectedSubject(data[0].id);
      });
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            setFinished(true);
            if (!isBreak) {
              saveSession();
              setTimeout(() => {
                setIsBreak(true);
                setTimeLeft(BREAK_TIME);
                setFinished(false);
                setIsRunning(true);
              }, 2000);
            } else {
              setIsBreak(false);
              setTimeLeft(FOCUS_TIME);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const saveSession = () => {
    if (!selectedSubject) return;
    fetch(`${API}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject_id: Number(selectedSubject), duration: 25 })
    });
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(FOCUS_TIME);
    setFinished(false);
  };

  const addSubject = () => {
    if (!newSubject.trim()) return;
    fetch(`${API}/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newSubject })
    })
      .then(r => r.json())
      .then(data => {
        setSubjects(prev => [...prev, data]);
        setSelectedSubject(data.id);
        setNewSubject('');
      });
  };

  const deleteSubject = (id) => {
    fetch(`${API}/subjects/${id}`, { method: 'DELETE' })
      .then(() => setSubjects(prev => prev.filter(s => s.id !== id)));
  };

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');
  const total = isBreak ? BREAK_TIME : FOCUS_TIME;
  const progress = ((total - timeLeft) / total) * 100;
  const accent = isBreak ? '#4CAF50' : '#00BCD4';

  // 원형 진행 표시기
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a2e', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>

      {/* 아치형 타이머 카드 */}
      <div style={{
        width: 320,
        background: accent,
        borderRadius: '160px 160px 24px 24px',
        padding: '48px 32px 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: `0 0 60px ${accent}66`,
        marginBottom: 32,
        position: 'relative',
      }}>
        <p style={{ color: 'rgba(0,0,0,0.6)', fontWeight: 'bold', marginBottom: 24, letterSpacing: 2, fontSize: 13 }}>
          {isBreak ? '☕ BREAK TIME' : '🎯 FOCUS TIME'}
        </p>

        {/* 원형 진행 표시기 */}
        <div style={{ position: 'relative', width: 240, height: 240, marginBottom: 24 }}>
          <svg width="240" height="240" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
            <circle cx="120" cy="120" r={radius} fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="12" />
            <circle
              cx="120" cy="120" r={radius}
              fill="none"
              stroke="rgba(0,0,0,0.5)"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 56, fontWeight: 'bold', color: '#1a1a2e', fontFamily: 'monospace', lineHeight: 1 }}>
              {minutes}:{seconds}
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setIsRunning(!isRunning)}
            disabled={!selectedSubject && !isBreak}
            style={{
              padding: '12px 32px', fontSize: 16, borderRadius: 50,
              background: 'rgba(0,0,0,0.25)', color: '#1a1a2e',
              border: 'none', cursor: 'pointer', fontWeight: 'bold',
              backdropFilter: 'blur(10px)',
            }}
          >
            {isRunning ? '⏸' : '▶'}
          </button>
          <button
            onClick={reset}
            style={{
              padding: '12px 24px', fontSize: 16, borderRadius: 50,
              background: 'rgba(0,0,0,0.2)', color: '#1a1a2e',
              border: 'none', cursor: 'pointer', fontWeight: 'bold',
            }}
          >
            🔄
          </button>
        </div>

        {/* 완료 메시지 */}
        {finished && (
          <div style={{ marginTop: 16, color: '#1a1a2e', fontWeight: 'bold', fontSize: 14 }}>
            ✅ 세션 저장됨!
          </div>
        )}
      </div>

      {/* 과목 선택 */}
      <div style={{ width: '100%', maxWidth: 360, background: '#16213e', borderRadius: 16, padding: 24, marginBottom: 16 }}>
        <h3 style={{ color: accent, marginBottom: 16, fontSize: 14, letterSpacing: 2 }}>📚 SUBJECT</h3>
        <select
          value={selectedSubject}
          onChange={e => setSelectedSubject(e.target.value)}
          style={{
            width: '100%', padding: '10px 12px', marginBottom: 12,
            borderRadius: 10, border: `1px solid ${accent}44`,
            background: '#1a1a2e', color: 'white', fontSize: 14,
          }}
        >
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={newSubject}
            onChange={e => setNewSubject(e.target.value)}
            placeholder="새 과목 추가..."
            onKeyDown={e => e.key === 'Enter' && addSubject()}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 10,
              border: `1px solid ${accent}44`, background: '#1a1a2e',
              color: 'white', fontSize: 14,
            }}
          />
          <button
            onClick={addSubject}
            style={{
              padding: '10px 18px', borderRadius: 10,
              background: accent, color: '#1a1a2e',
              border: 'none', cursor: 'pointer', fontWeight: 'bold',
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* 과목 관리 */}
      <div style={{ width: '100%', maxWidth: 360, background: '#16213e', borderRadius: 16, padding: 24 }}>
        <h3 style={{ color: accent, marginBottom: 16, fontSize: 14, letterSpacing: 2 }}>📋 MANAGE</h3>
        {subjects.map(s => (
          <div key={s.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 0', borderBottom: '1px solid #ffffff11',
          }}>
            <span style={{ color: 'white', fontSize: 14 }}>{s.name}</span>
            <button
              onClick={() => deleteSubject(s.id)}
              style={{
                padding: '4px 12px', borderRadius: 8,
                background: '#ff444422', color: '#ff6666',
                border: '1px solid #ff444433', cursor: 'pointer', fontSize: 12,
              }}
            >
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}