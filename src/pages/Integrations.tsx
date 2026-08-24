
import { Card, CardContent } from '../components/ui/Card';
import { MOCK_INTEGRATIONS } from '../lib/integrationUtils';
import { IntegrationCard } from '../components/integrations/IntegrationCard';

export function Integrations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">Integrations</h1>
        <p className="text-brand-muted">Manage your connections to external services.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_INTEGRATIONS.map(integration => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>
    </div>
  );
}
