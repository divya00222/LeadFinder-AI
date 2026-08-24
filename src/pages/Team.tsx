import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { MoreHorizontal, Plus } from 'lucide-react';
import { Role } from '../lib/permissions';

const MOCK_TEAM = [
  { id: 1, name: 'Alice Admin', role: 'Admin', email: 'alice@acme.example.com', status: 'Active', lastActive: '5m ago' },
  { id: 2, name: 'Bob Sales', role: 'Sales Manager', email: 'bob@acme.example.com', status: 'Active', lastActive: '1h ago' },
  { id: 3, name: 'Charlie Agent', role: 'Sales Agent', email: 'charlie@acme.example.com', status: 'Offline', lastActive: '2d ago' },
];

export function Team() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-brand-text">Team Management</h1>
        <Button><Plus size={16} className="mr-2"/> Add Member</Button>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_TEAM.map(member => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell><Badge variant={member.status === 'Active' ? 'success' : 'neutral'}>{member.status}</Badge></TableCell>
                  <TableCell>{member.lastActive}</TableCell>
                  <TableCell><Button variant="outline" size="sm"><MoreHorizontal size={16} /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
