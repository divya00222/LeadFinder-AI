import { initialLeads, initialMessages, initialApprovals } from '../store/seedData';
import { INITIAL_INTEGRATIONS, Integration } from './integrationUtils';
import { Lead, Message, ApprovalRequest, Campaign, TaskItem, Meeting } from '../store/crmTypes';

export interface FullCRMData {
  leads: Lead[];
  messages: Message[];
  approvals: ApprovalRequest[];
  campaigns: Campaign[];
  tasks: TaskItem[];
  meetings: Meeting[];
  integrations: Integration[];
  activities: any[];
  notifications: any[];
  settings: Record<string, any>;
}

const STORAGE_KEY = 'leadfinder_ai_crm';

export function getFullCRMData(): FullCRMData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        leads: parsed.leads || initialLeads,
        messages: parsed.messages || initialMessages,
        approvals: parsed.approvals || initialApprovals,
        campaigns: parsed.campaigns || [],
        tasks: parsed.tasks || [],
        meetings: parsed.meetings || [],
        integrations: parsed.integrations || INITIAL_INTEGRATIONS,
        activities: parsed.activities || [],
        notifications: parsed.notifications || [],
        settings: parsed.settings || { humanApproval: true }
      };
    }
  } catch (e) {
    console.error('Error loading full CRM data from localStorage', e);
  }

  // Default initial data if nothing in storage
  return {
    leads: initialLeads,
    messages: initialMessages,
    approvals: initialApprovals,
    campaigns: [
      {
        id: 'c1',
        name: 'Tech Outreach Q3',
        audience: 'CTOs & VPs of Engineering',
        channel: 'Gmail',
        description: 'Targeting high-growth tech companies for automated outbound CRM solutions.',
        leadIds: [],
        status: 'Active',
        createdAt: new Date().toISOString()
      },
      {
        id: 'c2',
        name: 'Product Demo & WhatsApp Campaign',
        audience: 'Founders & Operations Directors',
        channel: 'WhatsApp',
        description: 'Direct WhatsApp engagement offering personalized product walkthroughs.',
        leadIds: [],
        status: 'Paused',
        createdAt: new Date().toISOString()
      }
    ],
    tasks: [
      { id: 't1', title: 'Follow up with Acme Corp on proposal', dueDate: new Date().toISOString().split('T')[0], completed: false, priority: 'High', status: 'In Progress', leadName: 'Acme Corp', notes: 'Discuss Q3 tier pricing.' },
      { id: 't2', title: 'Prepare enterprise slide deck', dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], completed: false, priority: 'Medium', status: 'Todo', leadName: 'Apex Industries', notes: 'Include AI automation case studies.' },
    ],
    meetings: [
      { id: 'm1', title: 'Strategy Alignment Call', date: new Date().toISOString().split('T')[0], time: '10:00', leadName: 'Acme Corp', description: 'Monthly sync with executive stakeholders.', location: 'Google Meet' }
    ],
    integrations: INITIAL_INTEGRATIONS,
    activities: [],
    notifications: [],
    settings: { humanApproval: true }
  };
}

export function saveFullCRMData(data: Partial<FullCRMData>): void {
  try {
    const current = getFullCRMData();
    const updated: FullCRMData = {
      ...current,
      ...data
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving full CRM data to localStorage', e);
  }
}
