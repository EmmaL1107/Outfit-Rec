import { NavLink } from 'react-router-dom';
import { IconOutfit, IconShirt, IconCalendar, IconSettings } from './Icons';

const tabs = [
  { path: '/', label: '今日', Icon: IconOutfit },
  { path: '/wardrobe', label: '衣橱', Icon: IconShirt },
  { path: '/calendar', label: '日历', Icon: IconCalendar },
  { path: '/settings', label: '设置', Icon: IconSettings },
];

export default function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2">
      <div className="glass-nav border border-[var(--color-border)] shadow-[0_-2px_20px_rgba(0,0,0,0.06)] rounded-2xl max-w-lg mx-auto px-3">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) => 
                `flex flex-col items-center justify-center min-w-[64px] h-14 rounded-2xl transition-all duration-200 relative ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-500 hover:text-gray-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`flex flex-col items-center justify-center ${
                    isActive ? 'w-11 h-11 bg-black rounded-2xl' : ''
                  }`}>
                    <tab.Icon size={isActive ? 18 : 20} />
                  </div>
                  <span className={`text-[11px] mt-1 ${
                    isActive ? 'text-black font-medium' : 'text-gray-500'
                  }`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-1 w-1 h-1 bg-black rounded-full"></span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
