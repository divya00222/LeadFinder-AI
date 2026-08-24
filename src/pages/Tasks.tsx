
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Drawer } from '../components/ui/Drawer';
import { Plus } from 'lucide-react';

const MOCK_TASKS = [
  { id: 1, title: 'Follow up with Jane', lead: 'Jane Doe', priority: 'High', status: 'Todo', due: '2026-08-25', notes: 'Call regarding AI bundle' },
  { id: 2, title: 'Review proposal', lead: 'Sarah Jenkins', priority: 'Urgent', status: 'In Progress', due: '2026-08-24', notes: 'Check pricing tiers' },
];

export function Tasks() {
  const [selectedTask, setSelectedTask] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-brand-text">Tasks</h1>
        <Button><Plus size={16} className="mr-2"/> Create Task</Button>
      </div>

      <div className="flex gap-4">
        <Button variant="outline">Today</Button>
        <Button variant="outline">Upcoming</Button>
        <Button variant="outline">Overdue</Button>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_TASKS.map(t => (
                <TableRow key={t.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedTask(t)}>
                  <TableCell className="font-medium">{t.title}</TableCell>
                  <TableCell>{t.lead}</TableCell>
                  <TableCell><Badge variant={t.priority === 'Urgent' ? 'danger' : 'neutral'}>{t.priority}</Badge></TableCell>
                  <TableCell><Badge variant={t.status === 'In Progress' ? 'primary' : 'neutral'}>{t.status}</Badge></TableCell>
                  <TableCell>{t.due}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Drawer isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title="Task Details">
          {selectedTask && (
              <div className="space-y-4">
                  <p><strong>Lead:</strong> {selectedTask.lead}</p>
                  <p><strong>Due:</strong> {selectedTask.due}</p>
                  <p><strong>Notes:</strong> {selectedTask.notes}</p>
              </div>
          )}
      </Drawer>
    </div>
  );
}
