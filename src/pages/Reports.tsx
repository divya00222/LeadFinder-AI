import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, Cell } from 'recharts';
import { Button } from '../components/ui/Button';
import { Download } from 'lucide-react';

const DATA_LEADS = [
  { name: 'Jan', leads: 400 }, { name: 'Feb', leads: 300 }, { name: 'Mar', leads: 600 },
  { name: 'Apr', leads: 800 }, { name: 'May', leads: 500 }, { name: 'Jun', leads: 900 },
];

const DATA_FUNNEL = [
  { name: 'Leads', value: 1000 }, { name: 'Contacted', value: 800 },
  { name: 'Qualified', value: 500 }, { name: 'Meeting', value: 300 },
  { name: 'Won', value: 100 },
];

export function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-brand-text">Reports</h1>
        <Button variant="outline"><Download size={16} className="mr-2"/> Export</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[ { title: 'Total Leads', val: '2,400' }, { title: 'Open Rate', val: '65%' }, { title: 'Reply Rate', val: '22%' }, { title: 'Conversion', val: '8%' } ].map(stat => (
          <Card key={stat.title}>
            <CardContent className="p-4"><p className="text-sm text-gray-500">{stat.title}</p><p className="text-2xl font-bold">{stat.val}</p></CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Leads Over Time</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DATA_LEADS}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Line type="monotone" dataKey="leads" stroke="#8884d8" /></LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Conversion Funnel</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DATA_FUNNEL}><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="value" fill="#82ca9d" /></BarChart>
              </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
