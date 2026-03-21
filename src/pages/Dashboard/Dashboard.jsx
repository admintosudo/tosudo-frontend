import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header/Header';
import './Dashboard.css';

const API = 'https://hub.tosudo.vn';
const WMS = 'https://hub.tosudo.vn'; // proxy qua nginx → :3001 sau

export default function Dashboard() {
  const { user, token } = useAuth();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // refresh 30s
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch parallel
      const [usersRes, ordersRes] = await Promise.allSettled([
        fetch(`${API}/v1/users?limit=1`, { headers }),
        fetch(`${WMS}/v1/orders/stats/summary`, { headers }),
      ]);

      const usersData  = usersRes.status  === 'fulfilled' ? await usersRes.value.json()  : null;
      const ordersData = ordersRes.status === 'fulfilled' ? await ordersRes.value.json() : null;

      setStats({
        totalUsers:  usersData?.data?.total  || usersData?.data?.users?.length || '—',
        totalOrders: ordersData?.data?.today || ordersData?.data?.total || '—',
        pendingOrders: ordersData?.data?.pending || '—',
        revenue:     ordersData?.data?.revenue  || '—',
      });
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Chào buổi sáng';
    if (h < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday:'long', year:'numeric', month:'long', day:'numeric'
  });

  return (
    <div className="dashboard">
      <Header title="Dashboard CEO" subtitle={`TOSUDO Hub · ${today}`} />
      <div className="dashboard-body">

        {/* Greeting */}
        <div className="db-greeting">
          <div className="db-greeting-text">
            {greeting()}, <span className="db-name">{user?.name?.split(' ').pop()}</span> 👋
          </div>
          <div className="db-greeting-sub">{today}</div>
        </div>

        {/* AI Summary */}
        <div className="ai-summary">
          <div className="ai-summary-icon">🤖</div>
          <div className="ai-summary-content">
            <div className="ai-summary-title">Tóm tắt hôm nay từ AI</div>
            <div className="ai-summary-text">
              Hệ thống đang hoạt động bình thường · 3 services online ·
              Kết nối database ổn định · Chưa có cảnh báo nào
            </div>
          </div>
          <div className="ai-summary-badge">Live</div>
        </div>

        {/* KPI Grid */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Đơn hàng hôm nay</div>
            <div className="kpi-val">{loading ? '...' : stats?.totalOrders}</div>
            <div className="kpi-change">Từ WMS service</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Đơn đang xử lý</div>
            <div className="kpi-val" style={{color:'#FF9F0A'}}>{loading ? '...' : stats?.pendingOrders}</div>
            <div className="kpi-change">Chờ đóng gói / giao</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Tổng nhân viên</div>
            <div className="kpi-val" style={{color:'#5AC8FA'}}>{loading ? '...' : stats?.totalUsers}</div>
            <div className="kpi-change">Từ Hub service</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Doanh thu hôm nay</div>
            <div className="kpi-val" style={{color:'#30D158'}}>{loading ? '...' : (stats?.revenue !== '—' ? `${stats?.revenue}M` : '—')}</div>
            <div className="kpi-change">Đồng bộ từ WMS</div>
          </div>
        </div>

        {/* Services status */}
        <div className="services-row">
          {[
            { name:'Hub API',   url:`${API}/health`,    icon:'🏛️' },
            { name:'WMS API',   url:`${API}/health`,    icon:'📦' },
            { name:'AI API',    url:`${API}/health`,    icon:'🤖' },
          ].map((s, i) => (
            <ServiceCard key={i} {...s} token={token} />
          ))}
        </div>

        {/* Quick access */}
        <div className="modules-section">
          <div className="section-title">Truy cập nhanh</div>
          <div className="modules-grid">
            {[
              { icon:'📦', label:'Kho hàng',      path:'/wms',       color:'rgba(48,209,88,0.08)'  },
              { icon:'💰', label:'Kế toán',        path:'/ketoan',    color:'rgba(201,168,76,0.08)' },
              { icon:'👥', label:'Nhân sự',        path:'/hr',        color:'rgba(191,90,242,0.08)' },
              { icon:'📣', label:'Marketing',      path:'/marketing', color:'rgba(255,159,10,0.08)' },
              { icon:'🎬', label:'Media',          path:'/media',     color:'rgba(90,200,250,0.08)' },
              { icon:'🛒', label:'Kinh doanh',     path:'/sales',     color:'rgba(10,132,255,0.08)' },
              { icon:'🚢', label:'Xuất nhập khẩu', path:'/xnk',       color:'rgba(255,69,58,0.08)'  },
              { icon:'🤖', label:'AI Panel',       path:'/ai',        color:'rgba(201,168,76,0.08)' },
            ].map((m, i) => (
              <a key={i} href={m.path} className="module-card" style={{background: m.color}}>
                <div className="module-icon">{m.icon}</div>
                <div className="module-label">{m.label}</div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// Service health card
function ServiceCard({ name, url, icon, token }) {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? setStatus('online') : setStatus('error'))
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div className="service-card">
      <div className="service-icon">{icon}</div>
      <div className="service-name">{name}</div>
      <div className={`service-status ${status}`}>
        {status === 'checking' ? '...' : status === 'online' ? '● Online' : '● Offline'}
      </div>
    </div>
  );
}
