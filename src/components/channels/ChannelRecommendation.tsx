
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Sparkles } from 'lucide-react';

export const ChannelRecommendation: React.FC<{ type: string | null; reason: string }> = ({ type, reason }) => {
  return (
    <Card className="bg-indigo-50 border-indigo-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-indigo-900 flex items-center gap-2">
          <Sparkles size={16} /> Recommended Channel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-bold text-indigo-950 capitalize">{type || 'Manual Contact'}</p>
        <p className="text-sm text-indigo-700 mt-1">{reason}</p>
      </CardContent>
    </Card>
  );
};
