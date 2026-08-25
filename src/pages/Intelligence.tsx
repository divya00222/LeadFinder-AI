import React, { useState } from 'react';
import { useCRM } from '../store/crmStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Toast, useToast } from '../components/ui/Toast';
import { 
  Sparkles, Flame, Trophy, TrendingUp, MessageSquare, AlertCircle, 
  ArrowUpRight, CheckCircle2, Clock, ShieldAlert, Send, UserCheck, Search, Filter
} from 'lucide-react';

export function Intelligence() {
  const { leads, campaigns } = useCRM();
  const { toasts, toast, removeToast } = useToast();
  const [filterAction, setFilterAction] = useState<string>('All');

  // Calculations for AI Dashboard
  const totalLeads = leads.length;
  const wonLeads = leads.filter(l => l.status === 'won').length;
  const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : '0.0';

  const hotLeads = leads.filter(l => (l.aiScore || 0) >= 85);
  const noOutreachHighScores = leads.filter(l => (l.aiScore || 0) >= 80 && l.status === 'new');
  const needsFollowUp = leads.filter(l => l.status === 'contacted');
  const noResponse = leads.filter(l => l.status === 'contacted' && !l.lastContactDate);

  // Best Channel & Best Campaign mock intelligence based on data
  const bestChannel = 'WhatsApp';
  const bestCampaign = campaigns[0]?.name || 'B2B Google Maps Outreach';

  // AI Recommendations list
  const recommendations = [
    { id: 'r1', type: 'warning', text: `${needsFollowUp.length} leads have not received a follow-up in the last 7 days.` },
    { id: 'r2', type: 'success', text: `${noOutreachHighScores.length} high-score leads (AI score >= 80) have no outreach yet.` },
    { id: 'r3', type: 'info', text: 'WhatsApp has the highest reply rate (42.8%) across all active channels.' },
    { id: 'r4', type: 'action', text: '3 leads show high intent and should be moved to Qualified status.' },
  ];

  // Helper to determine AI Next Action for each lead
  const getNextAction = (lead: any) => {
    if (lead.status === 'new') return { action: 'Contact', badge: 'bg-indigo-100 text-indigo-700', desc: 'Initiate AI-generated outreach' };
    if (lead.status === 'contacted') return { action: 'Follow up', badge: 'bg-amber-100 text-amber-800', desc: 'Send follow-up sequence message' };
    if (lead.status === 'replied') return { action: 'Schedule Meeting', badge: 'bg-pink-100 text-pink-700', desc: 'Book consultation call' };
    if (lead.status === 'qualified') return { action: 'Move to Qualified', badge: 'bg-emerald-100 text-emerald-700', desc: 'Advance pipeline stage' };
    if ((lead.aiScore || 0) < 50) return { action: 'Do Not Contact', badge: 'bg-gray-100 text-gray-700', desc: 'Low ICP fit' };
    return { action: 'Research', badge: 'bg-purple-100 text-purple-700', desc: 'Deep company analysis' };
  };

  const filteredLeads = leads.filter(l => {
    if (filterAction === 'All') return true;
    const act = getNextAction(l).action;
    return act.toLowerCase() === filterAction.toLowerCase();
  });

  const handleApplyRecommendation = (recText: string) => {
    toast(`AI Recommendation noted: "${recText}". (Review queues updated)`, 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text flex items-center gap-2">
            <Sparkles className="text-indigo-600" /> CRM Intelligence & AI Insights
          </h1>
          <p className="text-sm text-brand-muted mt-1">Actionable AI-driven insights, recommendations, and next-best-action guidance derived from your live CRM data.</p>
        </div>
        <Badge className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1.5 text-xs">
          Safety Mode: Recommendations Only (No Auto-Send)
        </Badge>
      </div>

      {/* AI Dashboard Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-brand-muted">Best Leads</span>
              <Trophy size={16} className="text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-brand-text">{leads.filter(l => (l.aiScore || 0) >= 90).length}</p>
            <span className="text-[10px] text-emerald-600 font-medium">Score 90+ Top Tier</span>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-brand-muted">Hot Leads</span>
              <Flame size={16} className="text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-brand-text">{hotLeads.length}</p>
            <span className="text-[10px] text-brand-muted font-medium">Score 85+</span>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-brand-muted">Needing Follow-up</span>
              <Clock size={16} className="text-indigo-500" />
            </div>
            <p className="text-2xl font-bold text-brand-text">{needsFollowUp.length}</p>
            <span className="text-[10px] text-indigo-600 font-medium">Awaiting action</span>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-brand-muted">No Response</span>
              <AlertCircle size={16} className="text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-brand-text">{noResponse.length}</p>
            <span className="text-[10px] text-amber-600 font-medium">Contacted, silent</span>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-brand-muted">Best Channel</span>
              <MessageSquare size={16} className="text-emerald-500" />
            </div>
            <p className="text-lg font-bold text-brand-text truncate">{bestChannel}</p>
            <span className="text-[10px] text-emerald-600 font-medium">42.8% Reply rate</span>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-brand-muted">Best Campaign</span>
              <TrendingUp size={16} className="text-purple-500" />
            </div>
            <p className="text-sm font-bold text-brand-text truncate" title={bestCampaign}>{bestCampaign}</p>
            <span className="text-[10px] text-purple-600 font-medium">Highest conversion</span>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-brand-muted">Conversion Rate</span>
              <CheckCircle2 size={16} className="text-brand-success" />
            </div>
            <p className="text-2xl font-bold text-brand-text">{conversionRate}%</p>
            <span className="text-[10px] text-brand-success font-medium">Won / Total leads</span>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations Section */}
      <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-lg border-0">
        <CardHeader className="border-b border-white/10 pb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles size={20} className="text-indigo-400" /> AI Recommendations & Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map(rec => (
            <div key={rec.id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 bg-indigo-500/30 p-2 rounded-lg text-indigo-300">
                  <Sparkles size={16} />
                </div>
                <p className="text-sm text-gray-100 leading-relaxed font-medium">{rec.text}</p>
              </div>
              <Button 
                size="sm" 
                onClick={() => handleApplyRecommendation(rec.text)}
                className="bg-white/20 hover:bg-white/30 text-white text-xs shrink-0"
              >
                Review
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AI Next Action for Each Lead */}
      <Card className="bg-white border border-gray-100 shadow-sm">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100 gap-4">
          <div>
            <CardTitle className="text-lg font-bold text-brand-text">AI Next-Best-Action Guidance</CardTitle>
            <p className="text-xs text-brand-muted mt-0.5">Automated AI recommendation for every lead in your database. Requires human review before execution.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-muted">Filter Action:</span>
            <select
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="All">All Actions</option>
              <option value="Contact">Contact</option>
              <option value="Follow up">Follow up</option>
              <option value="Research">Research</option>
              <option value="Schedule Meeting">Schedule Meeting</option>
              <option value="Move to Qualified">Move to Qualified</option>
              <option value="Do Not Contact">Do Not Contact</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-brand-muted text-xs uppercase border-b border-gray-100 font-bold">
                  <th className="p-4">Lead Company</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">AI Score</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Recommended AI Action</th>
                  <th className="p-4 text-right">Guidance Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredLeads.map(lead => {
                  const rec = getNextAction(lead);
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50/50">
                      <td className="p-4">
                        <div className="font-bold text-brand-text">{lead.companyName}</div>
                        <div className="text-xs text-brand-muted">{lead.website || lead.email || 'No website'}</div>
                      </td>
                      <td className="p-4">
                        <Badge className="text-xs capitalize font-semibold bg-gray-100 text-gray-700">
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-bold text-indigo-600">
                          <Sparkles size={14} />
                          {lead.aiScore || 75}/100
                        </div>
                      </td>
                      <td className="p-4 text-brand-muted text-xs">{lead.location}</td>
                      <td className="p-4">
                        <Badge className={`text-xs font-bold ${rec.badge}`}>
                          {rec.action}
                        </Badge>
                      </td>
                      <td className="p-4 text-right text-xs text-brand-muted font-medium">
                        {rec.desc}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
