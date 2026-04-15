/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ClientList from './components/ClientList';
import LedgerView from './components/LedgerView';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <ProjectList />;
      case 'clients':
        return <ClientList />;
      case 'ledger':
        return <LedgerView />;
      case 'settings':
        return (
          <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold">S</span>
            </div>
            <h2 className="text-xl font-bold uppercase tracking-tighter">System Settings</h2>
            <p className="text-sm text-gray-400 mt-2 max-w-md">Configure architectural standards, ledger categories, and user permissions for the Nexus CRM environment.</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Portfolio Overview';
      case 'projects': return 'Architectural Projects';
      case 'clients': return 'Client Directory';
      case 'ledger': return 'Financial Ledger';
      case 'settings': return 'System Settings';
      default: return 'Nexus CRM';
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex font-sans text-black selection:bg-black selection:text-white">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        <Header title={getTitle()} />
        
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
        
        <footer className="h-10 border-t border-gray-100 px-8 flex items-center justify-between bg-white text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <div className="flex items-center gap-4">
            <span>© 2026 NEXUS ARCHITECTURAL LEDGER</span>
            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
            <span>V 2.4.0</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              SYSTEM OPERATIONAL
            </span>
            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
            <span>UTC 11:17:24</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
