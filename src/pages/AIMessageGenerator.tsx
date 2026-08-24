import React, { useState } from 'react';
import { useCRM } from '../store/crmStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Toast, useToast } from '../components/ui/Toast';
import { BrainCircuit, Send, AlertTriangle, Sparkles, RefreshCw, CheckCircle2, XCircle, Edit3 } from 'lucide-react';
import { Channel } from '../lib/channelUtils';

export function AIMessageGenerator() {
  const { leads, messages, approvals, addMessage, updateMessageBody, createApproval, approveMessage, rejectMessage } = useCRM();
  const { toasts, toast, removeToast } = useToast();

  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');
  const [selectedChannel, setSelectedChannel] = useState<Channel>('Gmail');
  const [selectedTone, setSelectedTone] = useState<string>('Professional');
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
  const [currentApprovalId, setCurrentApprovalId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableBody, setEditableBody] = useState('');

  const selectedLead = leads.find(l => l.id === selectedLeadId) || leads[0];
  const currentMessage = messages.find(m => m.id === currentMessageId);
  const currentApproval = approvals.find(a => a.id === currentApprovalId);

  const generateDraft = () => {
    if (!selectedLead) {
      toast('Please select a lead first', 'error');
      return;
    }

    const channelKey = selectedChannel.toLowerCase() as 'whatsapp' | 'instagram' | 'facebook' | 'gmail';
    
    let generatedText = '';
    if (selectedChannel === 'WhatsApp') {
      const contact = selectedLead.contactName || 'there';
      const company = selectedLead.companyName;
      if (selectedTone === 'Friendly') {
        generatedText = `Hi ${contact}! 👋 Saw great things happening at ${company}. We've been helping similar ${selectedLead.industry} teams streamline outreach. Open for a quick chat?`;
      } else {
        generatedText = `Hello ${contact}, reaching out from CRM team regarding scaling ${company}'s outbound pipelines in ${selectedLead.location}. Let's connect?`;
      }
    } else if (selectedChannel === 'Gmail') {
      const contact = selectedLead.contactName || 'Valued Partner';
      const company = selectedLead.companyName;
      generatedText = `Subject: Elevating ${company}'s Outbound Growth\n\nHi ${contact},\n\nI hope this email finds you well. Analyzing ${company}'s presence in the ${selectedLead.industry} sector, we noticed significant opportunity to automate lead routing and increase response rates.\n\nWould you be open to a 10-minute briefing this week?\n\nBest regards,\nGrowth Team`;
    } else {
      generatedText = `Hi ${selectedLead.contactName}, impressive work at ${selectedLead.companyName}! I'd love to connect and share how we accelerate ${selectedLead.industry} lead conversions.`;
    }

    // Create message with status: 'pending_approval', approvalStatus: 'pending'
    const msgId = addMessage({
      leadId: selectedLead.id,
      channel: channelKey,
      body: generatedText,
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
    setEditableBody(generatedText);
    setIsEditing(false);
    toast('New AI draft generated and queued for approval', 'success');
  };

  const handleBodyChange = (newBody: string) => {
    setEditableBody(newBody);
    if (currentMessageId) {
      updateMessageBody(currentMessageId, newBody);
    }
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
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">AI Message Generator & Approval Workflow</h1>
          <p className="text-sm text-brand-muted mt-1">Generate personalized outreach drafts, review, edit, and approve before queueing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input parameters */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BrainCircuit size={18} className="text-brand-primary" />
              Generator Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Select Lead</label>
              <select
                value={selectedLeadId}
                onChange={e => setSelectedLeadId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              >
                {leads.map(l => (
                  <option key={l.id} value={l.id}>{l.companyName} ({l.contactName})</option>
                ))}
              </select>
            </div>

            {selectedLead && (
              <div className="p-3 bg-gray-50 rounded-lg text-xs space-y-1">
                <p className="font-semibold text-brand-text">{selectedLead.companyName}</p>
                <p className="text-brand-muted">{selectedLead.industry} • {selectedLead.location}</p>
                <p className="text-brand-muted">Score: {selectedLead.leadScore}/100</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Channel</label>
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

            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Tone</label>
              <select
                value={selectedTone}
                onChange={e => setSelectedTone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              >
                <option value="Professional">Professional</option>
                <option value="Friendly">Friendly</option>
                <option value="Concise">Concise</option>
                <option value="Persuasive">Persuasive</option>
              </select>
            </div>

            <Button className="w-full mt-2" onClick={generateDraft}>
              <Sparkles className="mr-2" size={16} /> Generate AI Draft
            </Button>
          </CardContent>
        </Card>

        {/* Right: Output & Review */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Generated Draft & Review</span>
              {currentMessage && (
                <Badge className={`uppercase text-xs font-bold ${
                  currentMessage.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                  currentMessage.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {currentMessage.status.replace('_', ' ')}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!currentMessage ? (
              <div className="h-72 flex flex-col items-center justify-center text-brand-muted border-2 border-dashed border-gray-200 rounded-xl space-y-2">
                <Sparkles size={32} className="text-gray-300" />
                <p className="text-sm font-medium">No active draft generated yet.</p>
                <p className="text-xs text-gray-400">Select a lead and channel, then click "Generate AI Draft".</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-brand-muted uppercase">Message Body (Editable)</span>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                      <Edit3 size={14} className="mr-1" /> {isEditing ? 'Lock Edit' : 'Edit Text'}
                    </Button>
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={6}
                      value={editableBody}
                      onChange={e => handleBodyChange(e.target.value)}
                      className="w-full p-3 border border-brand-primary/40 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white"
                    />
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm whitespace-pre-wrap text-brand-text leading-relaxed">
                      {currentMessage.body}
                    </div>
                  )}
                  <p className="text-[11px] text-gray-400 italic">Editing updates the draft in real time without automatically approving it.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs">
                  <div>
                    <span className="font-semibold text-indigo-900 block mb-0.5">AI Confidence Score</span>
                    <span className="text-indigo-700 font-bold">96% High Relevance</span>
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-900 block mb-0.5">Approval Status</span>
                    <span className="text-indigo-700 font-bold uppercase">{currentMessage.approvalStatus}</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-xl flex items-center gap-2 border border-amber-100">
                  <AlertTriangle size={16} className="shrink-0" /> 
                  <span>Safety Guard: This message will NOT be sent automatically. The Approve button only approves the review state.</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                  <Button variant="outline" onClick={generateDraft} className="gap-2">
                    <RefreshCw size={14} /> Regenerate Draft
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={handleReject}
                    >
                      <XCircle size={16} className="mr-1.5" /> Reject
                    </Button>
                    <Button 
                      onClick={handleApprove}
                      disabled={currentMessage.status === 'approved'}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 size={16} className="mr-1.5" /> Approve
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
