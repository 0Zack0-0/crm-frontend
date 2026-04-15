import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Briefcase, 
  Users, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Calendar
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { MOCK_PROJECTS, MOCK_CLIENTS } from '../constants';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const data = [
  { name: 'JAN', value: 4000, expenses: 2400 },
  { name: 'FEB', value: 3000, expenses: 1398 },
  { name: 'MAR', value: 2000, expenses: 9800 },
  { name: 'APR', value: 2780, expenses: 3908 },
  { name: 'MAY', value: 1890, expenses: 4800 },
  { name: 'JUN', value: 2390, expenses: 3800 },
  { name: 'JUL', value: 3490, expenses: 4300 },
];

const Dashboard: React.FC = () => {
  const totalBudget = MOCK_PROJECTS.reduce((acc, p) => acc + p.budget, 0);
  const totalSpent = MOCK_PROJECTS.reduce((acc, p) => acc + p.spent, 0);
  const activeProjects = MOCK_PROJECTS.filter(p => p.status === 'in-progress').length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 space-y-8"
    >
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Portfolio Value" 
          value={`$${(totalBudget / 1000000).toFixed(2)}M`} 
          change="+12.5%" 
          isPositive={true}
          icon={DollarSign}
        />
        <MetricCard 
          title="Active Projects" 
          value={activeProjects.toString()} 
          change="+2" 
          isPositive={true}
          icon={Briefcase}
        />
        <MetricCard 
          title="Total Clients" 
          value={MOCK_CLIENTS.length.toString()} 
          change="0" 
          isPositive={true}
          icon={Users}
        />
        <MetricCard 
          title="Budget Utilization" 
          value={`${((totalSpent / totalBudget) * 100).toFixed(1)}%`} 
          change="-2.4%" 
          isPositive={false}
          icon={Activity}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Revenue vs Expenses</h3>
              <p className="text-2xl font-bold tracking-tighter">$1.24M Total Revenue</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-black rounded-full"></div>
                <span>REVENUE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>EXPENSES</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#999' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#999' }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#000', 
                    border: 'none', 
                    borderRadius: '0px',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#000" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#ccc" 
                  strokeWidth={2}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Project Distribution</h3>
          <div className="space-y-6">
            {MOCK_PROJECTS.map((project) => (
              <div key={project.id} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="truncate max-w-[150px]">{project.name}</span>
                  <span>{((project.spent / project.budget) * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(project.spent / project.budget) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn(
                      "h-full",
                      project.status === 'completed' ? "bg-green-500" : "bg-black"
                    )}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                  <span>${(project.spent / 1000).toFixed(0)}k spent</span>
                  <span>${(project.budget / 1000).toFixed(0)}k budget</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <button className="w-full py-2 text-xs font-bold border border-black hover:bg-black hover:text-white transition-all rounded-sm">
              VIEW ALL PROJECTS
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Activity & Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Recent Activity</h3>
            <Clock size={16} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Activity size={14} className="text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold">Structural review completed for Blackwood Estate</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">2 hours ago • Project P1</p>
                </div>
                <button className="text-[10px] font-bold text-gray-400 hover:text-black transition-colors">DETAILS</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Upcoming Milestones</h3>
            <Calendar size={16} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            {MOCK_PROJECTS.filter(p => p.status !== 'completed').map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-gray-200 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-gray-400">MAY</span>
                    <span className="text-sm font-bold leading-none">12</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold">{p.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Phase 3 Approval</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-black">${(p.budget * 0.15 / 1000).toFixed(0)}k</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Expected</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ElementType;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, isPositive, icon: Icon }) => (
  <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm hover:border-black transition-colors group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-gray-50 rounded-sm group-hover:bg-black group-hover:text-white transition-colors">
        <Icon size={18} />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-xs font-bold",
        isPositive ? "text-green-600" : "text-red-600"
      )} >
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        <span>{change}</span>
      </div>
    </div>
    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{title}</h3>
    <p className="text-2xl font-bold tracking-tighter">{value}</p>
  </div>
);

export default Dashboard;
