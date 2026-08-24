export type Role = 'Admin' | 'Sales Manager' | 'Sales Agent' | 'Viewer';
export type Permission = 
  | 'view_leads' 
  | 'edit_leads' 
  | 'delete_leads' 
  | 'export_leads' 
  | 'send_messages' 
  | 'approve_messages' 
  | 'manage_campaigns' 
  | 'manage_automations' 
  | 'manage_integrations' 
  | 'manage_team' 
  | 'view_reports';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  'Admin': ['view_leads', 'edit_leads', 'delete_leads', 'export_leads', 'send_messages', 'approve_messages', 'manage_campaigns', 'manage_automations', 'manage_integrations', 'manage_team', 'view_reports'],
  'Sales Manager': ['view_leads', 'edit_leads', 'export_leads', 'send_messages', 'approve_messages', 'manage_campaigns', 'view_reports'],
  'Sales Agent': ['view_leads', 'edit_leads', 'send_messages', 'view_reports'],
  'Viewer': ['view_leads', 'view_reports']
};

export const hasPermission = (role: Role, permission: Permission) => {
  return ROLE_PERMISSIONS[role].includes(permission);
};
