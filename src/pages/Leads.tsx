import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Search, Filter, Download, MoreHorizontal, MessageSquare, Mail, Building2, User } from 'lucide-react';

const mockLeads = [
  { id: 1, name: 'John Smith', role: 'VP Sales', company: 'Acme Corp', email: 'john@acme.co', status: 'Active', score: 92, lastContact: '2h ago' },
  { id: 2, name: 'Sarah Jenkins', role: 'Director of Marketing', company: 'TechStart', email: 's.jenkins@techstart.io', status: 'New', score: 88, lastContact: 'Never' },
  { id: 3, name: 'Mike Ross', role: 'Head of Growth', company: 'Global Solutions', email: 'mike.ross@globalsol.com', status: 'Replied', score: 95, lastContact: '1d ago' },
  { id: 4, name: 'Emily Chen', role: 'Founder & CEO', company: 'InnovateHub', email: 'emily@innovatehub.ai', status: 'Meeting Booked', score: 99, lastContact: '3d ago' },
  { id: 5, name: 'David Lee', role: 'VP Engineering', company: 'CloudScale', email: 'dlee@cloudscale.net', status: 'Unresponsive', score: 75, lastContact: '1w ago' },
];

export function Leads() {
  const [leads] = useState(mockLeads);
  
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'active': return 'bg-blue-100 text-blue-700';
      case 'new': return 'bg-purple-100 text-purple-700';
      case 'replied': return 'bg-brand-warning/20 text-brand-warning';
      case 'meeting booked': return 'bg-brand-success/20 text-brand-success';
      case 'unresponsive': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Leads</h1>
          <p className="text-sm text-brand-muted mt-1">Manage your contacts and track engagement.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-gray-200 text-brand-text hover:bg-gray-50 font-medium py-2 px-4 rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2">
            <Download size={16} />
            Export
          </button>
          <button className="bg-brand-primary hover:bg-brand-secondary text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors shadow-sm">
            Add Lead
          </button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                placeholder="Search by name, company, or email..."
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-text bg-white border border-gray-200 rounded-lg hover:bg-gray-50 w-full sm:w-auto justify-center">
                <Filter size={16} />
                More Filters
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
                      Lead
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">AI Score</th>
                  <th className="px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Last Contact</th>
                  <th className="px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xs shrink-0">
                          {lead.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-brand-text text-sm flex items-center gap-1.5">
                            <Link to={`/leads/${lead.id}`} className="hover:text-brand-primary transition-colors">
                              {lead.name}
                            </Link>
                          </p>
                          <p className="text-xs text-brand-muted">{lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-gray-400" />
                        <div>
                          <p className="font-medium text-brand-text text-sm">{lead.company}</p>
                          <p className="text-xs text-brand-muted">{lead.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-brand-text text-sm">
                        {lead.score}/100
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-brand-muted">
                      {lead.lastContact}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-gray-400 hover:text-brand-primary rounded-md hover:bg-brand-primary/10 transition-colors">
                          <MessageSquare size={16} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-brand-primary rounded-md hover:bg-brand-primary/10 transition-colors">
                          <Mail size={16} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-brand-text rounded-md hover:bg-gray-100 transition-colors">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-brand-muted">
            <p>Showing 1 to 5 of 124 leads</p>
            <div className="flex gap-1">
              <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50">Prev</button>
              <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">Next</button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
