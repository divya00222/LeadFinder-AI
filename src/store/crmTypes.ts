
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
