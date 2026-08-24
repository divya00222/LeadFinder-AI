import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { 
  Search, Filter, Upload, Plus, MessageCircle, Facebook, Instagram, 
  Mail, MoreHorizontal, ChevronLeft, ChevronRight, Check, UploadCloud
} from 'lucide-react';

const initialLeads = [
  { id: 1, company: 'Acme Corp', industry: 'Software', location: 'San Francisco, CA', score: 85, channels: { whatsapp: true, facebook: true, instagram: false, gmail: true }, status: 'New', addedOn: 'May 20, 2026' },
  { id: 2, company: 'TechStart', industry: 'Marketing', location: 'New York, NY', score: 65, channels: { whatsapp: false, facebook: true, instagram: true, gmail: true }, status: 'Contacted', addedOn: 'May 18, 2026' },
  { id: 3, company: 'Global Solutions', industry: 'Consulting', location: 'London, UK', score: 35, channels: { whatsapp: true, facebook: false, instagram: false, gmail: true }, status: 'Replied', addedOn: 'May 15, 2026' },
  { id: 4, company: 'InnovateHub', industry: 'Design', location: 'Berlin, DE', score: 92, channels: { whatsapp: true, facebook: true, instagram: true, gmail: true }, status: 'Qualified', addedOn: 'May 10, 2026' },
  { id: 5, company: 'CloudScale', industry: 'Software', location: 'Austin, TX', score: 45, channels: { whatsapp: false, facebook: false, instagram: false, gmail: true }, status: 'Meeting', addedOn: 'May 05, 2026' },
  { id: 6, company: 'NextGen', industry: 'Fintech', location: 'Toronto, CA', score: 78, channels: { whatsapp: true, facebook: false, instagram: true, gmail: false }, status: 'Proposal', addedOn: 'May 01, 2026' },
  { id: 7, company: 'Stripe', industry: 'Fintech', location: 'San Francisco, CA', score: 95, channels: { whatsapp: true, facebook: true, instagram: true, gmail: true }, status: 'Won', addedOn: 'Apr 28, 2026' },
  { id: 8, company: 'Vercel', industry: 'Software', location: 'Remote', score: 20, channels: { whatsapp: false, facebook: false, instagram: false, gmail: true }, status: 'Lost', addedOn: 'Apr 15, 2026' },
];

export function LeadFinder() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);

  const toggleSelection = (id: number) => {
    setSelectedLeads(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedLeads.length === initialLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(initialLeads.map(l => l.id));
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70) return <Badge className="bg-red-100 text-red-700">Hot ({score})</Badge>;
    if (score >= 40) return <Badge className="bg-amber-100 text-amber-700">Warm ({score})</Badge>;
    return <Badge className="bg-blue-100 text-blue-700">Cold ({score})</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New': return <Badge variant="primary">New</Badge>;
      case 'Contacted': return <Badge className="bg-indigo-100 text-indigo-700">Contacted</Badge>;
      case 'Replied': return <Badge className="bg-purple-100 text-purple-700">Replied</Badge>;
      case 'Qualified': return <Badge className="bg-teal-100 text-teal-700">Qualified</Badge>;
      case 'Meeting': return <Badge className="bg-pink-100 text-pink-700">Meeting</Badge>;
      case 'Proposal': return <Badge className="bg-orange-100 text-orange-700">Proposal</Badge>;
      case 'Won': return <Badge variant="success">Won</Badge>;
      case 'Lost': return <Badge variant="neutral">Lost</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Lead Finder</h1>
          <p className="text-sm text-brand-muted mt-1">Discover, filter, and manage your prospect database.</p>
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

      {/* Main Search & Filters Panel */}
      <div>
        <div className="relative w-full max-w-lg mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-sm"
            placeholder="Search businesses, industries, locations..."
          />
        </div>

        {showFilters && (
          <Card className="mb-6 animate-in slide-in-from-top-2 fade-in">
            <CardContent className="p-4 sm:p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Select label="Location">
                  <option>All Locations</option>
                  <option>North America</option>
                  <option>Europe</option>
                </Select>
                <Select label="Industry">
                  <option>All Industries</option>
                  <option>Software</option>
                  <option>Marketing</option>
                </Select>
                <Select label="Lead Score">
                  <option>Any Score</option>
                  <option>Hot (70-100)</option>
                  <option>Warm (40-69)</option>
                  <option>Cold (0-39)</option>
                </Select>
                <Select label="Company Size">
                  <option>Any Size</option>
                  <option>1-50</option>
                  <option>51-200</option>
                </Select>
                <Select label="Lead Status">
                  <option>Any Status</option>
                  <option>New</option>
                  <option>Contacted</option>
                </Select>
                <Select label="Lead Source">
                  <option>Any Source</option>
                  <option>Google Maps</option>
                  <option>Website</option>
                </Select>
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-brand-text cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary" /> Has Email
                </label>
                <label className="flex items-center gap-2 text-sm text-brand-text cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary" /> Has Phone
                </label>
                <label className="flex items-center gap-2 text-sm text-brand-text cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary" /> Has WhatsApp
                </label>
                <label className="flex items-center gap-2 text-sm text-brand-text cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary" /> Has Instagram
                </label>
                <label className="flex items-center gap-2 text-sm text-brand-text cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary" /> Has Facebook
                </label>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedLeads.length > 0 && (
        <div className="bg-brand-primary/5 border border-brand-primary/20 p-3 rounded-lg flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 text-sm font-medium text-brand-primary">
            <Check size={16} />
            {selectedLeads.length} leads selected
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-white">Change Status</Button>
            <Button variant="outline" size="sm" className="bg-white">Export Selected</Button>
            <Button variant="danger" size="sm">Delete</Button>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary" 
                    checked={selectedLeads.length === initialLeads.length && initialLeads.length > 0}
                    onChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Lead Score</TableHead>
                <TableHead>Channels</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary" 
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => toggleSelection(lead.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Link to={`/leads/${lead.id}`} className="font-semibold text-brand-text hover:text-brand-primary transition-colors">
                      {lead.company}
                    </Link>
                  </TableCell>
                  <TableCell className="text-brand-muted">{lead.industry}</TableCell>
                  <TableCell className="text-brand-muted">{lead.location}</TableCell>
                  <TableCell>{getScoreBadge(lead.score)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MessageCircle size={16} className={lead.channels.whatsapp ? 'text-[#25D366]' : 'text-gray-300'} />
                      <Facebook size={16} className={lead.channels.facebook ? 'text-[#1877F2]' : 'text-gray-300'} />
                      <Instagram size={16} className={lead.channels.instagram ? 'text-[#E4405F]' : 'text-gray-300'} />
                      <Mail size={16} className={lead.channels.gmail ? 'text-[#EA4335]' : 'text-gray-300'} />
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(lead.status)}</TableCell>
                  <TableCell className="text-brand-muted text-xs">{lead.addedOn}</TableCell>
                  <TableCell className="text-right">
                    <button className="p-1.5 text-gray-400 hover:text-brand-text hover:bg-gray-100 rounded-md transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-brand-muted">
            <p>Showing <span className="font-medium text-brand-text">1</span> to <span className="font-medium text-brand-text">8</span> of <span className="font-medium text-brand-text">420</span> results</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="px-2" disabled><ChevronLeft size={16} /></Button>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-md bg-brand-primary text-white font-medium">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-md text-brand-text hover:bg-gray-100 font-medium">2</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-md text-brand-text hover:bg-gray-100 font-medium">3</button>
                <span className="px-1">...</span>
                <button className="w-8 h-8 flex items-center justify-center rounded-md text-brand-text hover:bg-gray-100 font-medium">42</button>
              </div>
              <Button variant="outline" size="sm" className="px-2"><ChevronRight size={16} /></Button>
            </div>
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
            <Button onClick={() => setIsAddModalOpen(false)}>Save Lead</Button>
          </>
        }
      >
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Company Name" placeholder="e.g. Acme Corp" />
            <Input label="Contact Name" placeholder="e.g. Jane Doe" />
            <Input label="Job Title" placeholder="e.g. VP Sales" />
            <Input label="Industry" placeholder="e.g. Software" />
            <Input label="Location" placeholder="e.g. San Francisco, CA" />
            <Input label="Website" placeholder="https://" />
            <Input label="Email" type="email" placeholder="jane@example.com" />
            <Input label="Phone" placeholder="+1 (555) 000-0000" />
          </div>
          
          <div className="border-t border-gray-100 pt-4 mt-4">
            <h4 className="text-sm font-medium text-brand-text mb-3">Social Channels</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <Input label="WhatsApp" placeholder="+1..." />
               <Input label="Facebook" placeholder="Profile URL" />
               <Input label="Instagram" placeholder="@username" />
            </div>
          </div>
        </form>
      </Modal>

      {/* Import CSV Modal */}
      <Modal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        title="Import Leads (CSV)" 
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsImportModalOpen(false)} disabled>Process Import</Button>
          </>
        }
      >
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 hover:border-brand-primary/50 transition-colors cursor-pointer group">
          <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-brand-primary group-hover:scale-110 transition-transform">
            <UploadCloud size={24} />
          </div>
          <h3 className="text-base font-semibold text-brand-text mb-1">Click to upload or drag and drop</h3>
          <p className="text-sm text-brand-muted mb-4">CSV or Excel files only (max 10MB)</p>
          <Button variant="outline" size="sm">Browse Files</Button>
        </div>
        
        <div className="mt-6 flex items-center justify-between text-sm text-brand-muted bg-blue-50/50 p-3 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-blue-500" />
            <span>Supported columns: Name, Company, Email, Phone...</span>
          </div>
          <a href="#" className="text-brand-primary font-medium hover:underline">Download Template</a>
        </div>
      </Modal>
    </div>
  );
}
