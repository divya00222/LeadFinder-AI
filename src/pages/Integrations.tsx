import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { getStoredIntegrations, saveStoredIntegrations, Integration } from '../lib/integrationUtils';
import { IntegrationCard } from '../components/integrations/IntegrationCard';
import { Toast, useToast } from '../components/ui/Toast';
import { ShieldCheck, Info } from 'lucide-react';

export function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const { toasts, toast, removeToast } = useToast();

  useEffect(() => {
    const loaded = getStoredIntegrations();
    setIntegrations(loaded);
  }, []);

  const handleUpdate = (updated: Integration) => {
    const next = integrations.map(item => item.id === updated.id ? updated : item);
    setIntegrations(next);
    saveStoredIntegrations(next);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Integrations & Channels</h1>
          <p className="text-sm text-brand-muted mt-1">Manage mock connections for WhatsApp, Facebook, Instagram, and Gmail outbound channels.</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs px-3 py-2 rounded-xl flex items-center gap-2">
          <ShieldCheck size={16} className="text-indigo-600 shrink-0" />
          <span>Simulated Integration Environment (Mock state persists locally across refreshes)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map(integration => (
          <IntegrationCard 
            key={integration.id} 
            integration={integration} 
            onUpdate={handleUpdate}
            onToast={toast}
          />
        ))}
      </div>
    </div>
  );
}
