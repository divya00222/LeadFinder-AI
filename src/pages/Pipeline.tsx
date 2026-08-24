import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCRM } from '../store/crmStore';
import { Lead } from '../store/crmTypes';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Toast, useToast } from '../components/ui/Toast';
import { 
  Plus, MoreHorizontal, MessageCircle, Mail, Facebook, Instagram, 
  Search, Filter, MapPin, Clock, Edit, Trash2, ExternalLink
} from 'lucide-react';

const COLUMNS: { id: Lead['status']; label: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'replied', label: 'Replied' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'meeting', label: 'Meeting' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'won', label: 'Won' },
  { id: 'lost', label: 'Lost' },
];

export function Pipeline() {
  const { leads, updateLeadStatus, updateLead, deleteLead, addLead } = useCRM();
  const { toasts, toast, removeToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    companyName: '',
    contactName: '',
    jobTitle: '',
    industry: '',
    location: '',
    email: '',
    phone: '',
    leadScore: 75,
    status: 'new' as Lead['status']
  });

  // Add form state
  const [addFormData, setAddFormData] = useState({
    companyName: '',
    contactName: '',
    jobTitle: '',
    industry: 'Technology',
    location: 'San Francisco, CA',
    email: '',
    phone: '',
    leadScore: 80,
    status: 'new' as Lead['status']
  });

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [leads, searchQuery]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragEnd = () => {
    setDraggedLeadId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Lead['status']) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (leadId) {
      const lead = leads.find(l => l.id === leadId);
      if (lead && lead.status !== targetStatus) {
        updateLeadStatus(leadId, targetStatus);
        toast(`Moved ${lead.companyName} to ${targetStatus.toUpperCase()}`, 'success');
      }
    }
    setDraggedLeadId(null);
  };

  const handleStatusChangeClick = (leadId: string, newStatus: Lead['status']) => {
    updateLeadStatus(leadId, newStatus);
    toast(`Lead status updated to ${newStatus.toUpperCase()}`, 'success');
  };

  const handleOpenEdit = (lead: Lead) => {
    setLeadToEdit(lead);
    setEditFormData({
      companyName: lead.companyName,
      contactName: lead.contactName,
      jobTitle: lead.jobTitle,
      industry: lead.industry,
      location: lead.location,
      email: lead.email,
      phone: lead.phone,
      leadScore: lead.leadScore,
      status: lead.status
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadToEdit) return;
    updateLead(leadToEdit.id, editFormData);
    setIsEditModalOpen(false);
    toast('Lead updated successfully', 'success');
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormData.companyName.trim()) {
      toast('Company name is required', 'error');
      return;
    }
    addLead({
      ...addFormData,
      website: '',
      whatsapp: null,
      facebook: null,
      instagram: null,
      source: 'Pipeline',
      companySize: '11-50',
      tags: [],
      owner: 'Admin'
    });
    setIsAddModalOpen(false);
    setAddFormData({
      companyName: '',
      contactName: '',
      jobTitle: '',
      industry: 'Technology',
      location: 'San Francisco, CA',
      email: '',
      phone: '',
      leadScore: 80,
      status: 'new'
    });
    toast('Deal added successfully', 'success');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-100';
    if (score >= 40) return 'text-amber-600 bg-amber-100';
    return 'text-blue-600 bg-blue-100';
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Sales Pipeline</h1>
          <p className="text-sm text-brand-muted mt-1">Drag and drop deals across stages or manage status in real time.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              placeholder="Search deals in pipeline..."
            />
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} className="mr-2" /> Add Deal
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-4 h-full min-w-max items-start">
          {COLUMNS.map((column) => {
            const columnLeads = filteredLeads.filter(l => l.status === column.id);
            // Estimate deal amount based on score if not set, or default
            const totalAmount = columnLeads.reduce((sum, l) => sum + (l.leadScore * 250), 0);

            return (
              <div 
                key={column.id} 
                className="w-[300px] flex flex-col max-h-full bg-gray-50/70 rounded-xl border border-gray-200 shadow-sm"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-gray-200 bg-white rounded-t-xl">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-brand-text flex items-center gap-2 text-sm uppercase tracking-wide">
                      {column.label}
                      <span className="bg-brand-primary/10 text-brand-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                        {columnLeads.length}
                      </span>
                    </h3>
                  </div>
                  <div className="text-xs font-semibold text-brand-muted">
                    {formatCurrency(totalAmount)} est. value
                  </div>
                </div>
                
                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                  {columnLeads.length === 0 ? (
                    <div className="py-8 text-center text-xs text-brand-muted border border-dashed border-gray-200 rounded-lg">
                      No leads in {column.label}
                    </div>
                  ) : (
                    columnLeads.map((lead) => {
                      const estAmount = lead.leadScore * 250;
                      return (
                        <Card 
                          key={lead.id} 
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          onDragEnd={handleDragEnd}
                          className="cursor-grab active:cursor-grabbing border-gray-200 shadow-sm hover:border-brand-primary/50 hover:shadow-md transition-all bg-white"
                        >
                          <CardContent className="p-3.5 space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h4 className="font-bold text-brand-text text-sm leading-tight hover:text-brand-primary transition-colors">
                                  <Link to={`/leads/${lead.id}`} className="flex items-center gap-1">
                                    {lead.companyName} <ExternalLink size={12} className="text-gray-400" />
                                  </Link>
                                </h4>
                                <p className="text-xs font-medium text-gray-500 mt-0.5">{lead.contactName || lead.jobTitle || 'Prospect'}</p>
                              </div>
                              <Badge className="bg-green-50 text-green-700 border-green-100 shrink-0 text-xs font-semibold">
                                {formatCurrency(estAmount)}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-brand-muted">
                              <span className="flex items-center gap-1 truncate max-w-[160px]">
                                <MapPin size={12} className="shrink-0" /> {lead.location}
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getScoreColor(lead.leadScore)}`}>
                                Score: {lead.leadScore}
                              </span>
                            </div>

                            {/* Quick Action Bar */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                              <select
                                value={lead.status}
                                onChange={(e) => handleStatusChangeClick(lead.id, e.target.value as Lead['status'])}
                                className="text-[11px] font-medium bg-gray-50 border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                              >
                                {COLUMNS.map(col => (
                                  <option key={col.id} value={col.id}>{col.label}</option>
                                ))}
                              </select>

                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => handleOpenEdit(lead)} 
                                  className="p-1 text-gray-400 hover:text-brand-primary rounded hover:bg-gray-100 transition-colors"
                                  title="Edit Lead"
                                >
                                  <Edit size={14} />
                                </button>
                                <button 
                                  onClick={() => { deleteLead(lead.id); toast('Lead deleted', 'success'); }} 
                                  className="p-1 text-gray-400 hover:text-brand-danger rounded hover:bg-gray-100 transition-colors"
                                  title="Delete Lead"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}

                  <button 
                    onClick={() => { setAddFormData(prev => ({ ...prev, status: column.id })); setIsAddModalOpen(true); }}
                    className="w-full py-2 flex items-center justify-center gap-2 text-xs font-semibold text-brand-muted hover:text-brand-primary hover:bg-white rounded-lg border border-dashed border-gray-300 transition-colors bg-gray-50/50"
                  >
                    <Plus size={14} /> Add deal to {column.label}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Edit Lead in Pipeline"
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">Company Name *</label>
            <input 
              type="text"
              required
              value={editFormData.companyName}
              onChange={e => setEditFormData({...editFormData, companyName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">Contact Name</label>
            <input 
              type="text"
              value={editFormData.contactName}
              onChange={e => setEditFormData({...editFormData, contactName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Lead Score (0-100)</label>
              <input 
                type="number"
                min="0"
                max="100"
                value={editFormData.leadScore}
                onChange={e => setEditFormData({...editFormData, leadScore: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Status</label>
              <select
                value={editFormData.status}
                onChange={e => setEditFormData({...editFormData, status: e.target.value as Lead['status']})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              >
                {COLUMNS.map(col => (
                  <option key={col.id} value={col.id}>{col.label}</option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Add Deal Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Add New Deal"
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAdd}>Create Deal</Button>
          </>
        }
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">Company Name *</label>
            <input 
              type="text"
              required
              value={addFormData.companyName}
              onChange={e => setAddFormData({...addFormData, companyName: e.target.value})}
              placeholder="Acme Corp"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">Contact Name</label>
            <input 
              type="text"
              value={addFormData.contactName}
              onChange={e => setAddFormData({...addFormData, contactName: e.target.value})}
              placeholder="Jane Smith"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Lead Score</label>
              <input 
                type="number"
                min="0"
                max="100"
                value={addFormData.leadScore}
                onChange={e => setAddFormData({...addFormData, leadScore: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Stage</label>
              <select
                value={addFormData.status}
                onChange={e => setAddFormData({...addFormData, status: e.target.value as Lead['status']})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              >
                {COLUMNS.map(col => (
                  <option key={col.id} value={col.id}>{col.label}</option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </Modal>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #E5E7EB;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}
