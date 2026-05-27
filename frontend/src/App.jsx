import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Timer from './pages/Timer';
import History from './pages/History';
import Dashboard from './pages/Dashboard';
import './App.css';

function Nav() {
  const location = useLocation();
  const links = [
    { to: '/', label: '⏱ 타이머' },
    { to: '/history', label: '📋 히스토리' },
    { to: '/dashboard', label: '📊 대시보드' },
  ];

  return (
    <nav style={{
      display: 'flex', gap: 8, padding: '12px 24px',
      background: '#1a1a2e', borderBottom: '2px solid #007bff'
    }}>
      <span style={{ color: 'white', fontWeight: 'bold', marginRight: 16, fontSize: 18 }}>
        🎯 Focus Timer
      </span>
      {links.map(l => (
        <Link
          key={l.to}
          to={l.to}
          style={{
            padding: '6px 16px', borderRadius: 6, textDecoration: 'none',
            background: location.pathname === l.to ? '#007bff' : 'transparent',
            color: 'white', fontWeight: location.pathname === l.to ? 'bold' : 'normal'
          }}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        <Routes>
          <Route path="/" element={<Timer />} />
          <Route path="/history" element={<History />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;