import { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import './WMS.css';

const STATUS_MAP = {
  NEW:       { label: 'Mới',       color: 'blue'   },
  ASSIGNED:  { label: 'Nhận đơn', color: 'orange' },
  PACKED:    { label: 'Đóng gói', color: 'orange' },
  SHIPPED:   { label: 'Giao hàng',color: 'teal'   },
  DONE:      { label: 'Hoàn thành',color:'green'  },
  CANCELLED: { label: 'Huỷ',      color: 'red'    },
};

const FILTERS = ['Tất cả', 'Mới', 'Đóng gói', 'Hoàn thành'];

// Mock data — sau khi API thật thì thay
const MOCK_ORDERS = [
  { id:'DH-20260318-042', platform:'Shopee', customer:'Nguyễn Văn B', address:'Cầu Giấy, HN', items:[{name:'Áo thun',qty:2},{name:'Quần short',qty:1}], status:'NEW' },
  { id:'DH-20260318-041', platform:'TikTok', customer:'Trần Thị C',   address:'Đống Đa, HN',  items:[{name:'Váy hoa',qty:1}], status:'PACKED' },
  { id:'DH-20260318-040', platform:'Sapo',   customer:'Lê Văn D',     address:'Hoàn Kiếm, HN',items:[{name:'Áo polo',qty:1},{name:'Áo sơ mi',qty:1}], status:'DONE' },
  { id:'DH-20260318-039', platform:'Shopee', customer:'Phạm Thị E',   address:'Quận 1, SG',   items:[{name:'Đầm dự tiệc',qty:1}], status:'NEW' },
  { id:'DH-20260318-038', platform:'Lazada', customer:'Hoàng Văn F',  address:'Quận 3, SG',   items:[{name:'Áo khoác',qty:1},{name:'Quần jeans',qty:2}], status:'ASSIGNED' },
];

export default function WMS() {
  const [orders, setOrders]   = useState(MOCK_ORDERS);
  const [filter, setFilter]   = useState('Tất cả');
  const [loading, setLoading] = useState(false);

  const filtered = orders.filter(o => {
    if (filter === 'Tất cả') return true;
    if (filter === 'Mới') return o.status === 'NEW';
    if (filter === 'Đóng gói') return ['ASSIGNED','PACKED'].includes(o.status);
    if (filter === 'Hoàn thành') return o.status === 'DONE';
    return true;
  });

  const countByFilter = (f) => {
    if (f === 'Tất cả') return orders.length;
    if (f === 'Mới') return orders.filter(o => o.status === 'NEW').length;
    if (f === 'Đóng gói') return orders.filter(o => ['ASSIGNED','PACKED'].includes(o.status)).length;
    if (f === 'Hoàn thành') return orders.filter(o => o.status === 'DONE').length;
    return 0;
  };

  const handleAction = (id, action) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      if (action === 'accept') return { ...o, status: 'ASSIGNED' };
      if (action === 'pack')   return { ...o, status: 'PACKED' };
      if (action === 'ship')   return { ...o, status: 'SHIPPED' };
      return o;
    }));
  };

  return (
    <div className="wms fade-up">
      {/* Header */}
      <div className="wms-header">
        <div>
          <h1 className="wms-title">Kho hàng</h1>
          <p className="wms-sub">Hôm nay · {orders.length} đơn · Kho HN</p>
        </div>
        <div className="wms-actions">
          <button className="wms-btn ghost">📷 Scan mã</button>
          <button className="wms-btn gold">+ Nhập hàng</button>
        </div>
      </div>

      {/* Stats */}
      <div className="wms-stats">
        <div className="wms-stat"><div className="wms-stat-val">{orders.filter(o=>o.status==='NEW').length}</div><div className="wms-stat-lbl">Đơn mới</div></div>
        <div className="wms-stat"><div className="wms-stat-val">{orders.filter(o=>['ASSIGNED','PACKED'].includes(o.status)).length}</div><div className="wms-stat-lbl">Đang xử lý</div></div>
        <div className="wms-stat"><div className="wms-stat-val" style={{color:'var(--green)'}}>{orders.filter(o=>o.status==='DONE').length}</div><div className="wms-stat-lbl">Hoàn thành</div></div>
        <div className="wms-stat"><div className="wms-stat-val" style={{color:'var(--orange)'}}>3</div><div className="wms-stat-lbl">Tồn kho thấp</div></div>
      </div>

      {/* Filters */}
      <div className="wms-filters">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`wms-filter${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f} <span className="filter-count">({countByFilter(f)})</span>
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="orders-list">
        {filtered.map(order => {
          const s = STATUS_MAP[order.status];
          return (
            <div key={order.id} className="order-card">
              <div className="oc-top">
                <div className="oc-code">{order.id}</div>
                <span className={`status-pill ${s.color}`}>{s.label}</span>
              </div>
              <div className="oc-meta">
                <span className="oc-platform">{order.platform}</span>
                <span className="oc-sep">·</span>
                <span className="oc-customer">{order.customer}</span>
                <span className="oc-sep">·</span>
                <span className="oc-address">{order.address}</span>
              </div>
              <div className="oc-items">
                {order.items.map(item => (
                  <span key={item.name} className="oc-item-tag">
                    {item.name} <strong>×{item.qty}</strong>
                  </span>
                ))}
              </div>
              <div className="oc-actions">
                <button className="oc-btn ghost">Chi tiết</button>
                {order.status === 'NEW' && (
                  <button className="oc-btn gold" onClick={() => handleAction(order.id, 'accept')}>
                    Nhận đơn →
                  </button>
                )}
                {order.status === 'ASSIGNED' && (
                  <button className="oc-btn gold" onClick={() => handleAction(order.id, 'pack')}>
                    Đã đóng gói ✓
                  </button>
                )}
                {order.status === 'PACKED' && (
                  <button className="oc-btn teal" onClick={() => handleAction(order.id, 'ship')}>
                    Bàn giao vận chuyển →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
