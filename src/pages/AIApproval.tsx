import { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Check, X, Edit2, Search, Filter, MessageSquare, Mail, MessageCircle, AlertCircle } from 'lucide-react';

const mockApprovals = [
  {
    id: 1,
    leadName: 'Sarah Jenkins',
    company: 'TechStart Inc.',
    role: 'VP of Marketing',
    channel: 'LinkedIn',
    aiScore: 94,
    draftMessage: "Hi Sarah, noticed TechStart's recent expansion into the European market. Our lead routing platform integrates perfectly with HubSpot to handle exactly that kind of scale. Would you be open to a quick 5-min chat next week?",
    status: 'pending',
    reasoning: 'High intent detected based on recent news article about Series B funding and EU expansion.',
  },
  {
    id: 2,
    leadName: 'Mike Ross',
    company: 'Global Solutions',
    role: 'Sales Director',
    channel: 'Email',
    aiScore: 88,
    draftMessage: "Hey Mike - saw you're speaking at SaaStr next month. I'd love to connect. I lead partnerships here at LeadFinder AI and think there's a strong synergy between our sales toolsets.",
    status: 'pending',
    reasoning: 'Matches ideal customer profile. Approaching via event-based trigger increases response rate by 40%.',
  },
  {
    id: 3,
    leadName: 'Emily Chen',
    company: 'InnovateHub',
    role: 'Founder',
    channel: 'WhatsApp',
    aiScore: 82,
    draftMessage: "Hi Emily, reaching out because we help agencies like InnovateHub automate lead qualification. Let me know if you have 10 mins this week to see how it works.",
    status: 'pending',
    reasoning: 'Standard agency outreach template. Modified for founder-level directness.',
  }
];

export function AIApproval() {
  const [approvals, setApprovals] = useState(mockApprovals);
  
  const handleApprove = (id: number) => {
    setApprovals(approvals.filter(a => a.id !== id));
    // In a real app, this would trigger an API call to send the message
  };

  const handleReject = (id: number) => {
    setApprovals(approvals.filter(a => a.id !== id));
  };

  const getChannelIcon = (channel: string) => {
    switch(channel.toLowerCase()) {
      case 'linkedin': return <MessageSquare size={16} className="text-[#0A66C2]" />;
      case 'email': return <Mail size={16} className="text-gray-600" />;
      case 'whatsapp': return <MessageCircle size={16} className="text-[#25D366]" />;
      default: return <MessageSquare size={16} />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">AI Message Approval</h1>
          <p className="text-sm text-brand-muted mt-1">Review and approve messages drafted by AI before they are sent.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-brand-warning/10 text-brand-warning px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
            <AlertCircle size={16} />
            {approvals.length} Pending
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
            placeholder="Search pending drafts..."
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-text bg-white border border-gray-200 rounded-lg hover:bg-gray-50 w-full sm:w-auto justify-center">
          <Filter size={16} />
          Filter
        </button>
      </div>

      <div className="space-y-4">
        {approvals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
            <div className="w-12 h-12 bg-brand-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-brand-success" size={24} />
            </div>
            <h3 className="text-lg font-medium text-brand-text">All caught up!</h3>
            <p className="text-brand-muted mt-1">There are no pending messages to review.</p>
          </div>
        ) : (
          approvals.map((item) => (
            <Card key={item.id} className="overflow-hidden transition-all hover:shadow-md">
              <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  
                  {/* Lead Info */}
                  <div className="w-full md:w-1/4 shrink-0 border-r border-gray-100 pr-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-sm">
                        {item.leadName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-brand-text text-sm">{item.leadName}</h4>
                        <p className="text-xs text-brand-muted">{item.role}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mt-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-brand-muted">Company</span>
                        <span className="font-medium text-brand-text">{item.company}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-brand-muted">Channel</span>
                        <div className="flex items-center gap-1.5 font-medium text-brand-text bg-gray-50 px-2 py-0.5 rounded-md text-xs">
                          {getChannelIcon(item.channel)}
                          {item.channel}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-brand-muted">AI Score</span>
                        <span className="font-medium text-brand-success bg-brand-success/10 px-2 py-0.5 rounded-md text-xs">
                          {item.aiScore}/100
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Draft Message */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-semibold text-brand-text">AI Draft Message</h4>
                        <button className="text-xs font-medium text-brand-primary hover:text-brand-secondary flex items-center gap-1">
                          <Edit2 size={14} /> Edit Draft
                        </button>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-brand-text leading-relaxed font-mono">
                        {item.draftMessage}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-medium text-brand-muted mb-1 uppercase tracking-wider">AI Reasoning</h4>
                      <p className="text-sm text-brand-text bg-brand-primary/5 p-3 rounded-lg border border-brand-primary/10">
                        {item.reasoning}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="w-full md:w-auto flex flex-row md:flex-col gap-2 shrink-0 md:pl-4">
                    <button 
                      onClick={() => handleApprove(item.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand-success hover:bg-brand-success/90 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors shadow-sm"
                    >
                      <Check size={16} /> Approve & Send
                    </button>
                    <button 
                      onClick={() => handleReject(item.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 text-brand-danger hover:bg-brand-danger/5 font-medium py-2.5 px-4 rounded-lg text-sm transition-colors shadow-sm"
                    >
                      <X size={16} /> Reject
                    </button>
                  </div>
                  
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
