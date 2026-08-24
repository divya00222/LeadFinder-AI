
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function Calendar() {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-brand-text">Calendar</h1>
        <div className="flex gap-2">
            <Button variant={view === 'month' ? 'default' : 'outline'} onClick={() => setView('month')}>Month</Button>
            <Button variant={view === 'week' ? 'default' : 'outline'} onClick={() => setView('week')}>Week</Button>
            <Button variant={view === 'day' ? 'default' : 'outline'} onClick={() => setView('day')}>Day</Button>
        </div>
      </div>

      <Card>
        <CardContent className="h-96 flex items-center justify-center text-brand-muted">
          {view.charAt(0).toUpperCase() + view.slice(1)} view placeholder
        </CardContent>
      </Card>
    </div>
  );
}
