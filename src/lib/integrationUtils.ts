
export type IntegrationStatus = 'connected' | 'disconnected' | 'permission_required' | 'error';

export interface Integration {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  account: string | null;
  lastSync: string | null;
}

export const MOCK_INTEGRATIONS: Integration[] = [
  { id: 'whatsapp', name: 'WhatsApp Business API', description: 'Connect your WhatsApp business account.', status: 'connected', account: '+1 555-0199', lastSync: '10m ago' },
  { id: 'facebook', name: 'Facebook Messenger', description: 'Sync your Facebook page messages.', status: 'disconnected', account: null, lastSync: null },
  { id: 'instagram', name: 'Instagram', description: 'Connect Instagram for direct messaging.', status: 'permission_required', account: '@acme_corp', lastSync: '2h ago' },
  { id: 'gmail', name: 'Gmail / Google Workspace', description: 'Sync emails and calendar events.', status: 'connected', account: 'sales@acme.example.com', lastSync: '1m ago' },
  { id: 'gcal', name: 'Google Calendar', description: 'Manage meetings and scheduling.', status: 'error', account: 'sales@acme.example.com', lastSync: '1d ago' },
];

export const connectIntegration = (id: string) => console.log(`Connecting ${id}...`);
export const reconnectIntegration = (id: string) => console.log(`Reconnecting ${id}...`);
export const disconnectIntegration = (id: string) => console.log(`Disconnecting ${id}...`);
export const testConnection = (id: string) => console.log(`Testing ${id}...`);
