import React from 'react';
import { 
  MoreVertical, 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Tag,
  Download
} from 'lucide-react';
import { MOCK_LEDGER, MOCK_PROJECTS } from '../constants';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const LedgerView: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 space-y-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Balance</span>
            <span className="text-2xl font-bold tracking-tighter">$140,000.00</span>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Monthly Expenses</span>
            <span className="text-2xl font-bold tracking-tighter text-red-600">$60,000.00</span>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Monthly Income</span>
            <span className="text-2xl font-bold tracking-tighter text-green-600">$200,000.00</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-black rounded-sm text-xs font-bold transition-all">
            <Download size={14} />
            <span>EXPORT CSV</span>
          </button>
          <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-sm text-xs font-bold hover:bg-gray-800 transition-colors">
            <Plus size={16} />
            <span>ADD ENTRY</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Date</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Description</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Project</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Category</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Amount</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {MOCK_LEDGER.map((entry) => {
              const project = MOCK_PROJECTS.find(p => p.id === entry.projectId);
              
              return (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">{entry.date}</span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">10:30 AM</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">{entry.description}</span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">ID: {entry.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-black rounded-full"></div>
                      <span className="text-xs font-medium">{project?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded-sm text-[10px] font-bold uppercase tracking-widest text-gray-600">
                      <Tag size={10} />
                      <span>{entry.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className={cn(
                      "flex items-center justify-end gap-1.5 text-sm font-bold tracking-tight",
                      entry.type === 'income' ? "text-green-600" : "text-red-600"
                    )}>
                      {entry.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      <span>${entry.amount.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-gray-200 rounded-sm transition-colors text-gray-400 hover:text-black">
                        <ExternalLink size={16} />
                      </button>
                      <button className="p-1.5 hover:bg-gray-200 rounded-sm transition-colors text-gray-400 hover:text-black">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default LedgerView;
