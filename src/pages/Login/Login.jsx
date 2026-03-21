import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

function ViewToggle({ view, setView }) {
  return (
    <div className="vt-wrap">
      <div className="vt-label">👁 Chế độ xem thử</div>
      <div className="vt-pills">
        <button className={`vt-pill ${view === 'desktop' ? 'active' : ''}`} onClick={() => setView('desktop')}>🖥️ Desktop</button>
        <button className={`vt-pill ${view === 'mobile' ? 'active' : ''}`} onClick={() => setView('mobile')}>📱 Mobile</button>
      </div>
    </div>
  );
}

function LoginForm({ isMobile }) {
  const { login, getHomePath } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password) { setError('Vui lòng nhập đủ thông tin'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('https://hub.tosudo.vn/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Đăng nhập thất bại');
      login(data.data.user, data.data.accessToken, data.data.refreshToken);
      // Redirect theo role
      const role = data.data.user?.roles?.[0]?.code || '';
      if (role === 'admin' || role === 'ceo') navigate('/dashboard');
      else if (role === 'kho') navigate('/wms');
      else if (role === 'ketoan') navigate('/ketoan');
      else if (role === 'hr') navigate('/hr');
      else navigate('/home');
    } catch (err) {
      setError(err.message || 'Sai số điện thoại hoặc mật khẩu');
    } finally { setLoading(false); }
  };

  if (isMobile) return (
    <div className="login-mobile-wrap">
      <div className="phone-frame">
        <div className="status-bar"><span className="status-time">9:41</span><div className="status-icons"><span>●●●</span><span>WiFi</span><span>🔋</span></div></div>
        <div className="dynamic-island"><div className="di-sensor" /><div className="di-camera" /></div>
        <div className="mobile-body">
          <div className="m-logo-wrap">
            <div className="m-logo-box"><span>T</span></div>
            <div className="m-brand">TOSUDO</div>
            <div className="m-tagline">Hệ điều hành doanh nghiệp</div>
          </div>
          <h2 className="m-title">Đăng nhập</h2>
          <p className="m-sub">Chào mừng trở lại 👋</p>
          <form onSubmit={handleSubmit}>
            <div className="m-field"><label className="m-label">Số điện thoại</label><input className="m-input" type="tel" placeholder="0901 234 567" value={phone} onChange={e => setPhone(e.target.value)} /></div>
            <div className="m-field"><label className="m-label">Mật khẩu</label><div className="m-pass-wrap"><input className="m-input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} /><button type="button" className="m-show-pass" onClick={() => setShowPass(!showPass)}>{showPass ? '🙈' : '👁️'}</button></div></div>
            <div className="m-forgot-row"><span className="m-forgot">Quên mật khẩu?</span></div>
            {error && <div className="error-msg">{error}</div>}
            <button className="m-btn-primary" type="submit" disabled={loading}>{loading ? <span className="spinner" /> : 'Đăng nhập'}</button>
          </form>
          <div className="m-divider"><span>hoặc</span></div>
          <button className="m-btn-otp"><span>✈️</span> Nhận OTP qua Telegram</button>
          <div className="m-secure"><span className="m-secure-dot" />Kết nối bảo mật · hub.tosudo.vn</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="login-desktop">
      <div className="bg-glow" />
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-box"><span>T</span></div>
          <div className="logo-name">TOSUDO</div>
          <div className="logo-tagline">Hệ điều hành doanh nghiệp</div>
        </div>
        <div className="login-glass">
          <h2 className="form-title">Đăng nhập</h2>
          <p className="form-sub">Chào mừng trở lại TOSUDO Hub 👋</p>
          <form onSubmit={handleSubmit}>
            <div className="field"><input className="field-input" type="tel" placeholder="Số điện thoại" value={phone} onChange={e => setPhone(e.target.value)} /></div>
            <div className="field pass-field"><input className="field-input" type={showPass ? 'text' : 'password'} placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} /><button type="button" className="show-pass" onClick={() => setShowPass(!showPass)}>{showPass ? '🙈' : '👁️'}</button></div>
            {error && <div className="error-msg">{error}</div>}
            <button className="btn-primary" type="submit" disabled={loading}>{loading ? <span className="spinner" /> : 'Đăng nhập'}</button>
          </form>
          <div className="divider"><span>hoặc</span></div>
          <button className="btn-otp"><span>✈️</span> Nhận OTP qua Telegram</button>
        </div>
        <div className="secure-note"><span className="secure-dot" />Kết nối bảo mật SSL · hub.tosudo.vn</div>
      </div>
    </div>
  );
}

export default function Login() {
  const [view, setView] = useState('desktop');
  return (
    <div className="login-page">
      <ViewToggle view={view} setView={setView} />
      <LoginForm isMobile={view === 'mobile'} />
    </div>
  );
}
