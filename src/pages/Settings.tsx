import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function Settings() {
  const [humanApproval, setHumanApproval] = useState(true);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-text">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>AI Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-amber-50">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-amber-900">Human Approval Required</label>
              <Button 
                onClick={() => setHumanApproval(!humanApproval)}
                variant={humanApproval ? 'default' : 'outline'}
              >
                {humanApproval ? 'ON' : 'OFF'}
              </Button>
            </div>
            {humanApproval && (
              <p className="text-sm text-amber-800 mt-2 font-medium">
                ⚠️ Messages cannot be sent automatically while Human Approval is enabled.
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">AI Features</label>
            {['AI Lead Scoring', 'AI Company Research', 'AI Message Generation', 'AI Reply Detection', 'AI Channel Recommendation'].map(feature => (
              <div key={feature} className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {['Profile', 'Workspace', 'Notifications', 'Messaging', 'Channels', 'Security', 'Billing'].map(section => (
          <Card key={section}>
              <CardHeader><CardTitle>{section}</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-gray-500">{section} settings placeholder.</p></CardContent>
          </Card>
      ))}
    </div>
  );
}
