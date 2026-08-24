import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function AIApprovalQueue() {
  const drafts = [
    { id: 1, lead: 'Acme Corp', channel: 'Gmail', score: 85, preview: 'Hi Jane, noticed Acme...', created: '10m ago', status: 'pending_approval' },
    { id: 2, lead: 'TechStart', channel: 'WhatsApp', score: 65, preview: 'Hello Sarah, regarding...', created: '1h ago', status: 'approved' },
  ];

  return (
    <Card>
      <CardHeader><CardTitle>Approval Queue</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drafts.map(d => (
              <TableRow key={d.id}>
                <TableCell>{d.lead}</TableCell>
                <TableCell>{d.channel}</TableCell>
                <TableCell><Badge variant={d.status === 'pending_approval' ? 'warning' : 'success'}>{d.status}</Badge></TableCell>
                <TableCell><Button size="sm" variant="outline">Review</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
