import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { 
  Building2, MapPin, Globe, Edit3, Plus, MoreHorizontal, 
  MessageCircle, Mail, BrainCircuit,
  Target, CheckCircle2, Search, ArrowLeft, Briefcase, Users, DollarSign, Share2
} from 'lucide-react';
import { getChannelAvailability, getRecommendation, DEFAULT_PRIORITY, ChannelType } from '../lib/channelUtils';
import { ChannelAvailability } from '../components/channels/ChannelAvailability';
import { ChannelRecommendation } from '../components/channels/ChannelRecommendation';
import { ChannelSelector } from '../components/channels/ChannelSelector';

export function LeadDetail() {
  const { id } = useParams();
  
  // Mock Data
  const lead = {
    id,
    company: 'Acme Corp',
    score: 85,
    industry: 'Software',
    location: 'San Francisco, CA',
    website: 'https://acme-corp.example.com',
    employees: '250-500',
    revenue: '$50M - $100M',
    source: 'Website Form',
    contact: {
      name: 'Jane Doe',
      title: 'VP of Sales',
      email: 'jane.doe@acme-corp.example.com',
      phone: '+1 (415) 555-0198'
    }
  };

  const [activeTab, setActiveTab] = useState('overview');
  const [priority, setPriority] = useState<ChannelType[]>(DEFAULT_PRIORITY);
  const availabilities = useMemo(() => getChannelAvailability(id || '1'), [id]);
  const recommendation = useMemo(() => getRecommendation(availabilities, priority), [availabilities, priority]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24">
      {/* Back navigation */}
      <div>
        <Link to="/leads" className="inline-flex items-center text-sm font-medium text-brand-muted hover:text-brand-primary transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to Leads
        </Link>
      </div>

      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <Avatar 
            fallback={lead.company.charAt(0)} 
            size="xl" 
            className="w-16 h-16 text-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20" 
          />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-brand-text">{lead.company}</h1>
              <Badge className="bg-red-100 text-red-700 font-bold border-red-200">
                Hot Lead ({lead.score})
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-brand-muted">
              <span className="flex items-center gap-1.5"><Briefcase size={14} /> {lead.industry}</span>
              <span className="flex items-center gap-1.5"><MapPin size={14} /> {lead.location}</span>
              <a href={lead.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-brand-primary hover:underline">
                <Globe size={14} /> {lead.website.replace('https://', '')}
              </a>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white">
            <Edit3 size={16} className="mr-2" /> Edit
          </Button>
          <Button variant="outline" className="bg-white">
            <Plus size={16} className="mr-2" /> Add Note
          </Button>
          <Button variant="outline" className="bg-white px-2">
            <MoreHorizontal size={16} />
          </Button>
        </div>
      </div>

      {/* Main Content Area with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start border-b border-gray-200 bg-transparent h-auto p-0 rounded-none mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-brand-primary data-[state=active]:shadow-none rounded-none px-4 py-2 bg-transparent">Overview</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:border-b-2 data-[state=active]:border-brand-primary data-[state=active]:shadow-none rounded-none px-4 py-2 bg-transparent">Activity</TabsTrigger>
          <TabsTrigger value="messages" className="data-[state=active]:border-b-2 data-[state=active]:border-brand-primary data-[state=active]:shadow-none rounded-none px-4 py-2 bg-transparent">Messages</TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:border-b-2 data-[state=active]:border-brand-primary data-[state=active]:shadow-none rounded-none px-4 py-2 bg-transparent">Tasks</TabsTrigger>
          <TabsTrigger value="notes" className="data-[state=active]:border-b-2 data-[state=active]:border-brand-primary data-[state=active]:shadow-none rounded-none px-4 py-2 bg-transparent">Notes</TabsTrigger>
          <TabsTrigger value="files" className="data-[state=active]:border-b-2 data-[state=active]:border-brand-primary data-[state=active]:shadow-none rounded-none px-4 py-2 bg-transparent">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* AI Insights */}
              <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-indigo-900 flex items-center gap-2 text-lg">
                    <BrainCircuit size={20} className="text-indigo-500" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-1">Company Summary</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Acme Corp is a rapidly growing B2B software provider specializing in cloud infrastructure. They recently raised a Series C round and are expanding their sales team aggressively. Their current tech stack lacks automated CRM integrations, presenting a strong opportunity for our platform.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <h4 className="text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Target size={14} /> Pain Points</h4>
                      <ul className="space-y-1.5">
                        <li className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0"></span>
                          Manual lead routing processes
                        </li>
                        <li className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0"></span>
                          Low outbound response rates
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-1.5"><CheckCircle2 size={14} /> Opportunities</h4>
                      <ul className="space-y-1.5">
                        <li className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                          Cross-sell AI messaging feature
                        </li>
                        <li className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                          Executive alignment possible
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-indigo-100">
                    <h4 className="text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-2">Recommended Services</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="neutral" className="bg-white border-indigo-200 text-indigo-700">AI CRM Bundle</Badge>
                      <Badge variant="neutral" className="bg-white border-indigo-200 text-indigo-700">Priority Support</Badge>
                      <Badge variant="neutral" className="bg-white border-indigo-200 text-indigo-700">Custom Onboarding</Badge>
                    </div>
                  </div>
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
                        <p className="text-brand-muted text-xs mb-0.5">Employees</p>
                        <p className="font-medium text-brand-text flex items-center gap-1.5"><Users size={14} className="text-gray-400" /> {lead.employees}</p>
                      </div>
                      <div>
                        <p className="text-brand-muted text-xs mb-0.5">Revenue</p>
                        <p className="font-medium text-brand-text flex items-center gap-1.5"><DollarSign size={14} className="text-gray-400" /> {lead.revenue}</p>
                      </div>
                      <div>
                        <p className="text-brand-muted text-xs mb-0.5">Website</p>
                        <p className="font-medium text-brand-text flex items-center gap-1.5"><Globe size={14} className="text-gray-400" /> {lead.website.replace('https://','')}</p>
                      </div>
                      <div>
                        <p className="text-brand-muted text-xs mb-0.5">Source</p>
                        <p className="font-medium text-brand-text flex items-center gap-1.5"><Share2 size={14} className="text-gray-400" /> {lead.source}</p>
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
                      <Avatar fallback={lead.contact.name.charAt(0)} size="md" className="bg-gray-100 text-gray-600" />
                      <div>
                        <p className="font-semibold text-brand-text">{lead.contact.name}</p>
                        <p className="text-xs text-brand-muted">{lead.contact.title}</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-brand-muted text-xs mb-0.5">Email</p>
                        <a href={`mailto:${lead.contact.email}`} className="font-medium text-brand-primary hover:underline">{lead.contact.email}</a>
                      </div>
                      <div>
                        <p className="text-brand-muted text-xs mb-0.5">Phone</p>
                        <a href={`tel:${lead.contact.phone}`} className="font-medium text-brand-text">{lead.contact.phone}</a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>

            {/* Right Column */}
            <div className="space-y-6">
              
              {/* Channel Availability */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Channel Availability</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ChannelSelector priority={priority} onChange={setPriority} />
                  <ChannelAvailability availabilities={availabilities} />
                  <ChannelRecommendation type={recommendation.type} reason={recommendation.reason} />
                </CardContent>
              </Card>

              {/* Lead Score Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    Lead Score
                    <span className="text-lg font-bold text-red-600">{lead.score}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Website Quality', value: 90 },
                    { label: 'Company Size', value: 85 },
                    { label: 'Contact Availability', value: 95 },
                    { label: 'Engagement', value: 70 },
                    { label: 'Buying Intent', value: 85 },
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

            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-0 outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-4 border-l-2 border-gray-100 space-y-8 py-2">
                {[
                  { title: 'Meeting booked', desc: 'Demo scheduled for next Tuesday.', date: 'Today, 10:45 AM', icon: Target, color: 'bg-brand-success text-white' },
                  { title: 'Reply received', desc: 'Jane replied to the follow-up email.', date: 'Today, 9:30 AM', icon: Mail, color: 'bg-blue-500 text-white' },
                  { title: 'Message sent', desc: 'Initial AI-generated outreach sent via LinkedIn.', date: 'Yesterday, 2:15 PM', icon: MessageCircle, color: 'bg-brand-primary text-white' },
                  { title: 'Message approved', desc: 'Approved by John Smith.', date: 'Yesterday, 2:00 PM', icon: CheckCircle2, color: 'bg-gray-100 text-brand-text' },
                  { title: 'Message generated', desc: 'AI drafted initial outreach based on research.', date: 'Yesterday, 1:55 PM', icon: BrainCircuit, color: 'bg-indigo-100 text-indigo-600' },
                  { title: 'AI research', desc: 'Completed full profile scan and insight generation.', date: 'Yesterday, 1:50 PM', icon: Search, color: 'bg-indigo-100 text-indigo-600' },
                  { title: 'Lead created', desc: 'Lead imported via Website Form.', date: 'Yesterday, 1:45 PM', icon: Plus, color: 'bg-gray-100 text-brand-text' },
                ].map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className={`absolute -left-[25px] w-6 h-6 rounded-full flex items-center justify-center border-2 border-white ring-4 ring-white ${event.color}`}>
                      <event.icon size={12} />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-semibold text-brand-text">{event.title}</h4>
                      <p className="text-sm text-brand-muted mt-0.5">{event.desc}</p>
                      <span className="text-xs text-gray-400 mt-1 block">{event.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="mt-0 outline-none text-center py-12">
           <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
           <h3 className="text-lg font-semibold text-brand-text">No messages yet</h3>
           <p className="text-brand-muted mt-1">Start outreach to see messages here.</p>
        </TabsContent>
        <TabsContent value="tasks" className="mt-0 outline-none text-center py-12">
          <p className="text-brand-muted">Task management coming soon.</p>
        </TabsContent>
        <TabsContent value="notes" className="mt-0 outline-none text-center py-12">
          <p className="text-brand-muted">Notes coming soon.</p>
        </TabsContent>
        <TabsContent value="files" className="mt-0 outline-none text-center py-12">
          <p className="text-brand-muted">File management coming soon.</p>
        </TabsContent>
      </Tabs>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between sm:justify-end gap-3">
          <Button variant="outline" className="flex-1 sm:flex-none">
            Add Task
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none">
            Create Proposal
          </Button>
          <Button className="flex-1 sm:flex-none gap-2">
            <MessageCircle size={16} /> Start Outreach
          </Button>
        </div>
      </div>

    </div>
  );
}
