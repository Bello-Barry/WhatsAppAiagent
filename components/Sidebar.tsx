
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboardIcon } from './icons/LayoutDashboardIcon';
import { CogIcon } from './icons/CogIcon';
import { BotIcon } from './icons/BotIcon';

const Sidebar: React.FC = () => {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-brand-primary/20 text-brand-primary'
        : 'hover:bg-dark-card hover:text-dark-text-primary text-dark-text-secondary'
    }`;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-gray-900 border-r border-dark-border">
      <div className="flex items-center justify-center h-20 border-b border-dark-border">
        <BotIcon className="h-8 w-8 text-brand-primary" />
        <span className="ml-3 text-xl font-bold">WA Agent AI</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavLink to="/" end className={navLinkClasses}>
          <LayoutDashboardIcon className="h-5 w-5 mr-3" />
          Dashboard
        </NavLink>
        <NavLink to="/settings" className={navLinkClasses}>
          <CogIcon className="h-5 w-5 mr-3" />
          Settings
        </NavLink>
      </nav>
      <div className="px-4 py-6 border-t border-dark-border">
        <p className="text-xs text-dark-text-secondary">© 2024 WA Agent AI SaaS</p>
      </div>
    </aside>
  );
};

export default Sidebar;
