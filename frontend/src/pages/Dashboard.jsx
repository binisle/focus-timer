import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${API}/stats`)
      .then(r => r.json())
      .then(setStats);
  }, []);

  if (!stats) return <p style={{ padding: 24 }}>Loading...</p>;

  const weekdayData = Object.entries(stats.by_weekday).map(([day, minutes]) => ({
    day, minutes
  }));

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <h2>📊 대시보드</h2>

      {/* 통계 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <div style={{ background: '#007bff', color: 'white', padding: 20, borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 'bold' }}>{stats.streak}</div>
          <div style={{ fontSize: 14 }}>🔥 연속 일수</div>
        </div>
        <div style={{ background: '#28a745', color: 'white', padding: 20, borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 'bold' }}>{stats.total_hours}h</div>
          <div style={{ fontSize: 14 }}>⏱ 총 집중 시간</div>
        </div>
        <div style={{ background: '#fd7e14', color: 'white', padding: 20, borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 'bold' }}>{stats.sessions_this_week}</div>
          <div style={{ fontSize: 14 }}>📅 이번 주 세션</div>
        </div>
      </div>

      {/* 과목별 차트 */}
      <h3>📚 과목별 집중 시간 (분)</h3>
      {stats.by_subject.length === 0 ? (
        <p style={{ color: '#888' }}>데이터가 없습니다.</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={stats.by_subject}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="minutes" fill="#007bff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* 요일별 차트 */}
      <h3 style={{ marginTop: 32 }}>📅 요일별 집중 시간 (분)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={weekdayData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="minutes" fill="#28a745" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}