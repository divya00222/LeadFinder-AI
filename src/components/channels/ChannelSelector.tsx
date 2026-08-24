
import React from 'react';
import { Select } from '../ui/Select';
import { ChannelType, DEFAULT_PRIORITY } from '../../lib/channelUtils';

export const ChannelSelector: React.FC<{ 
  priority: ChannelType[]; 
  onChange: (priority: ChannelType[]) => void 
}> = ({ priority, onChange }) => {
  return (
    <Select 
      label="Channel Priority" 
      value={priority[0]} 
      onChange={(e) => {
        const newType = e.target.value as ChannelType;
        const newPriority = [newType, ...DEFAULT_PRIORITY.filter(t => t !== newType)];
        onChange(newPriority);
      }}
    >
      {DEFAULT_PRIORITY.map(type => (
        <option key={type} value={type} className="capitalize">{type}</option>
      ))}
    </Select>
  );
};
