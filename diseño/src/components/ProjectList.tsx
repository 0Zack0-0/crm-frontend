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
  ExternalLink
} from 'lucide-react';
import { MOCK_PROJECTS, MOCK_CLIENTS } from '../constants';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const ProjectList: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 space-y-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-sm">
            <button className="px-4 py-1.5 text-xs font-bold bg-white shadow-sm rounded-sm">ALL PROJECTS</button>
            <button className="px-4 py-1.5 text-xs font-bold text-gray-400 hover:text-black transition-colors">ACTIVE</button>
            <button className="px-4 py-1.5 text-xs font-bold text-gray-400 hover:text-black transition-colors">COMPLETED</button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Project Name</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Client</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Budget</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Progress</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Timeline</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {MOCK_PROJECTS.map((project) => {
              const client = MOCK_CLIENTS.find(c => c.id === project.clientId);
              const progress = (project.spent / project.budget) * 100;
              
              return (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold tracking-tight">{project.name}</span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">ID: {project.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold">
                        {client?.name.charAt(0)}
                      </div>
                      <span className="text-xs font-medium">{client?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">${(project.budget / 1000).toFixed(0)}k</span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Total Budget</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-32 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span>{progress.toFixed(0)}%</span>
                        <span className="text-gray-400">${(project.spent / 1000).toFixed(0)}k</span>
                      </div>
                      <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-1000",
                            project.status === 'completed' ? "bg-green-500" : "bg-black"
                          )} 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{project.startDate}</span>
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

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles = {
    'planning': 'bg-blue-50 text-blue-700 border-blue-100',
    'in-progress': 'bg-black text-white border-black',
    'completed': 'bg-green-50 text-green-700 border-green-100',
    'on-hold': 'bg-red-50 text-red-700 border-red-100',
  }[status] || 'bg-gray-50 text-gray-700 border-gray-100';

  const icons = {
    'planning': <Clock size={10} />,
    'in-progress': <Activity size={10} />,
    'completed': <CheckCircle2 size={10} />,
    'on-hold': <AlertCircle size={10} />,
  }[status] || <Clock size={10} />;

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
      styles
    )}>
      {icons}
      <span>{status.replace('-', ' ')}</span>
    </div>
  );
};

const Activity: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

export default ProjectList;
