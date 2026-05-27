import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [rangeFilter, setRangeFilter] = useState('all');

  const fetchSessions = () => {
    let url = `${API}/sessions?range=${rangeFilter}`;
    if (subjectFilter) url += `&subject_id=${subjectFilter}`;
    fetch(url)
      .then(r => r.json())
      .then(setSessions);
  };

  useEffect(() => {
    fetch(`${API}/subjects`)
      .then(r => r.json())
      .then(setSubjects);
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [subjectFilter, rangeFilter]);

  const deleteSession = (id) => {
    fetch(`${API}/sessions/${id}`, { method: 'DELETE' })
      .then(() => setSessions(prev => prev.filter(s => s.id !== id)));
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('ko-KR') + ' ' + d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2>📋 히스토리</h2>

      {/* 필터 */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <select
          value={subjectFilter}
          onChange={e => setSubjectFilter(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
        >
          <option value="">전체 과목</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select
          value={rangeFilter}
          onChange={e => setRangeFilter(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
        >
          <option value="all">전체 기간</option>
          <option value="week">이번 주</option>
          <option value="month">이번 달</option>
        </select>
      </div>

      {/* 세션 목록 */}
      {sessions.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center' }}>세션이 없습니다.</p>
      ) : (
        sessions.slice().reverse().map(s => (
          <div key={s.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 16px', marginBottom: 8,
            background: '#f8f9fa', borderRadius: 8, border: '1px solid #eee'
          }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>{s.subject_name}</div>
              <div style={{ fontSize: 13, color: '#666' }}>{formatDate(s.created_at)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontWeight: 'bold', color: '#007bff' }}>{s.duration}분</span>
              <button
                onClick={() => deleteSession(s.id)}
                style={{ padding: '4px 10px', borderRadius: 6, background: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}
              >
                삭제
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}