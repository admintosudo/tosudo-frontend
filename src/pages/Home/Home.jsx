import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header/Header';
import './Home.css';

export default function Home() {
  const { user, getRole } = useAuth();
  const role = getRole();

  return (
    <div className="home-page">
      <Header title="Trang chủ" />
      <div className="home-body">
        <div className="home-welcome">
          <div className="hw-title">Xin chào, <span>{user?.name}</span> 👋</div>
          <div className="hw-sub">Vai trò: {user?.roles?.[0]?.name || role}</div>
        </div>
        <div className="home-coming">
          <div className="hc-icon">🚧</div>
          <div className="hc-text">Module đang được xây dựng</div>
          <div className="hc-sub">Quay lại sau nhé!</div>
        </div>
      </div>
    </div>
  );
}
