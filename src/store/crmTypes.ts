
export interface Note {
  id: string;
  content: string;
  createdAt: string;
  author: string;
}

export interface TaskItem {
  id: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  status?: 'Todo' | 'In Progress' | 'Completed';
  leadId?: string;
  leadName?: string;
  notes?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  leadId?: string;
  leadName?: string;
  description?: string;
  location?: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  desc: string;
  date: string;
  type: string;
}

export interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  jobTitle: string;
  industry: string;
  location: string;
  website: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  facebook: string | null;
  instagram: string | null;
  source: string;
  companySize: string;
  leadScore: number;
  status: 'new' | 'contacted' | 'replied' | 'qualified' | 'meeting' | 'proposal' | 'won' | 'lost';
  tags: string[];
  owner: string;
  rating?: number;
  reviewCount?: number;
  businessStatus?: string;
  category?: string;
  googlePlaceId?: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
  aiScore?: number | null;
  aiClassification?: 'hot' | 'warm' | 'cold' | null;
  aiReason?: string | null;
  aiConfidence?: number | null;
  aiAnalyzedAt?: string | null;
  companyDescription?: string | null;
  services?: string[];
  targetCustomers?: string[];
  businessStrengths?: string[];
  businessWeaknesses?: string[];
  onlinePresence?: string | null;
  websiteQuality?: string | null;
  socialPresence?: string | null;
  possiblePainPoints?: string[];
  salesOpportunity?: string | null;
  researchSummary?: string | null;
  researchedAt?: string | null;
  notes?: Note[];
  tasks?: TaskItem[];
  activities?: ActivityItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  leadId: string;
  channel: 'whatsapp' | 'instagram' | 'facebook' | 'gmail';
  body: string;
  direction: 'inbound' | 'outbound';
  status: 'draft' | 'pending_approval' | 'approved' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'rejected';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  scheduledAt?: string;
  sentAt?: string;
  failedAt?: string;
}

export interface ApprovalRequest {
  id: string;
  messageId: string;
  leadId: string;
  channel: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reason?: string;
}

export interface Campaign {
  id: string;
  name: string;
  audience: string;
  channel: 'Gmail' | 'WhatsApp' | 'Instagram' | 'Facebook';
  description: string;
  leadIds: string[];
  status: 'Active' | 'Paused' | 'Draft';
  createdAt: string;
}

