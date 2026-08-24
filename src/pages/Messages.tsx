import React, { useState, useMemo } from 'react';
import { useCRM } from '../store/crmStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Toast, useToast } from '../components/ui/Toast';
import { 
  MessageCircle, Mail, Send, Sparkles, Wand2, Calendar, Paperclip, 
  CheckCircle2, XCircle, AlertTriangle, Clock, Phone, Globe, MapPin 
} from 'lucide-react';
import { Channel } from '../lib/channelUtils';

export function Messages() {
  const { 
    leads, messages, approvals, addMessage, updateMessageStatus, 
    createApproval, approveMessage, rejectMessage 
  } = useCRM();
  const { toasts, toast, removeToast } = useToast();

  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');
  const [composerText, setComposerText] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<Channel>('Gmail');

  const selectedLead = useMemo(() => leads.find(l => l.id === selectedLeadId) || leads[0], [leads, selectedLeadId]);

  const leadMessages = useMemo(() => {
    if (!selectedLead) return [];
    return messages.filter(m => m.leadId === selectedLead.id);
  }, [messages, selectedLead]);

  const handleAiGenerate = () => {
    if (!selectedLead) return;
    const channelKey = selectedChannel.toLowerCase() as 'whatsapp' | 'instagram' | 'facebook' | 'gmail';
    const draftBody = `Hi ${selectedLead.contactName || 'there'}, following up on ${selectedLead.companyName}'s outreach goals in ${selectedLead.industry}. We would love to share how our platform scales lead conversion. Are you available for a quick chat?`;
    
    const msgId = addMessage({
      leadId: selectedLead.id,
      channel: channelKey,
      body: draftBody,
      direction: 'outbound',
      status: 'pending_approval',
      approvalStatus: 'pending'
    });

    createApproval({
      messageId: msgId,
      leadId: selectedLead.id,
      channel: selectedChannel,
      status: 'pending'
    });

    toast('AI Draft generated and queued for approval', 'success');
  };

  const handleSendMessage = () => {
    if (!composerText.trim() || !selectedLead) return;
    const channelKey = selectedChannel.toLowerCase() as 'whatsapp' | 'instagram' | 'facebook' | 'gmail';

    addMessage({
      leadId: selectedLead.id,
      channel: channelKey,
      body: composerText,
      direction: 'outbound',
      status: 'approved',
      approvalStatus: 'approved'
    });

    setComposerText('');
    toast('Message sent successfully', 'success');
  };

  const handleRequestApproval = () => {
    if (!composerText.trim() || !selectedLead) return;
    const channelKey = selectedChannel.toLowerCase() as 'whatsapp' | 'instagram' | 'facebook' | 'gmail';

    const msgId = addMessage({
      leadId: selectedLead.id,
      channel: channelKey,
      body: composerText,
      direction: 'outbound',
      status: 'pending_approval',
      approvalStatus: 'pending'
    });

    createApproval({
      messageId: msgId,
      leadId: selectedLead.id,
      channel: selectedChannel,
      status: 'pending'
    });

    setComposerText('');
    toast('Outbound message submitted for approval', 'info');
  };

  const handleApproveMessage = (msgId: string) => {
    const approval = approvals.find(a => a.messageId === msgId);
    if (approval) {
      approveMessage(msgId, approval.id);
      toast('Message approved successfully', 'success');
    } else {
      // Direct approval update if approval object not found
      updateMessageStatus(msgId, 'approved', 'approved');
      toast('Message approved successfully', 'success');
    }
  };

  const handleRejectMessage = (msgId: string) => {
    const approval = approvals.find(a => a.messageId === msgId);
    if (approval) {
      rejectMessage(msgId, approval.id);
      toast('Message draft rejected', 'warning');
    } else {
      updateMessageStatus(msgId, 'rejected', 'rejected');
      toast('Message draft rejected', 'warning');
    }
  };

  const handleAttemptSendUnapproved = (msg: typeof messages[0]) => {
    if (msg.status === 'pending_approval' && msg.approvalStatus !== 'approved') {
      toast('Human approval required.', 'error');
      return;
    }
    handleApproveMessage(msg.id);
  };

  return (
    <div className="h-[calc(100vh-8rem)] grid grid-cols-1 lg:grid-cols-12 gap-6 pb-4">
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      {/* Left: Conversations Inbox */}
      <Card className="lg:col-span-3 overflow-hidden flex flex-col h-full bg-white border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <h2 className="font-bold text-brand-text text-sm uppercase tracking-wide">Conversations</h2>
          <p className="text-xs text-brand-muted mt-0.5">{leads.length} active leads</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 custom-scrollbar">
          {leads.map(lead => {
            const lMsgs = messages.filter(m => m.leadId === lead.id);
            const lastMsg = lMsgs[lMsgs.length - 1];
            const isSelected = selectedLead?.id === lead.id;

            return (
              <div 
                key={lead.id} 
                onClick={() => setSelectedLeadId(lead.id)}
                className={`p-3.5 cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50/70 border-l-4 border-brand-primary' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-brand-text text-sm truncate">{lead.companyName}</span>
                  <span className="text-[10px] text-gray-400 font-medium">Score: {lead.leadScore}</span>
                </div>
                <p className="text-xs text-brand-muted font-medium mb-1">{lead.contactName}</p>
                <p className="text-xs text-gray-500 truncate">
                  {lastMsg ? lastMsg.body : 'No messages yet...'}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Center: Message Timeline & Composer */}
      <Card className="lg:col-span-6 flex flex-col h-full bg-white border border-gray-100 shadow-sm overflow-hidden">
        {selectedLead ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <Avatar fallback={selectedLead.companyName.charAt(0)} size="md" className="bg-brand-primary/10 text-brand-primary font-bold" />
                <div>
                  <h3 className="font-bold text-brand-text text-sm">{selectedLead.companyName}</h3>
                  <p className="text-xs text-brand-muted">{selectedLead.contactName} • {selectedLead.industry}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedChannel}
                  onChange={e => setSelectedChannel(e.target.value as Channel)}
                  className="text-xs font-medium px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
                >
                  <option value="Gmail">Gmail</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                </select>
              </div>
            </div>

            {/* Messages Timeline */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30 custom-scrollbar">
              {leadMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-brand-muted py-12 space-y-2">
                  <MessageCircle size={36} className="text-gray-300" />
                  <p className="text-sm font-medium">No messages in this conversation yet.</p>
                  <p className="text-xs text-gray-400">Use AI Generate or type a message below to start.</p>
                </div>
              ) : (
                leadMessages.map(msg => {
                  const isInbound = msg.direction === 'inbound';
                  const isAiDraft = msg.status === 'pending_approval';
                  const isApproved = msg.status === 'approved' || msg.approvalStatus === 'approved';
                  const isRejected = msg.status === 'rejected' || msg.approvalStatus === 'rejected';

                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col max-w-[85%] ${isInbound ? 'mr-auto' : 'ml-auto'}`}
                    >
                      <div className={`p-4 rounded-xl shadow-sm text-sm space-y-2 ${
                        isInbound ? 'bg-white border border-gray-200 text-brand-text' :
                        isAiDraft ? 'bg-amber-50 border border-amber-200 text-brand-text' :
                        isApproved ? 'bg-indigo-50 border border-indigo-200 text-brand-text' :
                        isRejected ? 'bg-red-50 border border-red-200 text-brand-text line-through opacity-75' :
                        'bg-brand-primary text-white'
                      }`}>
                        <div className="flex items-center justify-between gap-4 text-xs pb-1 border-b border-gray-200/40">
                          <span className="font-semibold uppercase tracking-wider text-[10px]">
                            {isInbound ? 'Inbound' : isAiDraft ? 'AI Draft (Pending Approval)' : isApproved ? 'Approved Outbound' : isRejected ? 'Rejected' : 'Outbound'}
                          </span>
                          <span className="text-[10px] opacity-75 capitalize">{msg.channel}</span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.body}</p>

                        {/* Status Badges & Action Buttons */}
                        {isAiDraft && (
                          <div className="pt-2 border-t border-amber-200 flex items-center justify-between gap-2 flex-wrap">
                            <Badge className="bg-amber-100 text-amber-800 font-bold text-[10px]">
                              Human approval required.
                            </Badge>
                            <div className="flex items-center gap-1.5">
                              <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200" onClick={() => handleRejectMessage(msg.id)}>
                                <XCircle size={14} className="mr-1" /> Reject
                              </Button>
                              <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleAttemptSendUnapproved(msg)}>
                                <CheckCircle2 size={14} className="mr-1" /> Approve & Send
                              </Button>
                            </div>
                          </div>
                        )}

                        {isApproved && (
                          <div className="pt-1 flex items-center justify-end text-[10px] font-semibold text-emerald-700 gap-1">
                            <CheckCircle2 size={12} /> Approved
                          </div>
                        )}
                      </div>
                      <span className={`text-[10px] text-gray-400 mt-1 ${isInbound ? 'text-left' : 'text-right'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Composer */}
            <div className="p-4 border-t border-gray-200 bg-white space-y-3 shrink-0">
              <textarea
                rows={3}
                value={composerText}
                onChange={e => setComposerText(e.target.value)}
                placeholder={`Write message to ${selectedLead.companyName}...`}
                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-gray-50/50"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="sm" onClick={handleAiGenerate} className="gap-1.5 text-xs">
                    <Sparkles size={14} className="text-brand-primary" /> AI Generate
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRequestApproval} className="gap-1.5 text-xs">
                    <Wand2 size={14} /> Request Approval
                  </Button>
                </div>
                <Button size="sm" onClick={handleSendMessage} className="gap-1.5 text-xs bg-brand-primary">
                  <Send size={14} /> Send Direct
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-brand-muted">
            Select a conversation from the left.
          </div>
        )}
      </Card>

      {/* Right: Lead Info & AI Insights */}
      <Card className="lg:col-span-3 bg-white border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <h2 className="font-bold text-brand-text text-sm uppercase tracking-wide">Lead Overview</h2>
        </div>
        {selectedLead ? (
          <div className="p-4 space-y-4 text-sm overflow-y-auto flex-1">
            <div className="space-y-1">
              <p className="text-xs text-brand-muted font-medium">Company</p>
              <p className="font-bold text-brand-text text-base">{selectedLead.companyName}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-[10px] text-brand-muted uppercase font-semibold mb-0.5">Lead Score</p>
                <p className="font-bold text-red-600 text-lg">{selectedLead.leadScore}/100</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-[10px] text-brand-muted uppercase font-semibold mb-0.5">Status</p>
                <p className="font-bold text-brand-text capitalize text-xs mt-1">{selectedLead.status}</p>
              </div>
            </div>
            <div className="space-y-1 pt-2 border-t border-gray-100">
              <p className="text-xs text-brand-muted font-medium">Contact Person</p>
              <p className="font-semibold text-brand-text">{selectedLead.contactName}</p>
              <p className="text-xs text-gray-500">{selectedLead.jobTitle}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-brand-muted font-medium">Industry & Location</p>
              <p className="text-xs font-semibold text-brand-text flex items-center gap-1.5"><MapPin size={12} /> {selectedLead.location}</p>
            </div>
            <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 space-y-1">
              <p className="text-xs font-semibold text-indigo-900 flex items-center gap-1">
                <Sparkles size={14} className="text-indigo-500" /> AI Insights
              </p>
              <p className="text-xs text-indigo-800 leading-relaxed">
                High-intent prospect in {selectedLead.industry}. Recommended outreach via {selectedChannel} with personalized value propositions.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-brand-muted text-xs">No lead selected</div>
        )}
      </Card>
    </div>
  );
}
