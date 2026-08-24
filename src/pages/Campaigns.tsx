import React, { useState } from 'react';
import { useCRM } from '../store/crmStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Toast, useToast } from '../components/ui/Toast';
import { CreateCampaignModal } from '../components/campaigns/CreateCampaignModal';
import { 
  Plus, Edit3, Copy, Play, Pause, Trash2, Eye, Megaphone, Users, MessageSquare, CheckCircle2 
} from 'lucide-react';
import { Campaign, Lead } from '../store/crmTypes';

export function Campaigns() {
  const { campaigns, leads, messages, deleteCampaign, duplicateCampaign, pauseCampaign, resumeCampaign } = useCRM();
  const { toasts, toast, removeToast } = useToast();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [detailCampaign, setDetailCampaign] = useState<Campaign | null>(null);

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setCreateModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteCampaign(id);
    toast('Campaign deleted successfully', 'warning');
  };

  const handleDuplicate = (id: string) => {
    duplicateCampaign(id);
    toast('Campaign duplicated successfully', 'success');
  };

  const handlePause = (id: string) => {
    pauseCampaign(id);
    toast('Campaign paused', 'info');
  };

  const handleResume = (id: string) => {
    resumeCampaign(id);
    toast('Campaign resumed', 'success');
  };

  const handleOpenDetail = (campaign: Campaign) => {
    setDetailCampaign(campaign);
  };

  const handleOpenCreate = () => {
    setEditingCampaign(null);
    setCreateModalOpen(true);
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
          <h1 className="text-2xl font-bold text-brand-text">Campaigns</h1>
          <p className="text-sm text-brand-muted mt-1">Manage outbound campaigns, target audiences, and review pending approval sequences.</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus size={16} /> Create Campaign
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>All Campaigns</span>
            <span className="text-xs font-semibold text-brand-muted">{campaigns.length} campaigns</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-brand-muted">
                    <Megaphone size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="font-medium text-sm">No campaigns created yet.</p>
                    <p className="text-xs text-gray-400 mt-0.5">Click "Create Campaign" to start outbound sequences.</p>
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map(c => {
                  const leadCount = c.leadIds?.length || 0;
                  const isActive = c.status === 'Active';

                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-semibold text-brand-text">
                        {c.name}
                        <span className="block text-xs font-normal text-brand-muted truncate max-w-xs">{c.description || 'No description'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="neutral" className="capitalize">{c.channel}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-brand-muted">{c.audience || 'General'}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold">
                          <Users size={14} className="text-brand-primary" /> {leadCount} leads
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`uppercase text-xs font-bold ${
                          isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button size="sm" variant="outline" onClick={() => handleOpenDetail(c)} title="View Campaign">
                            <Eye size={14} />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(c)} title="Edit Campaign">
                            <Edit3 size={14} />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDuplicate(c.id)} title="Duplicate">
                            <Copy size={14} />
                          </Button>
                          {isActive ? (
                            <Button size="sm" variant="outline" onClick={() => handlePause(c.id)} title="Pause" className="text-amber-600">
                              <Pause size={14} />
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => handleResume(c.id)} title="Resume" className="text-emerald-600">
                              <Play size={14} />
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleDelete(c.id)} title="Delete" className="text-red-600 hover:bg-red-50">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create / Edit Modal */}
      <CreateCampaignModal 
        isOpen={createModalOpen} 
        onClose={() => setCreateModalOpen(false)} 
        editCampaign={editingCampaign}
      />

      {/* Detail Modal */}
      <Modal 
        isOpen={!!detailCampaign} 
        onClose={() => setDetailCampaign(null)} 
        title={`Campaign: ${detailCampaign?.name || ''}`}
        maxWidth="lg"
      >
        {detailCampaign && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-xl text-xs">
              <div>
                <span className="text-brand-muted font-medium">Channel & Audience:</span>
                <p className="font-bold text-brand-text">{detailCampaign.channel} • {detailCampaign.audience || 'General'}</p>
              </div>
              <div>
                <span className="text-brand-muted font-medium">Status:</span>
                <p className="font-bold uppercase text-brand-text">{detailCampaign.status}</p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-brand-muted uppercase">Description</span>
              <p className="text-sm text-brand-text bg-white p-3 border border-gray-200 rounded-xl">
                {detailCampaign.description || 'No description provided.'}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-brand-muted uppercase flex items-center gap-1">
                <Users size={14} /> Selected Leads ({detailCampaign.leadIds?.length || 0})
              </span>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100 bg-gray-50/50">
                {detailCampaign.leadIds && detailCampaign.leadIds.length > 0 ? (
                  detailCampaign.leadIds.map(leadId => {
                    const lead = leads.find(l => l.id === leadId);
                    if (!lead) return null;
                    return (
                      <div key={lead.id} className="p-2.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-brand-text">{lead.companyName} ({lead.contactName})</span>
                        <Badge variant="neutral" className="text-[10px]">{lead.industry}</Badge>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400">No leads linked to this campaign.</div>
                )}
              </div>
            </div>

            <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-xl flex items-center gap-2 border border-amber-100">
              <CheckCircle2 size={16} className="shrink-0 text-amber-600" />
              <span>Rule Enforced: All campaign outbound messages enter "pending_approval" status and require human review before sending.</span>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setDetailCampaign(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
