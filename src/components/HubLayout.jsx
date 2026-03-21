import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import './HubLayout.css';

export default function HubLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="hub-layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="hub-main">
        <Outlet />
      </div>
    </div>
  );
}
