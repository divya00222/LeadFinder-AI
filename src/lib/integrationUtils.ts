import { getFullCRMData, saveFullCRMData } from './storage';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error';

export interface Integration {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  account: string | null;
  lastSync: string | null;
}

export const INITIAL_INTEGRATIONS: Integration[] = [
  { 
    id: 'whatsapp', 
    name: 'WhatsApp Business API', 
    description: 'Connect your WhatsApp business account for direct messaging.', 
    status: 'connected', 
    account: '+1 (555) 019-9281', 
    lastSync: '5 mins ago' 
  },
  { 
    id: 'facebook', 
    name: 'Facebook Messenger', 
    description: 'Sync your Facebook page messages and leads.', 
    status: 'disconnected', 
    account: null, 
    lastSync: null 
  },
  { 
    id: 'instagram', 
    name: 'Instagram Direct', 
    description: 'Connect Instagram business DMs and comments.', 
    status: 'disconnected', 
    account: null, 
    lastSync: null 
  },
  { 
    id: 'gmail', 
    name: 'Gmail / Google Workspace', 
    description: 'Sync emails, threads, and automated outbound campaigns.', 
    status: 'connected', 
    account: 'sales@acme-enterprise.com', 
    lastSync: '1 min ago' 
  },
  { 
    id: 'gcal', 
    name: 'Google Calendar', 
    description: 'Manage meetings and sync schedule events.', 
    status: 'error', 
    account: 'sales@acme-enterprise.com', 
    lastSync: '2 days ago' 
  }
];

export function getStoredIntegrations(): Integration[] {
  const data = getFullCRMData();
  return data.integrations || INITIAL_INTEGRATIONS;
}

export function saveStoredIntegrations(integrations: Integration[]): void {
  saveFullCRMData({ integrations });
}
