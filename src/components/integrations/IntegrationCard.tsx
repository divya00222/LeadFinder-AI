import React, { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Integration } from '../../lib/integrationUtils';
import { MessageCircle, Facebook, Instagram, Mail, Calendar, CheckCircle2, AlertCircle, RefreshCw, Power } from 'lucide-react';

interface IntegrationCardProps {
  integration: Integration;
  onUpdate: (updated: Integration) => void;
  onToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({ integration, onUpdate, onToast }) => {
  const [loading, setLoading] = useState(false);

  const getIcon = (id: string) => {
    switch (id) {
      case 'whatsapp': return <MessageCircle className="text-[#25D366]" size={24} />;
      case 'facebook': return <Facebook className="text-[#1877F2]" size={24} />;
      case 'instagram': return <Instagram className="text-[#E4405F]" size={24} />;
      case 'gmail': return <Mail className="text-[#EA4335]" size={24} />;
      case 'gcal': return <Calendar className="text-[#4285F4]" size={24} />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected': 
        return <Badge className="bg-emerald-100 text-emerald-800 font-bold text-xs">Connected</Badge>;
      case 'disconnected': 
        return <Badge className="bg-gray-100 text-gray-700 font-bold text-xs">Disconnected</Badge>;
      case 'error': 
        return <Badge className="bg-red-100 text-red-800 font-bold text-xs">Error</Badge>;
      default: 
        return <Badge className="bg-gray-100 text-gray-700 font-bold text-xs">{status}</Badge>;
    }
  };

  const handleConnect = () => {
    setLoading(true);
    setTimeout(() => {
      const mockAccount = integration.id === 'whatsapp' ? '+1 (555) 019-9281' :
                          integration.id === 'facebook' ? 'Acme Page Official' :
                          integration.id === 'instagram' ? '@acme_enterprise' :
                          'sales@acme-enterprise.com';
      const updated: Integration = {
        ...integration,
        status: 'connected',
        account: mockAccount,
        lastSync: 'Just now'
      };
      onUpdate(updated);
      onToast(`Successfully connected to ${integration.name} (Mock Simulated API)`, 'success');
      setLoading(false);
    }, 600);
  };

  const handleDisconnect = () => {
    setLoading(true);
    setTimeout(() => {
      const updated: Integration = {
        ...integration,
        status: 'disconnected',
        account: null,
        lastSync: null
      };
      onUpdate(updated);
      onToast(`Disconnected from ${integration.name}`, 'info');
      setLoading(false);
    }, 400);
  };

  const handleReconnect = () => {
    setLoading(true);
    setTimeout(() => {
      const mockAccount = integration.account || 'sales@acme-enterprise.com';
      const updated: Integration = {
        ...integration,
        status: 'connected',
        account: mockAccount,
        lastSync: 'Just reconnected'
      };
      onUpdate(updated);
      onToast(`Successfully reconnected to ${integration.name} (Mock API)`, 'success');
      setLoading(false);
    }, 600);
  };

  const handleTestConnection = () => {
    setLoading(true);
    setTimeout(() => {
      if (integration.status === 'connected') {
        onToast(`Test Ping to ${integration.name}: OK (200 OK - Mock latency 42ms)`, 'success');
      } else if (integration.status === 'error') {
        onToast(`Test Ping to ${integration.name}: Failed (Mock authentication token expired)`, 'error');
      } else {
        onToast(`Test Ping to ${integration.name}: Not connected. Please connect first.`, 'warning');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl">{getIcon(integration.id)}</div>
            <div>
              <h3 className="font-bold text-brand-text text-base">{integration.name}</h3>
              <p className="text-xs text-brand-muted mt-0.5">{integration.description}</p>
            </div>
          </div>
          <div className="shrink-0">{getStatusBadge(integration.status)}</div>
        </div>

        <div className="text-xs space-y-1 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
          <div className="flex justify-between">
            <span className="text-brand-muted font-medium">Account:</span>
            <span className="font-semibold text-brand-text">{integration.account || 'None'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-muted font-medium">Last Sync:</span>
            <span className="font-semibold text-brand-text">{integration.lastSync || 'Never'}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-gray-200/60 text-[10px] text-gray-400 italic">
            <span>Mode: Mock Simulated Integration</span>
            <span>Local Persistent</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {integration.status === 'connected' ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDisconnect} 
              disabled={loading}
              className="gap-1.5 text-red-600 hover:bg-red-50 border-red-200"
            >
              <Power size={14} /> Disconnect
            </Button>
          ) : (
            <Button 
              size="sm" 
              onClick={handleConnect} 
              disabled={loading}
              className="gap-1.5"
            >
              <CheckCircle2 size={14} /> Connect
            </Button>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReconnect} 
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Reconnect
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleTestConnection} 
            disabled={loading}
            className="gap-1.5 ml-auto"
          >
            Test Connection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
