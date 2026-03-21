import { useAuth } from '../../context/AuthContext';
import './Header.css';

export default function Header({ title, subtitle }) {
  const { user } = useAuth();

  return (
    <div className="header">
      <div className="header-left">
        <div className="header-title">{title || 'TOSUDO Hub'}</div>
        {subtitle && <div className="header-sub">{subtitle}</div>}
      </div>
      <div className="header-right">
        <div className="header-notif">🔔</div>
        <div className="header-user">
          <span className="header-user-name">{user?.name}</span>
        </div>
      </div>
    </div>
  );
}
