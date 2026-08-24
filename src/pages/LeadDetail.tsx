import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCRM } from '../store/crmStore';
import { Lead, Note, TaskItem } from '../store/crmTypes';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Modal } from '../components/ui/Modal';
import { Toast, useToast } from '../components/ui/Toast';
import { 
  Building2, MapPin, Globe, Edit3, Plus, MoreHorizontal, 
  MessageCircle, Mail, BrainCircuit, Target, CheckCircle2, 
  Search, ArrowLeft, Briefcase, Users, DollarSign, Share2, 
  Phone, MessageSquare, Facebook, Instagram, Trash2, Calendar, CheckSquare, Square
} from 'lucide-react';
import { getChannelAvailability, getRecommendation, DEFAULT_PRIORITY, Channel } from '../lib/channelUtils';
import { ChannelAvailability } from '../components/channels/ChannelAvailability';
import { ChannelRecommendation } from '../components/channels/ChannelRecommendation';
import { ChannelSelector } from '../components/channels/ChannelSelector';

export function LeadDetail() {
  const { id } = useParams();
  const { leads, updateLead, updateLeadStatus, addNote, updateNote, deleteNote, addTask, toggleTask, deleteTask } = useCRM();
  const { toasts, toast, removeToast } = useToast();

  const lead = useMemo(() => leads.find(l => l.id === id), [leads, id]);

  const [activeTab, setActiveTab] = useState('overview');
  const [priority, setPriority] = useState<Channel[]>(DEFAULT_PRIORITY);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    companyName: '',
    contactName: '',
    jobTitle: '',
    industry: '',
    location: '',
    website: '',
    email: '',
    phone: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
    source: '',
    companySize: '',
    leadScore: 75,
    status: 'new' as Lead['status'],
    tagsStr: ''
  });

  // Note Modal State
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('Tomorrow');

  const availabilities = useMemo(() => lead ? getChannelAvailability(lead) : [], [lead]);
  const recommendation = useMemo(() => lead ? getRecommendation(lead) : { type: 'Email', reason: 'Standard outreach' }, [lead]);

  if (!lead) {
    return (
      <div className="text-center py-24 space-y-4">
        <h2 className="text-2xl font-bold text-brand-text">Lead Not Found</h2>
        <p className="text-brand-muted">The lead you are looking for does not exist or has been deleted.</p>
        <Link to="/leads">
          <Button>Back to Leads Directory</Button>
        </Link>
      </div>
    );
  }

  const handleOpenEdit = () => {
    setEditFormData({
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
      tagsStr: (lead.tags || []).join(', ')
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.companyName.trim()) {
      toast('Company name is required', 'error');
      return;
    }
    const tags = editFormData.tagsStr.split(',').map(t => t.trim()).filter(Boolean);
    updateLead(lead.id, {
      ...editFormData,
      whatsapp: editFormData.whatsapp || null,
      facebook: editFormData.facebook || null,
      instagram: editFormData.instagram || null,
      tags
    });
    setIsEditModalOpen(false);
    toast('Lead updated successfully', 'success');
  };

  const handleStatusChange = (newStatus: Lead['status']) => {
    updateLeadStatus(lead.id, newStatus);
    toast(`Lead status updated to ${newStatus.toUpperCase()}`, 'success');
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) {
      toast('Note content cannot be empty', 'error');
      return;
    }
    if (editingNoteId) {
      updateNote(lead.id, editingNoteId, noteContent);
      toast('Note updated successfully', 'success');
      setEditingNoteId(null);
    } else {
      addNote(lead.id, noteContent);
      toast('Note added successfully', 'success');
    }
    setNoteContent('');
    setIsNoteModalOpen(false);
  };

  const handleOpenEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setNoteContent(note.content);
    setIsNoteModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      toast('Task title is required', 'error');
      return;
    }
    addTask(lead.id, taskTitle, taskDueDate);
    setIsTaskModalOpen(false);
    setTaskTitle('');
    setTaskDueDate('Tomorrow');
    toast('Task added successfully', 'success');
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'active': case 'contacted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'new': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'replied': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'qualified': return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'meeting': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'proposal': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'won': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'lost': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-28">
      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      {/* Back navigation */}
      <div>
        <Link to="/leads" className="inline-flex items-center text-sm font-medium text-brand-muted hover:text-brand-primary transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to Leads
        </Link>
      </div>

      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-start gap-4">
          <Avatar 
            fallback={lead.companyName.charAt(0)} 
            size="xl" 
            className="w-16 h-16 text-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shrink-0 font-bold" 
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-brand-text">{lead.companyName}</h1>
              <Badge className={`font-bold border uppercase ${getStatusColor(lead.status)}`}>
                {lead.status}
              </Badge>
              <Badge className="bg-red-100 text-red-700 font-bold border-red-200">
                Score: {lead.leadScore}/100
              </Badge>
            </div>
            <p className="text-sm font-medium text-brand-text">{lead.contactName} • <span className="text-brand-muted">{lead.jobTitle}</span></p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-sm text-brand-muted">
              <span className="flex items-center gap-1.5"><Briefcase size={14} /> {lead.industry}</span>
              <span className="flex items-center gap-1.5"><MapPin size={14} /> {lead.location}</span>
              {lead.website && (
                <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-brand-primary hover:underline">
                  <Globe size={14} /> {lead.website.replace('https://', '').replace('http://', '')}
                </a>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Quick Changer */}
          <select
            value={lead.status}
            onChange={(e) => handleStatusChange(e.target.value as Lead['status'])}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="new">Status: New</option>
            <option value="contacted">Status: Contacted</option>
            <option value="replied">Status: Replied</option>
            <option value="qualified">Status: Qualified</option>
            <option value="meeting">Status: Meeting</option>
            <option value="proposal">Status: Proposal</option>
            <option value="won">Status: Won</option>
            <option value="lost">Status: Lost</option>
          </select>

          <Button variant="outline" className="bg-white" onClick={handleOpenEdit}>
            <Edit3 size={16} className="mr-2" /> Edit
          </Button>
          <Button variant="outline" className="bg-white" onClick={() => { setEditingNoteId(null); setNoteContent(''); setIsNoteModalOpen(true); }}>
            <Plus size={16} className="mr-2" /> Add Note
          </Button>
        </div>
      </div>

      {/* Main Content Area with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start border-b border-gray-200 bg-transparent h-auto p-0 rounded-none mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-brand-primary data-[state=active]:shadow-none rounded-none px-4 py-2 bg-transparent">Overview</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:border-b-2 data-[state=active]:border-brand-primary data-[state=active]:shadow-none rounded-none px-4 py-2 bg-transparent">
            Activity ({lead.activities?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="notes" className="data-[state=active]:border-b-2 data-[state=active]:border-brand-primary data-[state=active]:shadow-none rounded-none px-4 py-2 bg-transparent">
            Notes ({lead.notes?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:border-b-2 data-[state=active]:border-brand-primary data-[state=active]:shadow-none rounded-none px-4 py-2 bg-transparent">
            Tasks ({lead.tasks?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="channels" className="data-[state=active]:border-b-2 data-[state=active]:border-brand-primary data-[state=active]:shadow-none rounded-none px-4 py-2 bg-transparent">Channels</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 outline-none space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* AI Insights */}
              <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-indigo-900 flex items-center gap-2 text-lg">
                    <BrainCircuit size={20} className="text-indigo-500" />
                    AI Insights & Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-1">Company Summary</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {lead.companyName} is operating in the {lead.industry} industry based in {lead.location}. Source: {lead.source}. Team size is estimated at {lead.companySize} employees. Strong prospect for targeted CRM and sales automation workflows.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <h4 className="text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Target size={14} /> Key Focus Areas</h4>
                      <ul className="space-y-1.5">
                        <li className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                          Outbound lead generation scaling
                        </li>
                        <li className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                          Multi-channel engagement tracking
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-1.5"><CheckCircle2 size={14} /> Recommended Action</h4>
                      <p className="text-sm text-gray-700">
                        Initiate personalized outreach via {recommendation.type} highlighting automated conversion workflows.
                      </p>
                    </div>
                  </div>
                  {lead.tags && lead.tags.length > 0 && (
                    <div className="pt-2 border-t border-indigo-100">
                      <h4 className="text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {lead.tags.map((tag, idx) => (
                          <Badge key={idx} variant="neutral" className="bg-white border-indigo-200 text-indigo-700">#{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Company & Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Company Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                      <div>
                        <p className="text-brand-muted text-xs mb-0.5">Industry</p>
                        <p className="font-medium text-brand-text flex items-center gap-1.5"><Briefcase size={14} className="text-gray-400" /> {lead.industry}</p>
                      </div>
                      <div>
                        <p className="text-brand-muted text-xs mb-0.5">Location</p>
                        <p className="font-medium text-brand-text flex items-center gap-1.5"><MapPin size={14} className="text-gray-400" /> {lead.location}</p>
                      </div>
                      <div>
                        <p className="text-brand-muted text-xs mb-0.5">Company Size</p>
                        <p className="font-medium text-brand-text flex items-center gap-1.5"><Users size={14} className="text-gray-400" /> {lead.companySize}</p>
                      </div>
                      <div>
                        <p className="text-brand-muted text-xs mb-0.5">Source</p>
                        <p className="font-medium text-brand-text flex items-center gap-1.5"><Share2 size={14} className="text-gray-400" /> {lead.source}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-brand-muted text-xs mb-0.5">Website</p>
                        <p className="font-medium text-brand-text flex items-center gap-1.5">
                          <Globe size={14} className="text-gray-400 shrink-0" /> 
                          <span className="truncate">{lead.website || 'N/A'}</span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                      <Avatar fallback={lead.contactName.charAt(0)} size="md" className="bg-gray-100 text-gray-600 font-bold" />
                      <div>
                        <p className="font-semibold text-brand-text">{lead.contactName}</p>
                        <p className="text-xs text-brand-muted">{lead.jobTitle}</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-brand-muted text-xs mb-0.5">Email Address</p>
                        <a href={`mailto:${lead.email}`} className="font-medium text-brand-primary hover:underline">{lead.email || 'N/A'}</a>
                      </div>
                      <div>
                        <p className="text-brand-muted text-xs mb-0.5">Phone Number</p>
                        <a href={`tel:${lead.phone}`} className="font-medium text-brand-text">{lead.phone || 'N/A'}</a>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-[10px] text-brand-muted font-medium mb-1">WhatsApp</p>
                          <span className={`text-xs font-bold ${lead.whatsapp ? 'text-green-600' : 'text-gray-400'}`}>
                            {lead.whatsapp ? 'Connected' : 'None'}
                          </span>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-[10px] text-brand-muted font-medium mb-1">Facebook</p>
                          <span className={`text-xs font-bold ${lead.facebook ? 'text-blue-600' : 'text-gray-400'}`}>
                            {lead.facebook ? 'Connected' : 'None'}
                          </span>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-[10px] text-brand-muted font-medium mb-1">Instagram</p>
                          <span className={`text-xs font-bold ${lead.instagram ? 'text-pink-600' : 'text-gray-400'}`}>
                            {lead.instagram ? 'Connected' : 'None'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>

            {/* Right Column */}
            <div className="space-y-6">
              
              {/* Lead Score Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    Lead Score
                    <span className="text-lg font-bold text-red-600">{lead.leadScore}/100</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Website Quality', value: Math.min(100, lead.leadScore + 5) },
                    { label: 'Company Fit', value: lead.leadScore },
                    { label: 'Contact Availability', value: lead.email && lead.phone ? 95 : 60 },
                    { label: 'Engagement Intent', value: Math.max(40, lead.leadScore - 10) },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-brand-text">{item.label}</span>
                        <span className="text-brand-muted">{item.value}/100</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${item.value >= 80 ? 'bg-brand-success' : item.value >= 60 ? 'bg-brand-warning' : 'bg-brand-muted'}`}
                          style={{ width: `${item.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Notes preview */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base">Recent Notes</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => { setEditingNoteId(null); setNoteContent(''); setIsNoteModalOpen(true); }}>
                    <Plus size={14} className="mr-1" /> Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(!lead.notes || lead.notes.length === 0) ? (
                    <p className="text-xs text-brand-muted italic py-2">No notes added yet.</p>
                  ) : (
                    lead.notes.slice(0, 3).map(note => (
                      <div key={note.id} className="p-3 bg-gray-50 rounded-lg text-xs space-y-1">
                        <p className="text-brand-text">{note.content}</p>
                        <p className="text-[10px] text-gray-400">{note.createdAt}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-0 outline-none">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Activity Timeline</CardTitle>
              <span className="text-xs text-brand-muted font-medium">{lead.activities?.length || 0} recorded events</span>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 border-l-2 border-gray-100 space-y-8 py-2">
                {(!lead.activities || lead.activities.length === 0) ? (
                  <p className="text-sm text-brand-muted">No activities recorded yet.</p>
                ) : (
                  lead.activities.map((event) => (
                    <div key={event.id} className="relative">
                      <div className="absolute -left-[31px] w-6 h-6 rounded-full flex items-center justify-center border-2 border-white ring-4 ring-white bg-brand-primary text-white">
                        <CheckCircle2 size={12} />
                      </div>
                      <div className="ml-2">
                        <h4 className="text-sm font-semibold text-brand-text">{event.title}</h4>
                        <p className="text-sm text-brand-muted mt-0.5">{event.desc}</p>
                        <span className="text-xs text-gray-400 mt-1 block">{event.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-0 outline-none space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-brand-text">Lead Notes</h3>
            <Button onClick={() => { setEditingNoteId(null); setNoteContent(''); setIsNoteModalOpen(true); }}>
              <Plus size={16} className="mr-2" /> Add Note
            </Button>
          </div>
          
          <div className="space-y-3">
            {(!lead.notes || lead.notes.length === 0) ? (
              <Card>
                <CardContent className="py-12 text-center text-brand-muted">
                  <MessageSquare size={36} className="mx-auto text-gray-300 mb-2" />
                  <p>No notes for this lead yet. Click "Add Note" to record insights.</p>
                </CardContent>
              </Card>
            ) : (
              lead.notes.map(note => (
                <Card key={note.id}>
                  <CardContent className="p-4 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-brand-text whitespace-pre-wrap">{note.content}</p>
                      <p className="text-xs text-gray-400">{note.author} • {note.createdAt}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEditNote(note)}>
                        <Edit3 size={14} />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { deleteNote(lead.id, note.id); toast('Note deleted', 'success'); }}>
                        <Trash2 size={14} className="text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-0 outline-none space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-brand-text">Linked Tasks</h3>
            <Button onClick={() => setIsTaskModalOpen(true)}>
              <Plus size={16} className="mr-2" /> Add Task
            </Button>
          </div>

          <div className="space-y-3">
            {(!lead.tasks || lead.tasks.length === 0) ? (
              <Card>
                <CardContent className="py-12 text-center text-brand-muted">
                  <CheckSquare size={36} className="mx-auto text-gray-300 mb-2" />
                  <p>No tasks linked to this lead. Click "Add Task" to create one.</p>
                </CardContent>
              </Card>
            ) : (
              lead.tasks.map(task => (
                <Card key={task.id} className={task.completed ? 'bg-gray-50 opacity-75' : ''}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleTask(lead.id, task.id)} className="text-brand-primary focus:outline-none">
                        {task.completed ? <CheckSquare size={20} className="text-green-600" /> : <Square size={20} className="text-gray-400" />}
                      </button>
                      <div>
                        <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-brand-text'}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-brand-muted flex items-center gap-1 mt-0.5">
                          <Calendar size={12} /> Due: {task.dueDate}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => { deleteTask(lead.id, task.id); toast('Task deleted', 'success'); }}>
                      <Trash2 size={14} className="text-red-500" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="channels" className="mt-0 outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Channel Outreach & Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ChannelSelector priority={priority} onChange={setPriority} />
              <ChannelAvailability availabilities={availabilities} />
              <ChannelRecommendation type={recommendation.type} reason={recommendation.reason} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between sm:justify-end gap-3">
          <Button variant="outline" onClick={() => setIsTaskModalOpen(true)}>
            Add Task
          </Button>
          <Button variant="outline" onClick={() => { setEditingNoteId(null); setNoteContent(''); setIsNoteModalOpen(true); }}>
            Add Note
          </Button>
          <Button onClick={() => setActiveTab('channels')} className="gap-2">
            <MessageCircle size={16} /> Start Outreach
          </Button>
        </div>
      </div>

      {/* Edit Lead Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Edit Lead Profile"
        maxWidth="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
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
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Job Title</label>
              <input 
                type="text" 
                value={editFormData.jobTitle}
                onChange={e => setEditFormData({...editFormData, jobTitle: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Industry</label>
              <input 
                type="text" 
                value={editFormData.industry}
                onChange={e => setEditFormData({...editFormData, industry: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Email</label>
              <input 
                type="email" 
                value={editFormData.email}
                onChange={e => setEditFormData({...editFormData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Phone</label>
              <input 
                type="text" 
                value={editFormData.phone}
                onChange={e => setEditFormData({...editFormData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Location</label>
              <input 
                type="text" 
                value={editFormData.location}
                onChange={e => setEditFormData({...editFormData, location: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Website</label>
              <input 
                type="text" 
                value={editFormData.website}
                onChange={e => setEditFormData({...editFormData, website: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
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
              <label className="block text-xs font-semibold text-brand-text mb-1">Tags (comma-separated)</label>
              <input 
                type="text" 
                value={editFormData.tagsStr}
                onChange={e => setEditFormData({...editFormData, tagsStr: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                placeholder="vip, high-priority, enterprise"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Add/Edit Note Modal */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title={editingNoteId ? 'Edit Note' : 'Add Note'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsNoteModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveNote}>{editingNoteId ? 'Update Note' : 'Save Note'}</Button>
          </>
        }
      >
        <form onSubmit={handleSaveNote} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">Note Content *</label>
            <textarea
              rows={4}
              required
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
              placeholder="Enter details of conversation, meeting notes, or follow-up items..."
              className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
        </form>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Add Linked Task"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTask}>Create Task</Button>
          </>
        }
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              placeholder="e.g., Send follow-up proposal by Thursday"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">Due Date</label>
            <input
              type="text"
              value={taskDueDate}
              onChange={e => setTaskDueDate(e.target.value)}
              placeholder="e.g., Tomorrow, Friday, Oct 12"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
        </form>
      </Modal>

    </div>
  );
}
