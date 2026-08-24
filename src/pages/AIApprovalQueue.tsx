import React, { useState } from 'react';
import { useCRM } from '../store/crmStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Toast, useToast } from '../components/ui/Toast';
import { CheckCircle2, XCircle, Eye, Edit3, MessageSquare, AlertTriangle } from 'lucide-react';

export function AIApprovalQueue() {
  const { leads, messages, approvals, updateMessageBody, approveMessage, rejectMessage } = useCRM();
  const { toasts, toast, removeToast } = useToast();

  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');

  const selectedApproval = approvals.find(a => a.id === selectedApprovalId);
  const selectedMessage = messages.find(m => m.id === selectedApproval?.messageId);
  const selectedLead = leads.find(l => l.id === selectedApproval?.leadId);

  const filteredApprovals = approvals.filter(app => {
    if (activeTab === 'pending') return app.status === 'pending';
    return true;
  });

  const handleOpenReview = (appId: string) => {
    setSelectedApprovalId(appId);
    const app = approvals.find(a => a.id === appId);
    if (app) {
      const msg = messages.find(m => m.id === app.messageId);
      setEditBody(msg?.body || '');
    }
    setReviewModalOpen(true);
  };

  const handleSaveBody = () => {
    if (selectedMessage) {
      updateMessageBody(selectedMessage.id, editBody);
      toast('Message draft updated', 'success');
    }
  };

  const handleApprove = (appId: string, msgId: string) => {
    approveMessage(msgId, appId);
    toast('Message approved successfully', 'success');
    setReviewModalOpen(false);
  };

  const handleReject = (appId: string, msgId: string) => {
    rejectMessage(msgId, appId);
    toast('Message draft rejected', 'success');
    setReviewModalOpen(false);
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
          <h1 className="text-2xl font-bold text-brand-text">Approval Queue</h1>
          <p className="text-sm text-brand-muted mt-1">Review, edit, approve, or reject AI-generated outreach messages before queuing.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={activeTab === 'pending' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('pending')}
            size="sm"
          >
            Pending ({approvals.filter(a => a.status === 'pending').length})
          </Button>
          <Button 
            variant={activeTab === 'all' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('all')}
            size="sm"
          >
            All Approvals ({approvals.length})
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Message Approvals</span>
            <span className="text-xs font-semibold text-brand-muted">{filteredApprovals.length} items</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead / Company</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Message Preview</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApprovals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-brand-muted">
                    <MessageSquare size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="font-medium text-sm">No approvals found in this view.</p>
                    <p className="text-xs text-gray-400 mt-0.5">Generate new messages in the AI Message Generator.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredApprovals.map(app => {
                  const lead = leads.find(l => l.id === app.leadId);
                  const msg = messages.find(m => m.id === app.messageId);
                  return (
                    <TableRow key={app.id}>
                      <TableCell className="font-semibold text-brand-text">
                        {lead ? lead.companyName : 'Unknown Lead'}
                        <span className="block text-xs font-normal text-brand-muted">{lead?.contactName}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="neutral" className="capitalize">{app.channel}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-xs text-brand-muted">
                        {msg?.body || 'No message body'}
                      </TableCell>
                      <TableCell>
                        <Badge className={`uppercase text-xs font-bold ${
                          app.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleOpenReview(app.id)}>
                          <Eye size={14} className="mr-1" /> Review
                        </Button>
                        {app.status === 'pending' && msg && (
                          <>
                            <Button size="sm" onClick={() => handleApprove(app.id, msg.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                              Approve
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review & Edit Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Review & Manage Outreach Draft"
        maxWidth="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setReviewModalOpen(false)}>Close</Button>
            {selectedApproval && selectedMessage && selectedApproval.status === 'pending' && (
              <>
                <Button variant="outline" className="text-red-600 border-red-200" onClick={() => handleReject(selectedApproval.id, selectedMessage.id)}>
                  Reject
                </Button>
                <Button onClick={() => handleApprove(selectedApproval.id, selectedMessage.id)} className="bg-emerald-600 text-white">
                  Approve Message
                </Button>
              </>
            )}
          </>
        }
      >
        {selectedApproval && selectedMessage && selectedLead && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-xl text-xs">
              <div>
                <span className="text-brand-muted font-medium">Lead:</span>
                <p className="font-bold text-brand-text">{selectedLead.companyName} ({selectedLead.contactName})</p>
              </div>
              <div>
                <span className="text-brand-muted font-medium">Channel:</span>
                <p className="font-bold text-brand-text capitalize">{selectedApproval.channel}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-brand-muted uppercase">Message Content (Editable)</label>
                <Button size="sm" variant="outline" onClick={handleSaveBody}>
                  Save Edits
                </Button>
              </div>
              <textarea
                rows={6}
                value={editBody}
                onChange={e => setEditBody(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
              <p className="text-[11px] text-gray-400">Editing the message text does not approve it automatically.</p>
            </div>

            <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-xl flex items-center gap-2 border border-amber-100">
              <AlertTriangle size={16} className="shrink-0" />
              <span>Safety Guard: Clicking Approve only sets status to approved. No external API messages are sent.</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
