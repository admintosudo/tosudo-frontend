import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import HubLayout from './components/HubLayout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Home from './pages/Home/Home';
import Admin from './pages/Admin/Admin';
import ChangePassword from './pages/ChangePassword/ChangePassword';
import AIPanel from './pages/AIPanel/AIPanel';

const ComingSoon = ({ name }) => (
  <div style={{flex:1,display:'flex',flexDirection:'column'}}>
    <div style={{padding:'24px',flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'12px'}}>
      <div style={{fontSize:'48px'}}>🚧</div>
      <div style={{fontSize:'20px',fontWeight:'700',color:'#f5f5f7'}}>{name}</div>
      <div style={{fontSize:'14px',color:'rgba(245,245,247,0.3)'}}>Module đang được xây dựng</div>
    </div>
  </div>
);

function ProtectedRoute({ children }) {
  const { token, loading, needsPasswordChange } = useAuth();
  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',flexDirection:'column',gap:'12px'}}>
      <div style={{width:'32px',height:'32px',border:'2px solid rgba(201,168,76,0.3)',borderTopColor:'#C9A84C',borderRadius:'50%',animation:'spin 0.7s linear infinite'}}></div>
      <div style={{color:'rgba(245,245,247,0.4)',fontSize:'13px'}}>Đang tải...</div>
    </div>
  );
  if (!token) return <Navigate to="/login" replace />;
  // Force đổi MK lần đầu
  if (needsPasswordChange()) return <Navigate to="/change-password" replace />;
  return children;
}

function AppRoutes() {
  const { token, needsPasswordChange } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/change-password" element={
        token ? <ChangePassword /> : <Navigate to="/login" replace />
      } />
      <Route element={<ProtectedRoute><HubLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/home"      element={<Home />} />
        <Route path="/admin"     element={<Admin />} />
        <Route path="/wms"       element={<ComingSoon name="📦 Kho hàng WMS" />} />
        <Route path="/ketoan"    element={<ComingSoon name="💰 Kế toán" />} />
        <Route path="/hr"        element={<ComingSoon name="👥 Nhân sự" />} />
        <Route path="/marketing" element={<ComingSoon name="📣 Marketing" />} />
        <Route path="/media"     element={<ComingSoon name="🎬 Media" />} />
        <Route path="/sales"     element={<ComingSoon name="🛒 Kinh doanh" />} />
        <Route path="/xnk"       element={<ComingSoon name="🚢 Xuất nhập khẩu" />} />
        <Route path="/ai"        element={<AIPanel />} />
        <Route path="/ai/agents" element={<ComingSoon name="⚡ Agent Dashboard" />} />
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
