import React from 'react';
import { Search, Bell, Plus, Filter, Download } from 'lucide-react';
import { cn } from '../lib/utils';

interface HeaderProps {
  title: string;
  onSearch?: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ title, onSearch }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-8">
        <h1 className="text-xl font-bold tracking-tighter uppercase">{title}</h1>
        
        <div className="relative group max-w-md w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search architectural records..."
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-sm py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:border-black focus:bg-white transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 border-r border-gray-100 pr-4">
          <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-sm transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-black rounded-full border border-white"></span>
          </button>
          <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-sm transition-colors">
            <Filter size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-sm transition-colors">
            <Download size={18} />
          </button>
        </div>
        
        <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-sm text-xs font-bold hover:bg-gray-800 transition-colors">
          <Plus size={16} />
          <span>NEW PROJECT</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
