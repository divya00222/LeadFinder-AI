import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCRM } from '../store/crmStore';
import { Lead } from '../store/crmTypes';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Toast, useToast } from '../components/ui/Toast';
import { 
  Search, Filter, Upload, Plus, MessageCircle, Facebook, Instagram, 
  Mail, Building2, CheckCircle2, FileSpreadsheet
} from 'lucide-react';

export function LeadFinder() {
  const { leads, addLead, importLeads } = useCRM();
  const { toasts, toast, removeToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [locationFilter, setLocationFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    jobTitle: '',
    industry: 'Software',
    location: 'San Francisco, CA',
    website: '',
    email: '',
    phone: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
    source: 'Google Maps',
    companySize: '11-50',
    leadScore: 85,
    status: 'new' as Lead['status'],
    owner: 'Admin'
  });

  // CSV Import state
  const [csvText, setCsvText] = useState('');
  const [importStats, setImportStats] = useState<{ imported: number; skipped: number; errors: number } | null>(null);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLocation = locationFilter === 'all' || lead.location.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesIndustry = industryFilter === 'all' || lead.industry === industryFilter;
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      
      let matchesScore = true;
      if (scoreFilter === 'hot') matchesScore = lead.leadScore >= 70;
      else if (scoreFilter === 'warm') matchesScore = lead.leadScore >= 40 && lead.leadScore < 70;
      else if (scoreFilter === 'cold') matchesScore = lead.leadScore < 40;

      return matchesSearch && matchesLocation && matchesIndustry && matchesStatus && matchesScore;
    });
  }, [leads, searchQuery, locationFilter, industryFilter, scoreFilter, statusFilter]);

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      toast('Company Name is required', 'error');
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
    toast('Lead discovered and added successfully', 'success');
  };

  const handleDownloadTemplate = () => {
    const template = 'companyName,contactName,jobTitle,industry,location,website,email,phone,source\n"Stripe","Patrick Collison","CEO","Fintech","San Francisco, CA","https://stripe.com","patrick@stripe.com","+15550122","Google Maps"';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead_finder_template.csv';
    a.click();
    toast('CSV template downloaded', 'success');
  };

  const handleProcessImport = () => {
    if (!csvText.trim()) {
      toast('Please enter CSV data', 'error');
      return;
    }
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        toast('Invalid CSV format', 'error');
        return;
      }
      let imported = 0;
      const newLeadsList: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        if (row.length < 2) continue;
        newLeadsList.push({
          companyName: row[0] || 'Company',
          contactName: row[1] || 'Contact',
          jobTitle: row[2] || 'Director',
          industry: row[3] || 'Technology',
          location: row[4] || 'Remote',
          website: row[5] || '',
          email: row[6] || '',
          phone: row[7] || '',
          whatsapp: null,
          facebook: null,
          instagram: null,
          source: row[8] || 'CSV Import',
          companySize: '11-50',
          leadScore: 80,
          status: 'new',
          tags: ['discovered'],
          owner: 'Admin'
        });
        imported++;
      }
      importLeads(newLeadsList);
      setImportStats({ imported, skipped: 0, errors: 0 });
      toast(`Successfully imported ${imported} leads!`, 'success');
    } catch (e) {
      toast('Error parsing CSV', 'error');
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70) return <Badge className="bg-red-100 text-red-700">Hot ({score})</Badge>;
    if (score >= 40) return <Badge className="bg-amber-100 text-amber-700">Warm ({score})</Badge>;
    return <Badge className="bg-blue-100 text-blue-700">Cold ({score})</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <Badge variant="primary">New</Badge>;
      case 'contacted': return <Badge className="bg-indigo-100 text-indigo-700">Contacted</Badge>;
      case 'replied': return <Badge className="bg-purple-100 text-purple-700">Replied</Badge>;
      case 'qualified': return <Badge className="bg-teal-100 text-teal-700">Qualified</Badge>;
      case 'meeting': return <Badge className="bg-pink-100 text-pink-700">Meeting</Badge>;
      case 'proposal': return <Badge className="bg-orange-100 text-orange-700">Proposal</Badge>;
      case 'won': return <Badge variant="success">Won</Badge>;
      case 'lost': return <Badge variant="neutral">Lost</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Lead Finder AI</h1>
          <p className="text-sm text-brand-muted mt-1">Discover, filter, and prospect qualified leads instantly.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)} 
            className={showFilters ? 'bg-gray-100' : ''}
          >
            <Filter size={16} className="mr-2" /> Filters
          </Button>
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
            <Upload size={16} className="mr-2" /> Import
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} className="mr-2" /> Add Lead
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div>
        <div className="relative w-full max-w-lg mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-sm"
            placeholder="Search businesses, contact name, industry, location..."
          />
        </div>

        {showFilters && (
          <Card className="mb-6 animate-in slide-in-from-top-2 fade-in">
            <CardContent className="p-4 sm:p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Location</label>
                  <select 
                    value={locationFilter} 
                    onChange={e => setLocationFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                  >
                    <option value="all">All Locations</option>
                    <option value="San Francisco">San Francisco</option>
                    <option value="New York">New York</option>
                    <option value="London">London</option>
                    <option value="Berlin">Berlin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Industry</label>
                  <select 
                    value={industryFilter} 
                    onChange={e => setIndustryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                  >
                    <option value="all">All Industries</option>
                    <option value="Software">Software</option>
                    <option value="Technology">Technology</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Fintech">Fintech</option>
                    <option value="Consulting">Consulting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Lead Score</label>
                  <select 
                    value={scoreFilter} 
                    onChange={e => setScoreFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                  >
                    <option value="all">Any Score</option>
                    <option value="hot">Hot (70-100)</option>
                    <option value="warm">Warm (40-69)</option>
                    <option value="cold">Cold (0-39)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Status</label>
                  <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                  >
                    <option value="all">Any Status</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Grid of Leads */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                    {lead.companyName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-text">
                      <Link to={`/leads/${lead.id}`} className="hover:text-brand-primary transition-colors">
                        {lead.companyName}
                      </Link>
                    </h3>
                    <p className="text-xs text-brand-muted">{lead.industry} • {lead.location}</p>
                  </div>
                </div>
                {getScoreBadge(lead.leadScore)}
              </div>

              <div className="text-sm space-y-1 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-brand-text">{lead.contactName} <span className="text-xs text-brand-muted">({lead.jobTitle})</span></p>
                <p className="text-xs text-brand-muted truncate">{lead.email} • {lead.phone}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${lead.whatsapp ? 'bg-green-500' : 'bg-gray-300'}`} title="WhatsApp" />
                  <span className={`w-2 h-2 rounded-full ${lead.instagram ? 'bg-pink-500' : 'bg-gray-300'}`} title="Instagram" />
                  <span className={`w-2 h-2 rounded-full ${lead.facebook ? 'bg-blue-500' : 'bg-gray-300'}`} title="Facebook" />
                  <span className={`w-2 h-2 rounded-full ${lead.email ? 'bg-purple-500' : 'bg-gray-300'}`} title="Gmail" />
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(lead.status)}
                  <Link to={`/leads/${lead.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Lead Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Discover & Add Prospect"
        maxWidth="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAdd}>Save Prospect</Button>
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
                placeholder="Stripe"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Contact Name</label>
              <input 
                type="text" 
                value={formData.contactName}
                onChange={e => setFormData({...formData, contactName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                placeholder="Patrick Collison"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Job Title</label>
              <input 
                type="text" 
                value={formData.jobTitle}
                onChange={e => setFormData({...formData, jobTitle: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                placeholder="CEO"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Industry</label>
              <input 
                type="text" 
                value={formData.industry}
                onChange={e => setFormData({...formData, industry: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                placeholder="Fintech"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                placeholder="patrick@stripe.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Phone</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                placeholder="+1 555-0122"
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
              <label className="block text-xs font-semibold text-brand-text mb-1">Lead Score</label>
              <input 
                type="number" 
                min="0" 
                max="100"
                value={formData.leadScore}
                onChange={e => setFormData({...formData, leadScore: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Leads"
        maxWidth="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <FileSpreadsheet size={16} className="mr-2" /> Download Template
            </Button>
            <Button onClick={handleProcessImport}>Process Import</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-brand-muted">
            Paste CSV rows to add leads to the database.
          </p>
          <textarea
            rows={5}
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
            placeholder="companyName,contactName,jobTitle,industry,location,website,email,phone,source"
            className="w-full font-mono text-xs p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
          {importStats && (
            <div className="p-3 bg-brand-success/10 text-brand-success rounded-lg text-sm flex items-center gap-2">
              <CheckCircle2 size={18} />
              <span>Successfully imported {importStats.imported} leads!</span>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
