import React from 'react';
import { 
  MoreVertical, 
  Search, 
  Filter, 
  Plus, 
  Mail, 
  Phone, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { MOCK_CLIENTS, MOCK_PROJECTS } from '../constants';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const ClientList: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_CLIENTS.map((client) => {
          const clientProjects = MOCK_PROJECTS.filter(p => p.clientId === client.id);
          const totalBudget = clientProjects.reduce((acc, p) => acc + p.budget, 0);
          
          return (
            <div key={client.id} className="bg-white border border-gray-200 rounded-sm shadow-sm hover:border-black transition-all group p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 flex items-center justify-center text-lg font-bold border border-gray-200">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight">{client.name}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                      <Building2 size={10} />
                      <span>{client.company}</span>
                    </div>
                  </div>
                </div>
                <div className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                  client.status === 'active' ? "bg-green-50 text-green-700 border-green-100" : "bg-gray-50 text-gray-700 border-gray-100"
                )}>
                  {client.status}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <Mail size={14} className="text-gray-400" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <Phone size={14} className="text-gray-400" />
                  <span>{client.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Projects</p>
                  <p className="text-sm font-bold">{clientProjects.length}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Portfolio</p>
                  <p className="text-sm font-bold">${(totalBudget / 1000).toFixed(0)}k</p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex-1 bg-black text-white py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-gray-800 transition-colors">
                  VIEW PROFILE
                </button>
                <button className="p-2 border border-gray-200 hover:border-black rounded-sm transition-colors">
                  <MessageSquare size={14} />
                </button>
              </div>
            </div>
          );
        })}
        
        <button className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-sm flex flex-col items-center justify-center p-6 hover:border-black hover:bg-white transition-all group min-h-[280px]">
          <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-4 group-hover:bg-black group-hover:text-white transition-colors">
            <Plus size={24} />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-black">Add New Client</p>
        </button>
      </div>
    </motion.div>
  );
};

export default ClientList;
