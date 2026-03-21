import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header/Header';
import './Admin.css';

const ROLES = [
  { code:'admin',     name:'Administrator' },
  { code:'ceo',       name:'CEO / Ban lãnh đạo' },
  { code:'kho',       name:'Kho hàng' },
  { code:'ketoan',    name:'Kế toán' },
  { code:'hr',        name:'Nhân sự' },
  { code:'marketing', name:'Marketing' },
  { code:'media',     name:'Media' },
  { code:'sales',     name:'Kinh doanh' },
  { code:'xnk',       name:'Xuất nhập khẩu' },
];

export default function Admin() {
  const { token } = useAuth();
  const [tab, setTab]           = useState('users');
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState({ name:'', phone:'', role:'kho', department:'' });
  const [creating, setCreating] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://hub.tosudo.vn/v1/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setUsers(data.data?.users || data.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) { setError('Vui lòng nhập đủ thông tin'); return; }
    setCreating(true); setError('');
    try {
      const res = await fetch('https://hub.tosudo.vn/v1/users', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${token}` },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          role: form.role,
          department: form.department,
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setSuccess(`✅ Đã tạo tài khoản cho ${form.name} · Mật khẩu tạm sẽ gửi qua Telegram`);
      setShowModal(false);
      setForm({ name:'', phone:'', role:'kho', department:'' });
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally { setCreating(false); }
  };

  const toggleActive = async (userId, isActive) => {
    try {
      await fetch(`https://hub.tosudo.vn/v1/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${token}` },
        body: JSON.stringify({ isActive: !isActive })
      });
      fetchUsers();
    } catch {}
  };

  return (
    <div className="admin-page">
      <Header title="⚙️ Cài đặt hệ thống" subtitle="Quản lý nhân viên · Phân quyền · Hệ thống" />

      <div className="admin-body">
        {/* Tabs */}
        <div className="admin-tabs">
          <button className={`admin-tab ${tab==='users'?'active':''}`} onClick={()=>setTab('users')}>👥 Nhân viên</button>
          <button className={`admin-tab ${tab==='roles'?'active':''}`} onClick={()=>setTab('roles')}>🔐 Roles</button>
          <button className={`admin-tab ${tab==='system'?'active':''}`} onClick={()=>setTab('system')}>⚙️ Hệ thống</button>
        </div>

        {success && <div className="admin-success">{success}<button onClick={()=>setSuccess('')}>✕</button></div>}

        {/* TAB: USERS */}
        {tab === 'users' && (
          <div>
            <div className="admin-toolbar">
              <div className="admin-toolbar-left">
                <div className="admin-count">{users.length} nhân viên</div>
              </div>
              <button className="admin-btn-create" onClick={()=>setShowModal(true)}>+ Thêm nhân viên</button>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nhân viên</th>
                    <th>Số điện thoại</th>
                    <th>Role</th>
                    <th>Phòng ban</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" style={{textAlign:'center',padding:'32px',color:'rgba(245,245,247,0.3)'}}>Đang tải...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan="6" style={{textAlign:'center',padding:'32px',color:'rgba(245,245,247,0.3)'}}>Chưa có nhân viên nào</td></tr>
                  ) : users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="nv-cell">
                          <div className="nv-av">{u.name?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)}</div>
                          <div className="nv-name">{u.name}</div>
                        </div>
                      </td>
                      <td style={{fontFamily:'DM Mono,monospace',fontSize:'13px',color:'rgba(245,245,247,0.6)'}}>{u.phone || '—'}</td>
                      <td>
                        <span className="role-badge">{u.roles?.[0] || '—'}</span>
                      </td>
                      <td style={{fontSize:'13px',color:'rgba(245,245,247,0.5)'}}>{u.department || '—'}</td>
                      <td>
                        <span className={`status-badge ${u.isActive ? 'active' : 'inactive'}`}>
                          {u.isActive ? '● Active' : '● Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{display:'flex',gap:'6px'}}>
                          <button className="action-btn" onClick={()=>toggleActive(u.id, u.isActive)}>
                            {u.isActive ? 'Khoá' : 'Mở'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: ROLES */}
        {tab === 'roles' && (
          <div className="roles-grid">
            {ROLES.map(r => (
              <div key={r.code} className="role-card">
                <div className="role-code">{r.code}</div>
                <div className="role-name">{r.name}</div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: SYSTEM */}
        {tab === 'system' && (
          <div className="system-info">
            <div className="sys-card"><div className="sys-label">Backend Hub</div><div className="sys-val" style={{color:'#30D158'}}>✓ Online · hub.tosudo.vn</div></div>
            <div className="sys-card"><div className="sys-label">Backend WMS</div><div className="sys-val" style={{color:'#30D158'}}>✓ Online · :3001</div></div>
            <div className="sys-card"><div className="sys-label">Backend AI</div><div className="sys-val" style={{color:'#30D158'}}>✓ Online · :3002</div></div>
            <div className="sys-card"><div className="sys-label">Database</div><div className="sys-val" style={{color:'#30D158'}}>✓ PostgreSQL · tosudo_hub</div></div>
            <div className="sys-card"><div className="sys-label">Cache</div><div className="sys-val" style={{color:'#30D158'}}>✓ Redis · :6379</div></div>
          </div>
        )}
      </div>

      {/* MODAL TẠO NV */}
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-title">➕ Thêm nhân viên mới</div>
            <div className="modal-sub">Hệ thống tạo mật khẩu tạm · Gửi qua Telegram</div>
            <form onSubmit={handleCreate}>
              <div className="mf"><label className="ml">Họ và tên *</label><input className="mi" placeholder="Nguyễn Văn A" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
              <div className="mf"><label className="ml">Số điện thoại *</label><input className="mi" type="tel" placeholder="0901 234 567" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></div>
              <div className="mf">
                <label className="ml">Role *</label>
                <select className="mi" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                  {ROLES.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
                </select>
              </div>
              <div className="mf"><label className="ml">Phòng ban</label><input className="mi" placeholder="Kho HN, Marketing..." value={form.department} onChange={e=>setForm({...form,department:e.target.value})} /></div>
              {error && <div className="cp-error">{error}</div>}
              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={()=>setShowModal(false)}>Huỷ</button>
                <button type="submit" className="modal-submit" disabled={creating}>{creating ? 'Đang tạo...' : 'Tạo tài khoản'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
