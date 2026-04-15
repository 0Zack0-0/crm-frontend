import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  BookOpen, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Search,
  Bell
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'ledger', label: 'Ledger', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? '80px' : '260px' }}
      className="h-screen bg-white border-r border-gray-200 flex flex-col sticky top-0 z-50"
    >
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-black flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span className="font-bold text-xl tracking-tighter">NEXUS</span>
          </motion.div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-black flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-xl">N</span>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-200 group",
              activeTab === item.id 
                ? "bg-black text-white" 
                : "text-gray-500 hover:bg-gray-100 hover:text-black"
            )}
          >
            <item.icon className={cn("w-5 h-5 shrink-0", activeTab === item.id ? "text-white" : "text-gray-400 group-hover:text-black")} />
            {!collapsed && (
              <span className="text-sm font-medium tracking-tight whitespace-nowrap overflow-hidden">
                {item.label}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-sm transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        
        {!collapsed && (
          <div className="mt-4 flex items-center gap-3 px-2 py-3 rounded-sm bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
              AC
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">Arturo Caamaño</p>
              <p className="text-[10px] text-gray-500 truncate uppercase tracking-widest">Principal Architect</p>
            </div>
            <button className="text-gray-400 hover:text-red-600 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
