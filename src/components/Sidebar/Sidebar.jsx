import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const NAV_ADMIN = [
  { section: 'TỔNG QUAN' },
  { path: '/dashboard', icon: '◈', label: 'Dashboard' },
  { path: '/home',      icon: '⊞', label: 'Trang chủ' },
  { section: 'MODULES' },
  { path: '/wms',       icon: '📦', label: 'Kho hàng' },
  { path: '/ketoan',    icon: '💰', label: 'Kế toán' },
  { path: '/hr',        icon: '👥', label: 'Nhân sự' },
  { path: '/marketing', icon: '📣', label: 'Marketing' },
  { path: '/media',     icon: '🎬', label: 'Media' },
  { path: '/sales',     icon: '🛒', label: 'Kinh doanh' },
  { path: '/xnk',       icon: '🚢', label: 'Xuất nhập khẩu' },
  { section: 'AI' },
  { path: '/ai',        icon: '🤖', label: 'AI Panel' },
  { path: '/ai/agents', icon: '⚡', label: 'Agent Dashboard' },
  { section: 'HỆ THỐNG' },
  { path: '/admin',     icon: '⚙️', label: 'Cài đặt' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Luôn dùng NAV_ADMIN nếu có role admin/ceo
  const roles = user?.roles || [];
  const roleCode = typeof roles[0] === 'string' ? roles[0] : (roles[0]?.code || '');
  const isAdmin = roleCode === 'admin' || roleCode === 'ceo';
  
  console.log('Sidebar user:', user);
  console.log('Sidebar roleCode:', roleCode);
  console.log('Sidebar isAdmin:', isAdmin);

  const items = isAdmin ? NAV_ADMIN : [
    { section: 'MODULES' },
    { path: '/wms', icon: '📦', label: 'Kho hàng' },
    { section: 'AI' },
    { path: '/ai', icon: '🤖', label: 'AI của tôi' },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-box">T</div>
        {!collapsed && <div className="logo-name">TOSUDO</div>}
        <button className="sidebar-toggle" onClick={onToggle}>{collapsed ? '→' : '←'}</button>
      </div>
      <div className="sidebar-user">
        <div className="user-av">{getInitials(user?.name)}</div>
        {!collapsed && (
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role">{roleCode.toUpperCase() || 'USER'}</div>
          </div>
        )}
      </div>
      <nav className="sidebar-nav">
        {items.map((item, i) => {
          if (item.section) return collapsed ? null : <div key={i} className="nav-section">{item.section}</div>;
          return (
            <NavLink key={i} to={item.path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-text">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span>🚪</span>
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </div>
  );
}
