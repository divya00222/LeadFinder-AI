import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Plus, MoreHorizontal } from 'lucide-react';
import { CreateCampaignModal } from '../components/campaigns/CreateCampaignModal';

const MOCK_CAMPAIGNS = [
  { id: 1, name: 'Tech Outreach Q3', channel: 'Email', leads: 150, sent: 140, opened: 90, replied: 20, positive: 5, status: 'Active' },
  { id: 2, name: 'Product Demo', channel: 'WhatsApp', leads: 50, sent: 50, opened: 45, replied: 10, positive: 2, status: 'Paused' },
];

export function Campaigns() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-brand-text">Campaigns</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} className="mr-2" /> Create Campaign
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Active Campaigns</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Opened</TableHead>
                <TableHead>Replied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_CAMPAIGNS.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.channel}</TableCell>
                  <TableCell>{c.leads}</TableCell>
                  <TableCell>{c.sent}</TableCell>
                  <TableCell>{c.opened}</TableCell>
                  <TableCell>{c.replied}</TableCell>
                  <TableCell><Badge variant={c.status === 'Active' ? 'success' : 'neutral'}>{c.status}</Badge></TableCell>
                  <TableCell><Button variant="outline" size="sm"><MoreHorizontal size={16} /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <CreateCampaignModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
