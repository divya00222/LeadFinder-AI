import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Settings, Play, Trash2, Copy } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

const BLOCKS = ['Trigger', 'AI Action', 'Approval', 'Wait', 'Condition', 'Notification', 'Pipeline Action', 'Send Approved Message', 'Stop'];

export function AutomationBuilder() {
  const [workflow, setWorkflow] = useState([
    { id: '1', type: 'Trigger', label: 'New Lead' },
    { id: '2', type: 'AI Action', label: 'AI Research' },
    { id: '3', type: 'AI Action', label: 'Generate Message' },
    { id: '4', type: 'Approval', label: 'Request Human Approval' },
    { id: '5', type: 'Send Approved Message', label: 'Send Approved Message' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Automation Builder</h1>
          <p className="text-brand-muted">Design and manage your lead workflows.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Play size={16} className="mr-2"/> Test</Button>
          <Button>Save Workflow</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <Card className="col-span-1">
          <CardHeader><CardTitle>Available Blocks</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {BLOCKS.map(block => (
              <Button key={block} variant="outline" className="w-full justify-start">
                <Plus size={16} className="mr-2"/> {block}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Workflow: Lead Outreach</CardTitle>
            <div className="flex gap-2">
                <Button variant="outline" size="sm"><Copy size={16}/></Button>
                <Button variant="outline" size="sm" className="text-red-600"><Trash2 size={16}/></Button>
                <Button variant="outline" size="sm"><Settings size={16}/></Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {workflow.map((block, index) => (
              <div key={block.id} className="p-4 border rounded-lg bg-gray-50 flex items-center justify-between">
                <span className="font-medium">{index + 1}. {block.label}</span>
                {block.type === 'Send Approved Message' && (
                    <Badge variant="warning">Verifies approval_status</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
