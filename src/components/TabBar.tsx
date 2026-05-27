import { NavLink } from 'react-router-dom';
import { IconOutfit, IconShirt, IconCalendar, IconSettings } from './Icons';

const tabs = [
  { path: '/', label: '今日穿搭', Icon: IconOutfit },
  { path: '/wardrobe', label: '我的衣橱', Icon: IconShirt },
  { path: '/calendar', label: '日历事件', Icon: IconCalendar },
  { path: '/settings', label: '设置', Icon: IconSettings },
];

export default function TabBar() {
  return (
    <nav className="tab-bar">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
        >
          <span className="tab-icon">
            <tab.Icon size={22} />
          </span>
          <span className="tab-label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
