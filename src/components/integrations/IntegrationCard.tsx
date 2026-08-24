
import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Integration, connectIntegration, reconnectIntegration, disconnectIntegration, testConnection } from '../../lib/integrationUtils';
import { MessageCircle, Facebook, Instagram, Mail, Calendar } from 'lucide-react';

export const IntegrationCard: React.FC<{ integration: Integration }> = ({ integration }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'whatsapp': return <MessageCircle className="text-[#25D366]" />;
      case 'facebook': return <Facebook className="text-[#1877F2]" />;
      case 'instagram': return <Instagram className="text-[#E4405F]" />;
      case 'gmail': return <Mail className="text-[#EA4335]" />;
      case 'gcal': return <Calendar className="text-[#4285F4]" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected': return <Badge variant="success">Connected</Badge>;
      case 'disconnected': return <Badge variant="neutral">Disconnected</Badge>;
      case 'permission_required': return <Badge variant="warning">Permission Required</Badge>;
      case 'error': return <Badge variant="danger">Error</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">{getIcon(integration.id)}</div>
          <div>
            <h3 className="font-bold">{integration.name}</h3>
            <p className="text-sm text-gray-500">{integration.description}</p>
          </div>
          <div className="ml-auto">{getStatusBadge(integration.status)}</div>
        </div>
        
        {integration.account && <p className="text-sm"><strong>Account:</strong> {integration.account}</p>}
        {integration.lastSync && <p className="text-sm"><strong>Last Sync:</strong> {integration.lastSync}</p>}

        <div className="flex gap-2">
          {integration.status === 'connected' ? (
            <Button variant="outline" size="sm" onClick={() => disconnectIntegration(integration.id)}>Disconnect</Button>
          ) : (
            <Button size="sm" onClick={() => connectIntegration(integration.id)}>Connect</Button>
          )}
          {integration.status !== 'connected' && <Button variant="outline" size="sm" onClick={() => reconnectIntegration(integration.id)}>Reconnect</Button>}
          <Button variant="outline" size="sm" onClick={() => testConnection(integration.id)}>Test</Button>
        </div>
      </CardContent>
    </Card>
  );
};
