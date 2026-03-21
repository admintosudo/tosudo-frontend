import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header/Header';
import './AIPanel.css';

const API = 'https://hub.tosudo.vn';
const USD_TO_VND = 25000;
const toVND = (usd) => {
  const vnd = parseFloat(usd) * USD_TO_VND;
  if (vnd >= 1000000) return (vnd/1000000).toFixed(1) + 'M';
  if (vnd >= 1000)    return Math.round(vnd/1000) + 'K';
  return Math.round(vnd).toLocaleString('vi-VN');
};
const fmtVND = (usd) => toVND(usd) + 'đ';

// ── Tabs config ──────────────────────────────────────────────
const CEO_TABS  = ['💰 Chi phí', '⚡ Agents', '💡 Insights', '✅ Phê duyệt'];
const ADMIN_TABS = ['⚙️ Setup', '💰 Chi phí', '⚡ Agents', '✅ Phê duyệt', '📋 Audit'];

const PROVIDERS = [
  { key:'claude',   name:'Claude Sonnet', icon:'🟠', provider:'Anthropic', task:'Phức tạp',   cost:'$3/$15',   color:'var(--gold)'   },
  { key:'openai',   name:'GPT-4o Mini',   icon:'🟢', provider:'OpenAI',    task:'Trung bình', cost:'$0.15/$0.6',color:'var(--green)'  },
  { key:'deepseek', name:'DeepSeek',      icon:'🔵', provider:'DeepSeek',  task:'Đơn giản',   cost:'$0.07/$0.28',color:'var(--blue)'  },
  { key:'gemini',   name:'Gemini Flash',  icon:'🟣', provider:'Google',    task:'Generation', cost:'$0.075/$0.3',color:'var(--purple)' },
];

const AGENTS = [
  { icon:'📊', name:'Daily Report',   dept:'💰 Kế toán',  module:'Báo cáo',   task:'Tóm tắt doanh thu → CEO Telegram', freq:'7:00 sáng',      provider:'deepseek', cost:'$1.35', budget:3,  active:true  },
  { icon:'⚠️', name:'Stock Monitor',  dept:'📦 Kho hàng', module:'Tồn kho',   task:'SKU sắp hết → alert Trưởng kho',   freq:'Mỗi 30 phút',    provider:'deepseek', cost:'$0.86', budget:3,  active:true  },
  { icon:'📝', name:'Quiz Generator', dept:'👥 Nhân sự',  module:'Đào tạo',   task:'Tạo quiz từ SOP → phân phối NV',   freq:'Thứ 2 8:00',     provider:'gemini',   cost:'$0.18', budget:1,  active:true  },
  { icon:'📦', name:'Order Overdue',  dept:'📦 Kho hàng', module:'Đơn hàng',  task:'Alert đơn quá 24h chưa xử lý',     freq:'Realtime',       provider:'deepseek', cost:'$0.12', budget:1,  active:true  },
  { icon:'📈', name:'Monthly P&L',    dept:'👑 CEO',       module:'Dashboard', task:'Tổng kết P&L → tạo báo cáo PDF',  freq:'Ngày 1/tháng',   provider:'claude',   cost:'$0.00', budget:2,  active:false },
  { icon:'💸', name:'Expense Alert',  dept:'💰 Kế toán',  module:'Phiếu chi', task:'Chi phí bất thường → alert CFO',   freq:'Event trigger',  provider:'deepseek', cost:'$0.05', budget:1,  active:false },
];

export default function AIPanel() {
  const { user, token, isAdmin } = useAuth();
  const [view, setView]     = useState('ceo'); // ceo | admin
  const [tab, setTab]       = useState(0);
  const [agents, setAgents] = useState(AGENTS);
  const [budgets, setBudgets] = useState({ claude:20, openai:10, deepseek:5, gemini:5 });
  const [requests, setRequests] = useState([
    { id:1, user:'Nguyễn Văn A', role:'NV Kho', request:'Xin mở thêm Brain Agent', module:'WMS', time:'2 giờ trước', status:'pending' },
    { id:2, user:'Trần Thị B',   role:'Marketing', request:'Nâng quota 10,000 → 20,000 tokens', module:'Marketing', time:'5 giờ trước', status:'pending' },
    { id:3, user:'Lê Văn C',     role:'Kế toán', request:'Xin dùng Claude Sonnet cho phân tích ROAS', module:'Finance', time:'1 ngày trước', status:'pending' },
  ]);

  const tabs = view === 'admin' ? ADMIN_TABS : CEO_TABS;

  const approveRequest = (id) => setRequests(r => r.map(x => x.id === id ? {...x, status:'approved'} : x));
  const rejectRequest  = (id) => setRequests(r => r.map(x => x.id === id ? {...x, status:'rejected'} : x));
  const toggleAgent    = (i)  => setAgents(a => a.map((x,j) => j===i ? {...x, active: !x.active} : x));

  const totalCostUSD = AGENTS.reduce((s,a) => s + parseFloat(a.cost.replace('$','')), 0);
  const totalCost    = fmtVND(totalCostUSD);
  const totalBudget  = Object.values(budgets).reduce((s,v) => s + v, 0);
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="aip-page">
      <Header title="🤖 AI Panel" subtitle="Quản lý AI · Chi phí · Agents" />

      <div className="aip-body">

        {/* View toggle */}
        <div className="aip-top">
          <div className="aip-view-toggle">
            <button className={`avt-btn ${view==='ceo'?'active':''}`} onClick={()=>{setView('ceo');setTab(0);}}>👑 CEO View</button>
            <button className={`avt-btn ${view==='admin'?'active':''}`} onClick={()=>{setView('admin');setTab(0);}}>⚙️ Admin View</button>
          </div>
          <div className="aip-summary">
            <span>Tháng 3 · Chi phí: <strong style={{color:'var(--gold)'}}>{fmtVND(24.60)}</strong></span>
            <span>Thu NV: <strong style={{color:'var(--green)'}}>{fmtVND(8.00)}</strong></span>
            <span>Thực trả: <strong style={{color:'var(--teal)'}}>{fmtVND(16.60)}</strong></span>
          </div>
        </div>

        {/* Tabs */}
        <div className="aip-tabs">
          {tabs.map((t,i) => (
            <button key={i} className={`aip-tab ${tab===i?'active':''}`} onClick={()=>setTab(i)}>
              {t}
              {t.includes('Phê duyệt') && pendingCount > 0 && <span className="aip-badge">{pendingCount}</span>}
            </button>
          ))}
        </div>

        {/* ── SETUP (Admin only) ── */}
        {view==='admin' && tab===0 && (
          <div className="aip-section">
            <div className="aip-grid-2">
              <div className="aip-card">
                <div className="aip-card-title">Budget mặc định / NV / tháng</div>
                <div className="aip-field">
                  <label>Toàn công ty</label>
                  <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                    <input className="aip-input" type="number" defaultValue="50000" style={{width:'120px'}} />
                    <span style={{color:'var(--text3)',fontSize:'13px'}}>đ/tháng</span>
                  </div>
                </div>
                <div className="aip-field">
                  <label>Khi hết budget</label>
                  <select className="aip-input">
                    <option>Khoá AI · Hiện thông báo mua thêm</option>
                    <option>Cảnh báo nhưng vẫn cho dùng</option>
                  </select>
                </div>
                <div className="aip-field">
                  <label>Cho phép NV tự nạp thêm</label>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <div className="aip-toggle on"></div>
                    <span style={{fontSize:'12px',color:'var(--text3)'}}>Tự động trừ lương</span>
                  </div>
                </div>
              </div>
              <div className="aip-card">
                <div className="aip-card-title">Provider mặc định theo task</div>
                {[
                  {task:'Phức tạp (Council, Strategos)', provider:'Claude Sonnet'},
                  {task:'Trung bình (Chat module)',       provider:'GPT-4o Mini'},
                  {task:'Đơn giản (SOP, Alert)',          provider:'DeepSeek'},
                  {task:'Generation (Quiz, Content)',     provider:'Gemini Flash'},
                ].map((r,i) => (
                  <div key={i} className="aip-provider-row">
                    <span className="apr-task">{r.task}</span>
                    <select className="aip-input" style={{width:'140px',height:'28px',fontSize:'11px'}}>
                      <option>{r.provider}</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CHI PHÍ ── */}
        {((view==='ceo' && tab===0) || (view==='admin' && tab===1)) && (
          <div className="aip-section">
            {/* KPI */}
            <div className="aip-kpi-grid">
              <div className="aip-kpi"><div className="aip-kpi-label">Tổng token tháng 3</div><div className="aip-kpi-val">3.2M</div></div>
              <div className="aip-kpi"><div className="aip-kpi-label">Chi phí thực</div><div className="aip-kpi-val" style={{color:'var(--red)'}}>$24.60</div></div>
              <div className="aip-kpi"><div className="aip-kpi-label">Thu từ NV mua thêm</div><div className="aip-kpi-val" style={{color:'var(--green)'}}>$8.00</div></div>
              <div className="aip-kpi"><div className="aip-kpi-label">TOSUDO trả thực</div><div className="aip-kpi-val" style={{color:'var(--teal)'}}>$16.60</div></div>
            </div>

            {/* Model budget table */}
            <div className="aip-card">
              <div className="aip-card-title">💰 Ngân sách từng AI Model</div>
              <table className="aip-table">
                <thead><tr><th>Model</th><th>Token</th><th>Chi phí</th><th>Ngân sách/tháng</th><th>Mức dùng</th><th>Hành động</th></tr></thead>
                <tbody>
                  {PROVIDERS.map(p => {
                    const used = p.key==='claude'?18 : p.key==='openai'?4.8 : p.key==='deepseek'?1.2 : 0.6;
                    const budget = budgets[p.key];
                    const pct = Math.round(used/budget*100);
                    const color = pct > 80 ? 'var(--red)' : pct > 50 ? 'var(--orange)' : 'var(--green)';
                    return (
                      <tr key={p.key}>
                        <td><div style={{display:'flex',alignItems:'center',gap:'8px'}}><span style={{fontSize:'18px'}}>{p.icon}</span><div><div style={{fontWeight:'600',fontSize:'13px'}}>{p.name}</div><div style={{fontSize:'10px',color:'var(--text3)',fontFamily:'monospace'}}>{p.provider}</div></div></div></td>
                        <td style={{fontFamily:'monospace',fontSize:'12px'}}>{p.key==='claude'?'1.2M':p.key==='openai'?'800K':p.key==='deepseek'?'600K':'400K'}</td>
                        <td style={{fontWeight:'700',color: pct>80?'var(--red)':'var(--gold)',fontFamily:'monospace'}}>{fmtVND(used)}</td>
                        <td><div style={{display:'flex',alignItems:'center',gap:'6px'}}><input type="number" value={budget} onChange={e=>setBudgets({...budgets,[p.key]:parseInt(e.target.value)})} style={{width:'50px',height:'26px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:'6px',color:'var(--text)',fontSize:'12px',textAlign:'center',fontFamily:'monospace',outline:'none'}} /><span style={{fontSize:'11px',color:'var(--text3)'}}>$ (~{toVND(budgets[p.key])}đ)</span></div></td>
                        <td><div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px'}}><div style={{width:'80px',height:'4px',background:'rgba(255,255,255,0.06)',borderRadius:'2px'}}><div style={{width:`${Math.min(pct,100)}%`,height:'100%',background:color,borderRadius:'2px'}}></div></div><span style={{fontSize:'10px',color,fontWeight:'600'}}>{pct}%</span></div></td>
                        <td><button className="aip-btn-sm" onClick={()=>setBudgets({...budgets,[p.key]:budgets[p.key]+10})}>+ $10</button></td>
                      </tr>
                    );
                  })}
                  <tr style={{background:'rgba(255,255,255,0.02)'}}>
                    <td style={{fontWeight:'700'}}>Tổng</td>
                    <td style={{fontFamily:'monospace',fontWeight:'600'}}>3.0M</td>
                    <td style={{fontWeight:'700',color:'var(--gold)',fontFamily:'monospace'}}>$24.60</td>
                    <td style={{fontWeight:'700',fontFamily:'monospace'}}>${totalBudget}</td>
                    <td><span style={{fontSize:'11px',color:'var(--gold)',fontWeight:'600'}}>62%</span></td>
                    <td><button className="aip-btn-primary" onClick={()=>alert('Đã lưu ngân sách!')}>💾 Lưu</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── AGENTS ── */}
        {((view==='ceo' && tab===1) || (view==='admin' && tab===2)) && (
          <div className="aip-section">
            <div className="aip-kpi-grid">
              <div className="aip-kpi"><div className="aip-kpi-label">Agents đang chạy</div><div className="aip-kpi-val" style={{color:'var(--green)'}}>{agents.filter(a=>a.active).length}/{agents.length}</div></div>
              <div className="aip-kpi"><div className="aip-kpi-label">Chi phí agents</div><div className="aip-kpi-val">{totalCost}</div></div>
              <div className="aip-kpi"><div className="aip-kpi-label">Lần chạy hôm nay</div><div className="aip-kpi-val" style={{color:'var(--blue)'}}>53</div></div>
              <div className="aip-kpi"><div className="aip-kpi-label">Tỷ lệ thành công</div><div className="aip-kpi-val" style={{color:'var(--green)'}}>99.1%</div></div>
            </div>
            <div className="aip-card">
              <div className="aip-card-title">Danh sách Agent tự động</div>
              <table className="aip-table">
                <thead><tr><th>Agent</th><th>Phòng ban · Module</th><th>Công việc</th><th>Tần suất</th><th>Chi phí / NS</th><th>Trạng thái</th></tr></thead>
                <tbody>
                  {agents.map((a,i) => (
                    <tr key={i}>
                      <td><div style={{display:'flex',alignItems:'center',gap:'8px'}}><span style={{fontSize:'18px'}}>{a.icon}</span><div><div style={{fontWeight:'600',fontSize:'13px'}}>{a.name}</div><div style={{fontSize:'10px',color:'var(--text3)',fontFamily:'monospace'}}>{a.provider}</div></div></div></td>
                      <td><div style={{fontSize:'12px',color:'var(--text2)'}}>{a.dept}</div><div style={{fontSize:'11px',color:'var(--text3)'}}>{a.module}</div></td>
                      <td style={{fontSize:'12px',color:'var(--text2)',maxWidth:'180px'}}>{a.task}</td>
                      <td style={{fontSize:'11px',color:'var(--text3)'}}>{a.freq}</td>
                      <td>
                        <div style={{fontSize:'12px',fontFamily:'monospace',color:'var(--gold)'}}>{fmtVND(parseFloat(a.cost.replace('$','')))} / {toVND(a.budget)}đ</div>
                        <div style={{width:'60px',height:'3px',background:'rgba(255,255,255,0.06)',borderRadius:'2px',marginTop:'4px'}}>
                          <div style={{width:`${Math.min(parseFloat(a.cost.replace('$',''))/a.budget*100,100)}%`,height:'100%',background:'var(--green)',borderRadius:'2px'}}></div>
                        </div>
                      </td>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                          <span style={{fontSize:'11px',fontWeight:'600',color:a.active?'var(--green)':'var(--text3)'}}>{a.active?'✅ Chạy':'⏳ Tắt'}</span>
                          <div className={`aip-toggle ${a.active?'on':''}`} onClick={()=>toggleAgent(i)}></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PHÊ DUYỆT ── */}
        {((view==='ceo' && tab===3) || (view==='admin' && tab===3)) && (
          <div className="aip-section">
            <div className="aip-card">
              <div className="aip-card-title">Yêu cầu chờ duyệt · {pendingCount} đang chờ</div>
              {requests.map(r => (
                <div key={r.id} className={`aip-request ${r.status}`}>
                  <div className="aip-request-info">
                    <div className="aip-request-user">{r.user} · <span style={{color:'var(--text3)',fontSize:'11px'}}>{r.role}</span></div>
                    <div className="aip-request-text">{r.request}</div>
                    <div style={{display:'flex',gap:'8px',marginTop:'4px'}}>
                      <span style={{fontSize:'11px',color:'var(--blue)',background:'rgba(10,132,255,0.1)',padding:'2px 8px',borderRadius:'4px'}}>Module: {r.module}</span>
                      <span style={{fontSize:'11px',color:'var(--text3)'}}>{r.time}</span>
                    </div>
                  </div>
                  {r.status === 'pending' ? (
                    <div style={{display:'flex',gap:'6px'}}>
                      <button className="aip-approve" onClick={()=>approveRequest(r.id)}>✓ Duyệt</button>
                      <button className="aip-reject"  onClick={()=>rejectRequest(r.id)}>✕ Từ chối</button>
                    </div>
                  ) : (
                    <span style={{fontSize:'12px',fontWeight:'600',color:r.status==='approved'?'var(--green)':'var(--red)'}}>
                      {r.status==='approved'?'✓ Đã duyệt':'✕ Đã từ chối'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── AUDIT (Admin only) ── */}
        {view==='admin' && tab===4 && (
          <div className="aip-section">
            <div className="aip-card">
              <div className="aip-card-title">📋 Audit Log — Hoạt động AI hôm nay</div>
              {[
                {time:'09:42',dot:'var(--orange)',agent:'Stock Monitor',msg:'SKU-AO-001 còn 12 < 50 → Alert Trưởng kho HN',tags:['⚠️ alert','deepseek','82 tokens']},
                {time:'09:15',dot:'var(--red)',   agent:'Order Overdue', msg:'DH-041 đã 26h chưa xử lý → Alert NV + Trưởng kho',tags:['⚠️ overdue','deepseek','45 tokens']},
                {time:'08:42',dot:'var(--green)', agent:'Expense Alert', msg:'Phiếu chi 45M · Kiểm tra OK · Bình thường ✅',tags:['✓ normal','deepseek','120 tokens']},
                {time:'07:00',dot:'var(--gold)',  agent:'Daily Report',  msg:'Doanh thu 17/03: 45.2M · Tăng 12% · Gửi CEO ✅',tags:['✓ sent','deepseek','1,840 tokens']},
              ].map((l,i) => (
                <div key={i} className="aip-log">
                  <div style={{fontSize:'11px',color:'var(--text3)',fontFamily:'monospace',width:'50px',flexShrink:0}}>{l.time}</div>
                  <div style={{width:'7px',height:'7px',borderRadius:'50%',background:l.dot,flexShrink:0,marginTop:'5px'}}></div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'13px',color:'var(--text)',fontWeight:'500',marginBottom:'3px'}}><strong>{l.agent}</strong> · {l.msg}</div>
                    <div style={{display:'flex',gap:'5px'}}>{l.tags.map((t,j) => <span key={j} style={{fontSize:'10px',padding:'2px 7px',borderRadius:'4px',background:'rgba(255,255,255,0.05)',color:'var(--text3)',fontFamily:'monospace'}}>{t}</span>)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── INSIGHTS (CEO tab 2) ── */}
        {view==='ceo' && tab===2 && (
          <div className="aip-section">
            <div className="aip-card">
              <div className="aip-card-title">💡 Gợi ý tối ưu từ AI</div>
              {[
                {icon:'💰',title:'DeepSeek rẻ hơn Claude 20x cho task đơn giản',desc:'Phòng Kho đang dùng Claude cho hỏi SOP đơn giản. Chuyển sang DeepSeek tiết kiệm ~$6/tháng.',action:'Switch provider ngay'},
                {icon:'📊',title:'Marketing dùng AI hiệu quả nhất',desc:'28,500 tokens → ROAS tăng 15%. ROI tốt nhất toàn công ty. Nên tăng quota Marketing.',action:'Tăng quota Marketing'},
                {icon:'⚠️',title:'Lê Văn C hết quota 10 ngày trước cuối tháng',desc:'Kế toán hay hết quota. Nên nâng từ 20,000 lên 30,000 tokens/tháng.',action:'Nâng quota Kế toán'},
              ].map((ins,i) => (
                <div key={i} className="aip-insight">
                  <span style={{fontSize:'22px'}}>{ins.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'13px',fontWeight:'600',color:'var(--text)',marginBottom:'3px'}}>{ins.title}</div>
                    <div style={{fontSize:'12px',color:'var(--text3)',lineHeight:'1.5'}}>{ins.desc}</div>
                  </div>
                  <button className="aip-btn-sm" style={{flexShrink:0}}>→ {ins.action}</button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
