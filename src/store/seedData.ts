
import { Lead, Message, ApprovalRequest } from './crmTypes';

export const initialLeads: Lead[] = [
  {
    id: '1',
    companyName: 'Acme Corp',
    contactName: 'John Doe',
    jobTitle: 'CEO',
    industry: 'Technology',
    location: 'San Francisco, CA',
    website: 'https://acme.com',
    email: 'john@acme.com',
    phone: '+15550100',
    whatsapp: '+15550100',
    facebook: 'acmecorp',
    instagram: 'acmecorp',
    source: 'Referral',
    companySize: '11-50',
    leadScore: 85,
    status: 'new',
    tags: ['high-priority'],
    owner: 'Jane Smith',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const initialMessages: Message[] = [];
export const initialApprovals: ApprovalRequest[] = [];
