import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ChangePassword.css';

export default function ChangePassword() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showPass, setShowPass]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) { setError('Mật khẩu phải ít nhất 8 ký tự'); return; }
    if (password !== confirm) { setError('Mật khẩu xác nhận không khớp'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('https://hub.tosudo.vn/v1/users/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      // Redirect về dashboard sau khi đổi MK
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally { setLoading(false); }
  };

  return (
    <div className="cp-page">
      <div className="cp-card">
        <div className="cp-logo">
          <div className="cp-logo-box">T</div>
          <div className="cp-logo-name">TOSUDO</div>
        </div>

        <div className="cp-icon">🔐</div>
        <h2 className="cp-title">Đổi mật khẩu</h2>
        <p className="cp-sub">
          Chào mừng <strong>{user?.name}</strong>!<br/>
          Vui lòng đổi mật khẩu trước khi sử dụng hệ thống.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="cp-field">
            <label className="cp-label">Mật khẩu mới</label>
            <div className="cp-input-wrap">
              <input
                className="cp-input"
                type={showPass ? 'text' : 'password'}
                placeholder="Ít nhất 8 ký tự"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button type="button" className="cp-show" onClick={() => setShowPass(!showPass)}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="cp-field">
            <label className="cp-label">Xác nhận mật khẩu</label>
            <input
              className="cp-input"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
          </div>

          {/* Password strength */}
          <div className="cp-strength">
            <div className={`cp-bar ${password.length >= 8 ? 'ok' : ''}`}></div>
            <div className={`cp-bar ${/[A-Z]/.test(password) ? 'ok' : ''}`}></div>
            <div className={`cp-bar ${/[0-9]/.test(password) ? 'ok' : ''}`}></div>
            <div className={`cp-bar ${/[^A-Za-z0-9]/.test(password) ? 'ok' : ''}`}></div>
          </div>
          <div className="cp-rules">
            <span className={password.length >= 8 ? 'ok' : ''}>✓ 8 ký tự</span>
            <span className={/[A-Z]/.test(password) ? 'ok' : ''}>✓ Chữ hoa</span>
            <span className={/[0-9]/.test(password) ? 'ok' : ''}>✓ Số</span>
            <span className={/[^A-Za-z0-9]/.test(password) ? 'ok' : ''}>✓ Ký tự đặc biệt</span>
          </div>

          {error && <div className="cp-error">{error}</div>}

          <button className="cp-btn" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Đổi mật khẩu & Vào hệ thống →'}
          </button>
        </form>

        <button className="cp-logout" onClick={() => { logout(); navigate('/login'); }}>
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
