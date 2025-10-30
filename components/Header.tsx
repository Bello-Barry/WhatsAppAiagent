
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { LogOutIcon } from './icons/LogOutIcon';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50 backdrop-blur-sm border-b border-dark-border">
      <h1 className="text-xl font-semibold text-dark-text-primary hidden md:block">
        Welcome back
      </h1>
      <div className="md:hidden">
         <span className="text-xl font-bold">WA Agent AI</span>
      </div>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-dark-card transition-colors"
        >
          <img
            className="h-9 w-9 rounded-full"
            src={`https://i.pravatar.cc/150?u=${user?.email}`}
            alt="User avatar"
          />
          <span className="hidden sm:inline text-sm font-medium">{user?.email}</span>
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-dark-card rounded-lg shadow-lg py-1 z-10 border border-dark-border">
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
            >
              <LogOutIcon className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
