import React, { useState } from 'react';
import { useCRM } from '../store/crmStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Toast, useToast } from '../components/ui/Toast';
import { Plus, Edit3, Trash2, CheckCircle2, Circle, Calendar as CalendarIcon, CheckSquare } from 'lucide-react';
import { TaskItem } from '../store/crmTypes';

export function Tasks() {
  const { tasks, leads, addGlobalTask, updateGlobalTask, toggleGlobalTaskComplete, deleteGlobalTask } = useCRM();
  const { toasts, toast, removeToast } = useToast();

  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue'>('today');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [status, setStatus] = useState<'Todo' | 'In Progress' | 'Completed'>('Todo');
  const [leadName, setLeadName] = useState('');
  const [notes, setNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = tasks.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'today') return t.dueDate === todayStr;
    if (filter === 'upcoming') return t.dueDate > todayStr;
    if (filter === 'overdue') return t.dueDate < todayStr && !t.completed;
    return true;
  });

  const handleOpenCreate = () => {
    setEditingTask(null);
    setTitle('');
    setDueDate(todayStr);
    setPriority('Medium');
    setStatus('Todo');
    setLeadName(leads[0]?.companyName || '');
    setNotes('');
    setModalOpen(true);
  };

  const handleOpenEdit = (task: TaskItem) => {
    setEditingTask(task);
    setTitle(task.title);
    setDueDate(task.dueDate || todayStr);
    setPriority(task.priority || 'Medium');
    setStatus(task.status || (task.completed ? 'Completed' : 'Todo'));
    setLeadName(task.leadName || leads[0]?.companyName || '');
    setNotes(task.notes || '');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast('Task title is required', 'error');
      return;
    }

    if (editingTask) {
      updateGlobalTask(editingTask.id, {
        title,
        dueDate,
        priority,
        status,
        leadName,
        notes,
        completed: status === 'Completed'
      });
      toast('Task updated successfully', 'success');
    } else {
      addGlobalTask({
        title,
        dueDate,
        priority,
        status,
        leadName,
        notes
      });
      toast('Task created successfully', 'success');
    }

    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteGlobalTask(id);
    toast('Task deleted', 'warning');
  };

  const handleToggle = (id: string) => {
    toggleGlobalTaskComplete(id);
    toast('Task status updated', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Tasks</h1>
          <p className="text-sm text-brand-muted mt-1">Manage outbound follow-ups, priorities, and daily schedules.</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus size={16} /> Create Task
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <Button 
          variant={filter === 'all' ? 'primary' : 'outline'} 
          onClick={() => setFilter('all')}
          size="sm"
        >
          All ({tasks.length})
        </Button>
        <Button 
          variant={filter === 'today' ? 'primary' : 'outline'} 
          onClick={() => setFilter('today')}
          size="sm"
        >
          Today ({tasks.filter(t => t.dueDate === todayStr).length})
        </Button>
        <Button 
          variant={filter === 'upcoming' ? 'primary' : 'outline'} 
          onClick={() => setFilter('upcoming')}
          size="sm"
        >
          Upcoming ({tasks.filter(t => t.dueDate > todayStr).length})
        </Button>
        <Button 
          variant={filter === 'overdue' ? 'primary' : 'outline'} 
          onClick={() => setFilter('overdue')}
          size="sm"
        >
          Overdue ({tasks.filter(t => t.dueDate < todayStr && !t.completed).length})
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="capitalize">{filter} Tasks</span>
            <span className="text-xs font-semibold text-brand-muted">{filteredTasks.length} items</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Done</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Lead / Company</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-brand-muted">
                    <CheckSquare size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="font-medium text-sm">No tasks found for this filter.</p>
                    <p className="text-xs text-gray-400 mt-0.5">Click "Create Task" to add a new task.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map(t => {
                  const isOverdue = t.dueDate < todayStr && !t.completed;
                  return (
                    <TableRow key={t.id} className={t.completed ? 'opacity-60 bg-gray-50/50' : ''}>
                      <TableCell>
                        <button 
                          onClick={() => handleToggle(t.id)}
                          className="text-brand-primary hover:text-indigo-700 transition-colors"
                        >
                          {t.completed ? <CheckCircle2 size={20} className="text-emerald-600 fill-emerald-50" /> : <Circle size={20} className="text-gray-300" />}
                        </button>
                      </TableCell>
                      <TableCell className={`font-semibold text-brand-text ${t.completed ? 'line-through text-gray-400' : ''}`}>
                        {t.title}
                        {t.notes && <span className="block text-xs font-normal text-brand-muted truncate max-w-xs">{t.notes}</span>}
                      </TableCell>
                      <TableCell className="text-xs text-brand-muted font-medium">
                        {t.leadName || 'General Task'}
                      </TableCell>
                      <TableCell>
                        <Badge className={`uppercase text-[10px] font-bold ${
                          t.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                          t.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          {t.priority || 'Medium'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`uppercase text-[10px] font-bold ${
                          t.completed || t.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                          t.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {t.completed ? 'Completed' : (t.status || 'Todo')}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-xs font-semibold ${isOverdue ? 'text-red-600' : 'text-brand-muted'}`}>
                        {t.dueDate} {isOverdue && '(Overdue)'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button size="sm" variant="outline" onClick={() => handleOpenEdit(t)} title="Edit Task">
                            <Edit3 size={14} />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(t.id)} title="Delete" className="text-red-600 hover:bg-red-50">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create / Edit Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">Task Title *</label>
            <input 
              type="text" 
              required
              value={title} 
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Follow up on proposal"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Due Date</label>
              <input 
                type="date" 
                value={dueDate} 
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Associated Lead / Company</label>
              <select
                value={leadName}
                onChange={e => setLeadName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              >
                <option value="">General / None</option>
                {leads.map(l => (
                  <option key={l.id} value={l.companyName}>{l.companyName}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">Notes / Description</label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add details..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingTask ? 'Save Changes' : 'Create Task'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
