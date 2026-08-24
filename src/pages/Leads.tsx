import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCRM } from '../store/crmStore';
import { Lead } from '../store/crmTypes';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Toast, useToast } from '../components/ui/Toast';
import { 
  Search, Filter, Download, Plus, MoreHorizontal, MessageSquare, Mail, 
  Building2, Trash2, Edit, Upload, CheckCircle2, FileSpreadsheet, X
} from 'lucide-react';

export function Leads() {
  const { leads, addLead, updateLead, deleteLead, importLeads } = useCRM();
  const { toasts, toast, removeToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'date'>('date');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);

  // Form state for Add/Edit
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    jobTitle: '',
    industry: 'Technology',
    location: '',
    website: '',
    email: '',
    phone: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
    source: 'Manual',
    companySize: '11-50',
    leadScore: 75,
    status: 'new' as Lead['status'],
    owner: 'Admin'
  });

  // CSV Import state
  const [csvText, setCsvText] = useState('');
  const [importStats, setImportStats] = useState<{ imported: number; skipped: number; errors: number } | null>(null);

  // Filtered and sorted leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesIndustry = industryFilter === 'all' || lead.industry === industryFilter;

      return matchesSearch && matchesStatus && matchesIndustry;
    }).sort((a, b) => {
      if (sortBy === 'score') return b.leadScore - a.leadScore;
      if (sortBy === 'name') return a.companyName.localeCompare(b.companyName);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [leads, searchQuery, statusFilter, industryFilter, sortBy]);

  const industries = useMemo(() => {
    const set = new Set(leads.map(l => l.industry));
    return Array.from(set);
  }, [leads]);

  const handleOpenAdd = () => {
    setFormData({
      companyName: '',
      contactName: '',
      jobTitle: '',
      industry: 'Technology',
      location: '',
      website: '',
      email: '',
      phone: '',
      whatsapp: '',
      facebook: '',
      instagram: '',
      source: 'Manual',
      companySize: '11-50',
      leadScore: 75,
      status: 'new',
      owner: 'Admin'
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      toast('Company name is required', 'error');
      return;
    }
    addLead({
      ...formData,
      tags: [],
      whatsapp: formData.whatsapp || null,
      facebook: formData.facebook || null,
      instagram: formData.instagram || null,
    });
    setIsAddModalOpen(false);
    toast('Lead created successfully', 'success');
  };

  const handleOpenEdit = (lead: Lead) => {
    setLeadToEdit(lead);
    setFormData({
      companyName: lead.companyName,
      contactName: lead.contactName,
      jobTitle: lead.jobTitle,
      industry: lead.industry,
      location: lead.location,
      website: lead.website,
      email: lead.email,
      phone: lead.phone,
      whatsapp: lead.whatsapp || '',
      facebook: lead.facebook || '',
      instagram: lead.instagram || '',
      source: lead.source,
      companySize: lead.companySize,
      leadScore: lead.leadScore,
      status: lead.status,
      owner: lead.owner
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadToEdit) return;
    updateLead(leadToEdit.id, {
      ...formData,
      whatsapp: formData.whatsapp || null,
      facebook: formData.facebook || null,
      instagram: formData.instagram || null,
    });
    setIsEditModalOpen(false);
    toast('Lead updated successfully', 'success');
  };

  const handleDeleteConfirm = () => {
    if (leadToDelete) {
      deleteLead(leadToDelete);
      toast('Lead deleted successfully', 'success');
      setLeadToDelete(null);
      setIsDeleteModalOpen(false);
    } else if (selectedLeadIds.length > 0) {
      selectedLeadIds.forEach(id => deleteLead(id));
      toast(`Deleted ${selectedLeadIds.length} leads successfully`, 'success');
      setSelectedLeadIds([]);
      setIsDeleteModalOpen(false);
    }
  };

  const handleBulkDelete = () => {
    if (selectedLeadIds.length === 0) return;
    setLeadToDelete(null);
    setIsDeleteModalOpen(true);
  };

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map(l => l.id));
    }
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeadIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleExportCSV = () => {
    const headers = ['companyName', 'contactName', 'jobTitle', 'industry', 'location', 'website', 'email', 'phone', 'leadScore', 'status'];
    const csvRows = [
      headers.join(','),
      ...filteredLeads.map(l => [
        `"${l.companyName}"`,
        `"${l.contactName}"`,
        `"${l.jobTitle}"`,
        `"${l.industry}"`,
        `"${l.location}"`,
        `"${l.website}"`,
        `"${l.email}"`,
        `"${l.phone}"`,
        l.leadScore,
        l.status
      ].join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast('Leads exported as CSV successfully', 'success');
  };

  const handleDownloadTemplate = () => {
    const template = 'companyName,contactName,jobTitle,industry,location,website,email,phone,source\n"Acme Inc","Jane Smith","CEO","Technology","San Francisco, CA","https://acme.com","jane@acme.com","+15550199","Website"';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead_import_template.csv';
    a.click();
    toast('CSV template downloaded', 'success');
  };

  const handleProcessImport = () => {
    if (!csvText.trim()) {
      toast('Please paste or upload CSV data', 'error');
      return;
    }
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        toast('Invalid CSV format. Header + at least one row required.', 'error');
        return;
      }
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      let imported = 0;
      let skipped = 0;
      let errors = 0;

      const newLeadsList: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(val => val.trim().replace(/^"|"$/g, ''));
        if (row.length < headers.length && row[0] === '') {
          skipped++;
          continue;
        }
        const leadObj: any = {
          companyName: row[0] || 'Unknown Company',
          contactName: row[1] || 'Unknown Contact',
          jobTitle: row[2] || 'Manager',
          industry: row[3] || 'General',
          location: row[4] || 'Remote',
          website: row[5] || '',
          email: row[6] || '',
          phone: row[7] || '',
          whatsapp: null,
          facebook: null,
          instagram: null,
          source: row[8] || 'CSV Import',
          companySize: '11-50',
          leadScore: 70,
          status: 'new',
          tags: ['imported'],
          owner: 'Admin'
        };
        newLeadsList.push(leadObj);
        imported++;
      }

      importLeads(newLeadsList);
      setImportStats({ imported, skipped, errors });
      toast(`Successfully imported ${imported} leads!`, 'success');
    } catch (err) {
      toast('Failed to parse CSV data', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'active': case 'contacted': return 'bg-blue-100 text-blue-700';
      case 'new': return 'bg-purple-100 text-purple-700';
      case 'replied': return 'bg-brand-warning/20 text-brand-warning';
      case 'qualified': return 'bg-teal-100 text-teal-700';
      case 'meeting': return 'bg-pink-100 text-pink-700';
      case 'proposal': return 'bg-orange-100 text-orange-700';
      case 'won': return 'bg-brand-success/20 text-brand-success';
      case 'lost': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Leads Directory</h1>
          <p className="text-sm text-brand-muted mt-1">Manage your contacts, filter prospects, and execute CRM workflows.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download size={16} className="mr-2" /> Export CSV
          </Button>
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
            <Upload size={16} className="mr-2" /> Import CSV
          </Button>
          <Button onClick={handleOpenAdd}>
            <Plus size={16} className="mr-2" /> Add Lead
          </Button>
        </div>
      </div>

      {selectedLeadIds.length > 0 && (
        <div className="bg-brand-primary/10 border border-brand-primary/20 px-4 py-3 rounded-lg flex items-center justify-between">
          <p className="text-sm font-medium text-brand-primary">
            {selectedLeadIds.length} lead(s) selected
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedLeadIds([])}>Clear</Button>
            <Button variant="danger" size="sm" onClick={handleBulkDelete}>
              <Trash2 size={14} className="mr-1.5" /> Delete Selected
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {/* Filters Bar */}
          <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row gap-4 justify-between items-center">
            <div className="relative w-full lg:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                placeholder="Search company, contact, email..."
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="replied">Replied</option>
                <option value="qualified">Qualified</option>
                <option value="meeting">Meeting</option>
                <option value="proposal">Proposal</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>

              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              >
                <option value="all">All Industries</option>
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              >
                <option value="date">Sort by Date</option>
                <option value="score">Sort by Score</option>
                <option value="name">Sort by Company</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={filteredLeads.length > 0 && selectedLeadIds.length === filteredLeads.length}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary" 
                      />
                      Contact / Company
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Industry & Location</th>
                  <th className="px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Source</th>
                  <th className="px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-brand-muted">
                      No leads found matching your search or filters.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={selectedLeadIds.includes(lead.id)}
                            onChange={() => toggleSelectLead(lead.id)}
                            className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary" 
                          />
                          <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xs shrink-0">
                            {lead.companyName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-brand-text text-sm">
                              <Link to={`/leads/${lead.id}`} className="hover:text-brand-primary transition-colors">
                                {lead.companyName}
                              </Link>
                            </p>
                            <p className="text-xs text-brand-muted">{lead.contactName} • {lead.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-brand-text">{lead.industry}</p>
                          <p className="text-xs text-brand-muted">{lead.location}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-brand-text text-sm bg-gray-100 px-2 py-1 rounded">
                          {lead.leadScore}/100
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-brand-muted">
                        {lead.source}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/leads/${lead.id}`} className="p-1.5 text-gray-400 hover:text-brand-primary rounded-md hover:bg-brand-primary/10 transition-colors" title="View Detail">
                            <MessageSquare size={16} />
                          </Link>
                          <button 
                            onClick={() => handleOpenEdit(lead)}
                            className="p-1.5 text-gray-400 hover:text-brand-primary rounded-md hover:bg-brand-primary/10 transition-colors"
                            title="Edit Lead"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => { setLeadToDelete(lead.id); setIsDeleteModalOpen(true); }}
                            className="p-1.5 text-gray-400 hover:text-brand-danger rounded-md hover:bg-brand-danger/10 transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-brand-muted">
            <p>Showing {filteredLeads.length} of {leads.length} leads</p>
          </div>
        </CardContent>
      </Card>

      {/* Add Lead Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Add New Lead"
        maxWidth="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAdd}>Save Lead</Button>
          </>
        }
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Company Name *</label>
              <input 
                type="text" 
                required
                value={formData.companyName}
                onChange={e => setFormData({...formData, companyName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                placeholder="Acme Inc"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Contact Name</label>
              <input 
                type="text" 
                value={formData.contactName}
                onChange={e => setFormData({...formData, contactName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Job Title</label>
              <input 
                type="text" 
                value={formData.jobTitle}
                onChange={e => setFormData({...formData, jobTitle: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                placeholder="VP of Sales"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Industry</label>
              <input 
                type="text" 
                value={formData.industry}
                onChange={e => setFormData({...formData, industry: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                placeholder="Technology"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                placeholder="john@acme.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Phone</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                placeholder="+1 555-0199"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Location</label>
              <input 
                type="text" 
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                placeholder="San Francisco, CA"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Website</label>
              <input 
                type="text" 
                value={formData.website}
                onChange={e => setFormData({...formData, website: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                placeholder="https://acme.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Lead Score (0-100)</label>
              <input 
                type="number" 
                min="0" 
                max="100"
                value={formData.leadScore}
                onChange={e => setFormData({...formData, leadScore: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="replied">Replied</option>
                <option value="qualified">Qualified</option>
                <option value="meeting">Meeting</option>
                <option value="proposal">Proposal</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit Lead Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Edit Lead"
        maxWidth="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Update Lead</Button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Company Name *</label>
              <input 
                type="text" 
                required
                value={formData.companyName}
                onChange={e => setFormData({...formData, companyName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Contact Name</label>
              <input 
                type="text" 
                value={formData.contactName}
                onChange={e => setFormData({...formData, contactName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Job Title</label>
              <input 
                type="text" 
                value={formData.jobTitle}
                onChange={e => setFormData({...formData, jobTitle: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Industry</label>
              <input 
                type="text" 
                value={formData.industry}
                onChange={e => setFormData({...formData, industry: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Phone</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Location</label>
              <input 
                type="text" 
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Website</label>
              <input 
                type="text" 
                value={formData.website}
                onChange={e => setFormData({...formData, website: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Lead Score (0-100)</label>
              <input 
                type="number" 
                min="0" 
                max="100"
                value={formData.leadScore}
                onChange={e => setFormData({...formData, leadScore: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="replied">Replied</option>
                <option value="qualified">Qualified</option>
                <option value="meeting">Meeting</option>
                <option value="proposal">Proposal</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Lead(s)"
        description="Are you sure you want to delete the selected lead(s)? This action cannot be undone."
        confirmText="Delete"
        intent="danger"
      />

      {/* Import CSV Modal */}
      <Modal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Leads from CSV"
        maxWidth="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <FileSpreadsheet size={16} className="mr-2" /> Download Template
            </Button>
            <Button onClick={handleProcessImport}>Process & Import</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-brand-muted">
            Paste your CSV data below or upload a CSV file. The first row must be the header (companyName, contactName, jobTitle, industry, location, website, email, phone, source).
          </p>
          <div>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="companyName,contactName,jobTitle,industry,location,website,email,phone,source&#10;Acme Inc,Jane Smith,CEO,Technology,San Francisco CA,https://acme.com,jane@acme.com,+15550199,Website"
              className="w-full font-mono text-xs p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
          {importStats && (
            <div className="p-3 bg-brand-success/10 border border-brand-success/20 rounded-lg flex items-center gap-3 text-sm text-brand-success">
              <CheckCircle2 size={20} />
              <div>
                <p className="font-semibold">Import Complete!</p>
                <p className="text-xs">Imported: {importStats.imported} | Skipped: {importStats.skipped} | Errors: {importStats.errors}</p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
