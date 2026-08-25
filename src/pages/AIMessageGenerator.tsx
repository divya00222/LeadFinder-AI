import React, { useState } from 'react';
import { useCRM } from '../store/crmStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Toast, useToast } from '../components/ui/Toast';
import { BrainCircuit, Send, AlertTriangle, Sparkles, RefreshCw, CheckCircle2, XCircle, Edit3, Copy, Globe, MessageSquare } from 'lucide-react';
import { Channel } from '../lib/channelUtils';

export function AIMessageGenerator() {
  const { leads, messages, approvals, addMessage, updateMessageBody, createApproval, approveMessage, rejectMessage } = useCRM();
  const { toasts, toast, removeToast } = useToast();

  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');
  const [selectedChannel, setSelectedChannel] = useState<Channel>('Gmail');
  const [selectedTone, setSelectedTone] = useState<string>('Professional');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
  const [currentApprovalId, setCurrentApprovalId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableBody, setEditableBody] = useState('');
  const [aiReasoning, setAiReasoning] = useState<string>('');
  const [personalizationPoints, setPersonalizationPoints] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  const selectedLead = leads.find(l => l.id === selectedLeadId) || leads[0];
  const currentMessage = messages.find(m => m.id === currentMessageId);

  const handleGenerateAI = async () => {
    if (!selectedLead) {
      toast('Please select a lead first', 'error');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLead.id,
          channel: selectedChannel,
          tone: selectedTone,
          language: selectedLanguage,
          company: selectedLead.companyName,
          contact: selectedLead.contactName,
          industry: selectedLead.industry,
          location: selectedLead.location,
          website: selectedLead.website,
          aiScore: selectedLead.leadScore,
          research: selectedLead.researchSummary || selectedLead.companyDescription,
          painPoints: selectedLead.possiblePainPoints,
          services: selectedLead.services,
          opportunity: selectedLead.salesOpportunity
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI generation failed');
      }

      const channelKey = selectedChannel.toLowerCase() as 'whatsapp' | 'instagram' | 'facebook' | 'gmail';

      // Create message with status: 'pending_approval', approvalStatus: 'pending'
      const msgId = addMessage({
        leadId: selectedLead.id,
        channel: channelKey,
        body: data.body,
        direction: 'outbound',
        status: 'pending_approval',
        approvalStatus: 'pending'
      });

      // Create approval request
      const appId = createApproval({
        messageId: msgId,
        leadId: selectedLead.id,
        channel: selectedChannel,
        status: 'pending'
      });

      setCurrentMessageId(msgId);
      setCurrentApprovalId(appId);
      setEditableBody(data.body);
      setAiReasoning(data.reasoning || 'Personalized based on industry intelligence and pain points.');
      setPersonalizationPoints(data.personalizationPoints || [selectedLead.companyName, selectedLead.industry, selectedLead.location]);
      setIsEditing(false);

      toast(`Successfully generated AI ${selectedChannel} draft! (Status: Pending Approval)`, 'success');
    } catch (err: any) {
      console.error(err);
      toast(err.message || 'Failed to generate AI draft. Try again.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleBodyChange = (newBody: string) => {
    setEditableBody(newBody);
    if (currentMessageId) {
      updateMessageBody(currentMessageId, newBody);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableBody);
    toast('Draft copied to clipboard!', 'success');
  };

  const handleRequestApproval = () => {
    toast('Draft submitted for pending approval queue', 'info');
  };

  const handleApprove = () => {
    if (currentMessageId && currentApprovalId) {
      approveMessage(currentMessageId, currentApprovalId);
      toast('Message approved successfully! (Queued for sending)', 'success');
    }
  };

  const handleReject = () => {
    if (currentMessageId && currentApprovalId) {
      rejectMessage(currentMessageId, currentApprovalId);
      toast('Message draft rejected', 'success');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">AI Personalized Outreach Generator</h1>
          <p className="text-sm text-brand-muted mt-1">Generate concise, human-sounding outreach drafts with multi-channel and language intelligence. <strong>GENERATE ≠ SEND</strong> (All drafts enter Pending Approval).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input parameters */}
        <Card className="lg:col-span-4 bg-white border border-gray-100 shadow-sm">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-base flex items-center gap-2">
              <BrainCircuit size={18} className="text-brand-primary" />
              Generator Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">Select Lead</label>
              <select
                value={selectedLeadId}
                onChange={e => setSelectedLeadId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              >
                {leads.map(l => (
                  <option key={l.id} value={l.id}>{l.companyName} ({l.contactName || 'Lead'})</option>
                ))}
              </select>
            </div>

            {selectedLead && (
              <div className="p-3 bg-gray-50 rounded-lg text-xs space-y-1 border border-gray-100">
                <p className="font-bold text-brand-text">{selectedLead.companyName}</p>
                <p className="text-brand-muted">{selectedLead.industry} • {selectedLead.location}</p>
                <p className="text-brand-muted font-medium">AI Score: <span className="text-indigo-600 font-bold">{selectedLead.leadScore}/100</span></p>
                {selectedLead.researchSummary && (
                  <p className="text-gray-600 italic line-clamp-2 mt-1">"{selectedLead.researchSummary}"</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">Channel</label>
              <select
                value={selectedChannel}
                onChange={e => setSelectedChannel(e.target.value as Channel)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="Gmail">Gmail</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-brand-text mb-1">Tone</label>
                <select
                  value={selectedTone}
                  onChange={e => setSelectedTone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                >
                  <option value="Professional">Professional</option>
                  <option value="Friendly">Friendly</option>
                  <option value="Consultative">Consultative</option>
                  <option value="Short">Short</option>
                  <option value="Direct">Direct</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text mb-1">Language</label>
                <select
                  value={selectedLanguage}
                  onChange={e => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                >
                  <option value="English">English</option>
                  <option value="Nepali">Nepali</option>
                  <option value="Mixed">Mixed (Eng + Nepali)</option>
                </select>
              </div>
            </div>

            <Button 
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" 
              onClick={handleGenerateAI}
              disabled={generating}
            >
              {generating ? <RefreshCw className="animate-spin mr-2" size={16} /> : <Sparkles className="mr-2" size={16} />}
              {generating ? 'Generating Draft...' : 'Generate Personalized Draft'}
            </Button>
          </CardContent>
        </Card>

        {/* Right: Output & Review */}
        <Card className="lg:col-span-8 bg-white border border-gray-100 shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare size={18} className="text-brand-primary" />
              Generated Draft & AI Intelligence Review
            </CardTitle>
            {currentMessage && (
              <Badge className={`uppercase text-xs font-bold ${
                currentMessage.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                currentMessage.status === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-800'
              }`}>
                {currentMessage.status.replace('_', ' ')}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-6 pt-4 flex-1">
            {!currentMessage ? (
              <div className="h-96 flex flex-col items-center justify-center text-brand-muted border-2 border-dashed border-gray-200 rounded-xl space-y-3 p-8 text-center">
                <Sparkles size={40} className="text-indigo-300 animate-pulse" />
                <p className="text-base font-semibold text-brand-text">No outreach draft generated yet.</p>
                <p className="text-xs text-brand-muted max-w-md">
                  Configure your target lead, channel, tone, and language on the left, then click <strong>"Generate Personalized Draft"</strong> to create a verified B2B outreach message.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* AI Reasoning & Personalization Points */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-indigo-50/70 rounded-lg border border-indigo-100 space-y-1">
                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-1.5">
                      <BrainCircuit size={14} className="text-indigo-600" /> AI Strategy & Reasoning
                    </h4>
                    <p className="text-xs text-indigo-950 leading-relaxed">
                      {aiReasoning}
                    </p>
                  </div>

                  <div className="p-3.5 bg-teal-50/70 rounded-lg border border-teal-100 space-y-1.5">
                    <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles size={14} className="text-teal-600" /> Personalization Points Used
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {personalizationPoints.map((pt, idx) => (
                        <span key={idx} className="text-[11px] bg-white text-teal-800 px-2 py-0.5 rounded border border-teal-200 font-medium">
                          ✓ {pt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Message Body Editor / View */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-muted uppercase tracking-wide">Message Draft ({selectedChannel})</span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1 text-xs">
                        <Copy size={13} /> Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} className="gap-1 text-xs">
                        <Edit3 size={13} /> {isEditing ? 'Lock Edit' : 'Edit'}
                      </Button>
                    </div>
                  </div>

                  {isEditing ? (
                    <textarea
                      rows={7}
                      value={editableBody}
                      onChange={e => handleBodyChange(e.target.value)}
                      className="w-full p-3.5 border border-indigo-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white font-mono leading-relaxed"
                    />
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm whitespace-pre-wrap text-brand-text font-mono leading-relaxed shadow-inner">
                      {editableBody}
                    </div>
                  )}
                  <p className="text-[11px] text-gray-400 italic">Editing instantly saves the draft in local store. Note: GENERATE ≠ SEND (Requires approval).</p>
                </div>

                {/* Safety Guard Notice */}
                <div className="p-3.5 bg-amber-50 text-amber-900 text-xs rounded-xl flex items-center gap-3 border border-amber-200">
                  <AlertTriangle size={18} className="text-amber-600 shrink-0" /> 
                  <div>
                    <span className="font-bold">Pending Approval Status Enforced:</span> This message is currently in <span className="underline font-semibold">Pending Approval</span>. It cannot be sent until reviewed and approved by a human operator.
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                  <Button variant="outline" onClick={handleGenerateAI} disabled={generating} className="gap-2">
                    <RefreshCw size={14} className={generating ? 'animate-spin' : ''} /> Regenerate
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      className="text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
                      onClick={handleReject}
                    >
                      <XCircle size={16} /> Reject
                    </Button>
                    <Button 
                      onClick={handleApprove}
                      disabled={currentMessage.status === 'approved'}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 size={16} /> Approve & Queue
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
