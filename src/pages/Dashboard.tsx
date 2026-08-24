import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Users, UserPlus, Send, CheckCircle2, Flame, Calendar as CalendarIcon, 
  FileText, Trophy, ArrowUpRight, ArrowDownRight, Sparkles, 
  Clock, Phone, Mail, MoreHorizontal, CheckSquare
} from 'lucide-react';

const stats = [
  { title: 'Total Leads', value: '12,450', change: '+12.5%', isPositive: true, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
  { title: 'New Leads', value: '450', change: '+5.2%', isPositive: true, icon: UserPlus, color: 'text-purple-500', bg: 'bg-purple-50' },
  { title: 'Contacted', value: '3,200', change: '+18.1%', isPositive: true, icon: Send, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { title: 'Qualified', value: '850', change: '+2.4%', isPositive: true, icon: CheckCircle2, color: 'text-brand-success', bg: 'bg-brand-success/10' },
  { title: 'Interested', value: '420', change: '-1.2%', isPositive: false, icon: Flame, color: 'text-brand-warning', bg: 'bg-brand-warning/10' },
  { title: 'Meetings', value: '112', change: '+14.5%', isPositive: true, icon: CalendarIcon, color: 'text-pink-500', bg: 'bg-pink-50' },
  { title: 'Proposals Sent', value: '45', change: '+8.2%', isPositive: true, icon: FileText, color: 'text-teal-500', bg: 'bg-teal-50' },
  { title: 'Deals Won', value: '18', change: '+22.5%', isPositive: true, icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50' },
];

const pipelineData = [
  { name: 'New', value: 1250 },
  { name: 'Contacted', value: 980 },
  { name: 'Replied', value: 640 },
  { name: 'Qualified', value: 420 },
  { name: 'Meeting', value: 210 },
  { name: 'Proposal', value: 85 },
  { name: 'Won', value: 32 },
];

const sourceData = [
  { name: 'Google Maps', value: 45 },
  { name: 'Website Form', value: 25 },
  { name: 'Manual Import', value: 15 },
  { name: 'Referral', value: 10 },
  { name: 'Other', value: 5 },
];
const COLORS = ['#6D45E5', '#8B5CF6', '#10B981', '#F59E0B', '#6B7280'];

const followUps = [
  { id: 1, name: 'Sarah Jenkins', company: 'TechStart', time: '2 hours ago', status: 'Hot Lead' },
  { id: 2, name: 'Mike Ross', company: 'Global Solutions', time: '4 hours ago', status: 'Needs Reply' },
  { id: 3, name: 'Emily Chen', company: 'InnovateHub', time: 'Yesterday', status: 'Proposal Sent' },
  { id: 4, name: 'David Lee', company: 'CloudScale', time: '2 days ago', status: 'Meeting' },
];

const tasks = [
  { id: 1, type: 'Follow-up', desc: 'Call David regarding proposal', time: '10:00 AM', completed: false, icon: Phone },
  { id: 2, type: 'Email', desc: 'Send introductory deck to Acme Corp', time: '11:30 AM', completed: true, icon: Mail },
  { id: 3, type: 'Meeting', desc: 'Product demo with TechStart', time: '2:00 PM', completed: false, icon: CalendarIcon },
  { id: 4, type: 'Proposal', desc: 'Draft contract for Global Solutions', time: '4:00 PM', completed: false, icon: FileText },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Good morning, John 👋</h1>
          <p className="text-sm text-brand-muted mt-1">Here's what's happening with your leads today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-gray-200 text-brand-text hover:bg-gray-50 font-medium py-2 px-4 rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2">
            <CalendarIcon size={16} className="text-brand-muted" />
            May 1 - May 31, 2026
          </button>
        </div>
      </div>

      {/* 8 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon size={18} className={stat.color} />
                </div>
                <div className={`flex items-center text-xs font-medium ${stat.isPositive ? 'text-brand-success' : 'text-brand-danger'}`}>
                  {stat.isPositive ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-text">{stat.value}</p>
                <h3 className="text-xs font-medium text-brand-muted mt-0.5">{stat.title}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pipeline Overview</CardTitle>
            <button className="text-gray-400 hover:text-brand-text">
              <MoreHorizontal size={20} />
            </button>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} width={80} />
                  <Tooltip 
                    cursor={{fill: '#F3F4F6'}} 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #F3F4F6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#6D45E5" radius={[0, 4, 4, 0]} barSize={24}>
                    {pipelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === pipelineData.length - 1 ? '#22C55E' : '#6D45E5'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Leads by Source</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-[220px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-brand-text">100%</span>
                <span className="text-xs text-brand-muted">Total Sources</span>
              </div>
            </div>
            <div className="w-full mt-4 space-y-2">
              {sourceData.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                    <span className="text-brand-muted">{item.name}</span>
                  </div>
                  <span className="font-medium text-brand-text">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: AI Recs & Performance */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles size={80} />
            </div>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles size={18} /> AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 bg-white/20 p-1 rounded-full"><Flame size={12} className="text-white" /></div>
                  <p className="text-sm leading-tight text-white/90"><strong className="text-white">12 hot leads</strong> need immediate follow-up based on recent engagement.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 bg-white/20 p-1 rounded-full"><Clock size={12} className="text-white" /></div>
                  <p className="text-sm leading-tight text-white/90"><strong className="text-white">5 leads</strong> have no recent activity. Consider re-engagement campaign.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 bg-white/20 p-1 rounded-full"><CheckCircle2 size={12} className="text-white" /></div>
                  <p className="text-sm leading-tight text-white/90"><strong className="text-white">3 prospects</strong> showed strong intent on your pricing page today.</p>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xs font-medium text-brand-muted mb-1">Open Rate</p>
                  <p className="text-2xl font-bold text-brand-text">68%</p>
                  <p className="text-[10px] text-brand-success mt-1 flex items-center justify-center"><ArrowUpRight size={12} /> +4.1%</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xs font-medium text-brand-muted mb-1">Reply Rate</p>
                  <p className="text-2xl font-bold text-brand-text">24%</p>
                  <p className="text-[10px] text-brand-success mt-1 flex items-center justify-center"><ArrowUpRight size={12} /> +2.3%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column: Follow-ups */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Follow-up Due</CardTitle>
            <Badge variant="warning">4 Pending</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {followUps.map((lead) => (
                <div key={lead.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar fallback={lead.name.charAt(0)} size="sm" className="bg-brand-primary/10 text-brand-primary" />
                    <div>
                      <h4 className="text-sm font-semibold text-brand-text">{lead.name}</h4>
                      <p className="text-xs text-brand-muted">{lead.company}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-medium text-brand-danger flex items-center gap-1">
                      <Clock size={12} /> {lead.time}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {lead.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100">
              <button className="w-full text-sm font-medium text-brand-primary hover:text-brand-secondary transition-colors">
                View All Follow-ups
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Tasks Today */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tasks Today</CardTitle>
            <button className="text-brand-primary hover:bg-brand-primary/10 p-1 rounded transition-colors">
              <MoreHorizontal size={18} />
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {tasks.map((task) => (
                <div key={task.id} className={`p-4 transition-colors flex items-start gap-3 ${task.completed ? 'bg-gray-50/50 opacity-75' : 'hover:bg-gray-50'}`}>
                  <button className={`mt-0.5 shrink-0 transition-colors ${task.completed ? 'text-brand-success' : 'text-gray-300 hover:text-brand-primary'}`}>
                    <CheckSquare size={18} className={task.completed ? 'fill-brand-success/20' : ''} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-brand-text flex items-center gap-1">
                        <task.icon size={12} className="text-brand-muted" /> {task.type}
                      </span>
                      <span className="text-[10px] text-brand-muted px-1.5 py-0.5 bg-gray-100 rounded">
                        {task.time}
                      </span>
                    </div>
                    <p className={`text-sm ${task.completed ? 'text-brand-muted line-through' : 'text-brand-text'}`}>
                      {task.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100">
              <button className="w-full text-sm font-medium text-brand-primary hover:text-brand-secondary transition-colors">
                Open Task Manager
              </button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
