import React from 'react';
import { useCRM } from '../store/crmStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Users, UserPlus, Send, CheckCircle2, Flame, Calendar as CalendarIcon, 
  FileText, Trophy, ArrowUpRight, Sparkles, 
  Clock, CheckSquare, AlertCircle
} from 'lucide-react';

export function Dashboard() {
  const { leads, meetings, tasks, approvals, toggleGlobalTaskComplete } = useCRM();

  // Calculations from shared data
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const contactedLeads = leads.filter(l => l.status === 'contacted' || l.status === 'replied').length;
  const qualifiedLeads = leads.filter(l => l.status === 'qualified').length;
  const meetingCount = meetings.length + leads.filter(l => l.status === 'meeting').length;
  const proposalCount = leads.filter(l => l.status === 'proposal').length;
  const wonCount = leads.filter(l => l.status === 'won').length;
  const pendingApprovalsCount = approvals.filter(a => a.status === 'pending').length;
  const tasksDueCount = tasks.filter(t => !t.completed).length;

  const stats = [
    { title: 'Total Leads', value: totalLeads.toLocaleString(), change: '+12.5%', isPositive: true, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'New Leads', value: newLeads.toLocaleString(), change: '+5.2%', isPositive: true, icon: UserPlus, color: 'text-purple-500', bg: 'bg-purple-50' },
    { title: 'Contacted', value: contactedLeads.toLocaleString(), change: '+18.1%', isPositive: true, icon: Send, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { title: 'Qualified', value: qualifiedLeads.toLocaleString(), change: '+2.4%', isPositive: true, icon: CheckCircle2, color: 'text-brand-success', bg: 'bg-brand-success/10' },
    { title: 'Meetings', value: meetingCount.toLocaleString(), change: '+14.5%', isPositive: true, icon: CalendarIcon, color: 'text-pink-500', bg: 'bg-pink-50' },
    { title: 'Proposals', value: proposalCount.toLocaleString(), change: '+8.2%', isPositive: true, icon: FileText, color: 'text-teal-500', bg: 'bg-teal-50' },
    { title: 'Deals Won', value: wonCount.toLocaleString(), change: '+22.5%', isPositive: true, icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { title: 'Pending Approvals', value: pendingApprovalsCount.toLocaleString(), change: pendingApprovalsCount > 0 ? 'Action Req' : 'All Clear', isPositive: pendingApprovalsCount === 0, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Tasks Due', value: tasksDueCount.toLocaleString(), change: tasksDueCount > 0 ? 'Pending' : 'Done', isPositive: tasksDueCount === 0, icon: CheckSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  // Pipeline Data from actual leads
  const pipelineData = [
    { name: 'New', value: leads.filter(l => l.status === 'new').length },
    { name: 'Contacted', value: leads.filter(l => l.status === 'contacted').length },
    { name: 'Replied', value: leads.filter(l => l.status === 'replied').length },
    { name: 'Qualified', value: leads.filter(l => l.status === 'qualified').length },
    { name: 'Meeting', value: leads.filter(l => l.status === 'meeting').length },
    { name: 'Proposal', value: leads.filter(l => l.status === 'proposal').length },
    { name: 'Won', value: leads.filter(l => l.status === 'won').length },
  ];

  // Sources Data from actual leads
  const sourceMap: { [key: string]: number } = {};
  leads.forEach(l => {
    const src = l.source || 'Other';
    sourceMap[src] = (sourceMap[src] || 0) + 1;
  });
  const sourceData = Object.keys(sourceMap).length > 0 
    ? Object.keys(sourceMap).map(name => ({ name, value: sourceMap[name] }))
    : [{ name: 'Google Maps', value: 1 }];

  const COLORS = ['#6D45E5', '#8B5CF6', '#10B981', '#F59E0B', '#6B7280', '#EC4899', '#14B8A6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">CRM Dashboard 👋</h1>
          <p className="text-sm text-brand-muted mt-1">Real-time overview of your shared CRM pipeline and tasks.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-gray-200 text-brand-text hover:bg-gray-50 font-medium py-2 px-4 rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2">
            <CalendarIcon size={16} className="text-brand-muted" />
            Live CRM Metrics
          </button>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon size={18} className={stat.color} />
                </div>
                <div className={`flex items-center text-xs font-medium ${stat.isPositive ? 'text-brand-success' : 'text-amber-600'}`}>
                  {stat.isPositive ? <ArrowUpRight size={14} className="mr-0.5" /> : null}
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
            <CardTitle>Pipeline Overview (Live)</CardTitle>
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
                <span className="text-2xl font-bold text-brand-text">{totalLeads}</span>
                <span className="text-xs text-brand-muted">Total Leads</span>
              </div>
            </div>
            <div className="w-full mt-4 space-y-2">
              {sourceData.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="text-brand-muted">{item.name}</span>
                  </div>
                  <span className="font-medium text-brand-text">{item.value} leads</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: AI Recommendations */}
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
                  <p className="text-sm leading-tight text-white/90"><strong className="text-white">{newLeads} new leads</strong> awaiting initial outreach.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 bg-white/20 p-1 rounded-full"><Clock size={12} className="text-white" /></div>
                  <p className="text-sm leading-tight text-white/90"><strong className="text-white">{pendingApprovalsCount} pending approvals</strong> in the AI messaging queue.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 bg-white/20 p-1 rounded-full"><CheckCircle2 size={12} className="text-white" /></div>
                  <p className="text-sm leading-tight text-white/90"><strong className="text-white">{tasksDueCount} tasks due</strong> on your schedule today.</p>
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
                  <p className="text-xs font-medium text-brand-muted mb-1">Qualification Rate</p>
                  <p className="text-2xl font-bold text-brand-text">{totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0}%</p>
                  <p className="text-[10px] text-brand-success mt-1 flex items-center justify-center"><ArrowUpRight size={12} /> Live Ratio</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xs font-medium text-brand-muted mb-1">Win Rate</p>
                  <p className="text-2xl font-bold text-brand-text">{totalLeads > 0 ? Math.round((wonCount / totalLeads) * 100) : 0}%</p>
                  <p className="text-[10px] text-brand-success mt-1 flex items-center justify-center"><ArrowUpRight size={12} /> Live Ratio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column: Recent Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Leads</CardTitle>
            <Badge variant="primary">{leads.length} Total</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {leads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar fallback={lead.companyName.charAt(0)} size="sm" className="bg-brand-primary/10 text-brand-primary" />
                    <div>
                      <h4 className="text-sm font-semibold text-brand-text">{lead.companyName}</h4>
                      <p className="text-xs text-brand-muted">{lead.contactName}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 uppercase">
                      {lead.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Tasks Today */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tasks Due</CardTitle>
            <Badge variant="warning">{tasksDueCount} Pending</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {tasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400">No tasks created yet.</div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className={`p-4 transition-colors flex items-start gap-3 ${task.completed ? 'bg-gray-50/50 opacity-75' : 'hover:bg-gray-50'}`}>
                    <button 
                      onClick={() => toggleGlobalTaskComplete(task.id)}
                      className={`mt-0.5 shrink-0 transition-colors ${task.completed ? 'text-brand-success' : 'text-gray-300 hover:text-brand-primary'}`}
                    >
                      <CheckSquare size={18} className={task.completed ? 'fill-brand-success/20' : ''} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-brand-text">
                          {task.leadName || 'General Task'}
                        </span>
                        <span className="text-[10px] text-brand-muted px-1.5 py-0.5 bg-gray-100 rounded">
                          {task.dueDate}
                        </span>
                      </div>
                      <p className={`text-sm ${task.completed ? 'text-brand-muted line-through' : 'text-brand-text'}`}>
                        {task.title}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
