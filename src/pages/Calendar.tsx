import React, { useState } from 'react';
import { useCRM } from '../store/crmStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Toast, useToast } from '../components/ui/Toast';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Users, CheckSquare, Edit3, Trash2 } from 'lucide-react';
import { Meeting, TaskItem } from '../store/crmTypes';

export function Calendar() {
  const { meetings, tasks, leads, addMeeting, updateMeeting, deleteMeeting } = useCRM();
  const { toasts, toast, removeToast } = useToast();

  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<{ type: 'meeting' | 'task'; data: Meeting | TaskItem } | null>(null);

  // Form states for meeting
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [leadName, setLeadName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Google Meet');

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else if (view === 'week') newDate.setDate(newDate.getDate() - 7);
    else newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else if (view === 'week') newDate.setDate(newDate.getDate() + 7);
    else newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleOpenCreate = () => {
    setEditingMeeting(null);
    setTitle('');
    setDate(currentDate.toISOString().split('T')[0]);
    setTime('10:00');
    setLeadName(leads[0]?.companyName || '');
    setDescription('');
    setLocation('Google Meet');
    setModalOpen(true);
  };

  const handleOpenEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setTitle(meeting.title);
    setDate(meeting.date);
    setTime(meeting.time || '10:00');
    setLeadName(meeting.leadName || '');
    setDescription(meeting.description || '');
    setLocation(meeting.location || 'Google Meet');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast('Meeting title is required', 'error');
      return;
    }

    if (editingMeeting) {
      updateMeeting(editingMeeting.id, {
        title,
        date,
        time,
        leadName,
        description,
        location
      });
      toast('Meeting updated successfully', 'success');
    } else {
      addMeeting({
        title,
        date,
        time,
        leadName,
        description,
        location
      });
      toast('Meeting scheduled successfully', 'success');
    }

    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteMeeting(id);
    setSelectedEvent(null);
    toast('Meeting cancelled', 'warning');
  };

  // Month calculation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Helper to get items for a specific date YYYY-MM-DD
  const getItemsForDate = (dateStr: string) => {
    const dayMeetings = meetings.filter(m => m.date === dateStr);
    const dayTasks = tasks.filter(t => t.dueDate === dateStr);
    return { meetings: dayMeetings, tasks: dayTasks };
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
          <h1 className="text-2xl font-bold text-brand-text">Calendar & Meetings</h1>
          <p className="text-sm text-brand-muted mt-1">Schedule meetings, track due tasks, and manage calendar views.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <Button variant={view === 'month' ? 'default' : 'ghost'} size="sm" onClick={() => setView('month')}>Month</Button>
            <Button variant={view === 'week' ? 'default' : 'ghost'} size="sm" onClick={() => setView('week')}>Week</Button>
            <Button variant={view === 'day' ? 'default' : 'ghost'} size="sm" onClick={() => setView('day')}>Day</Button>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus size={16} /> Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Navigation bar */}
      <Card>
        <CardContent className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleToday}>Today</Button>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={handlePrev}><ChevronLeft size={16} /></Button>
              <Button variant="outline" size="sm" onClick={handleNext}><ChevronRight size={16} /></Button>
            </div>
          </div>
          <h2 className="text-lg font-bold text-brand-text">
            {view === 'month' ? monthName : `Week / Day view around ${currentDate.toLocaleDateString()}`}
          </h2>
          <div className="text-xs text-brand-muted font-medium">
            {meetings.length} meetings • {tasks.length} tasks
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid View: Month */}
      {view === 'month' && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-brand-muted uppercase tracking-wider">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} className="h-28 bg-gray-50/40 rounded-xl border border-dashed border-gray-100" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const dayNum = index + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const { meetings: dayMeetings, tasks: dayTasks } = getItemsForDate(dateStr);
                const isToday = dateStr === new Date().toISOString().split('T')[0];

                return (
                  <div 
                    key={dateStr} 
                    className={`h-28 border rounded-xl p-1.5 overflow-y-auto flex flex-col justify-between transition-colors ${
                      isToday ? 'border-brand-primary bg-indigo-50/20 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isToday ? 'bg-brand-primary text-white w-5 h-5 rounded-full flex items-center justify-center' : 'text-brand-text'}`}>
                        {dayNum}
                      </span>
                    </div>

                    <div className="space-y-1 flex-1 mt-1 overflow-y-auto">
                      {dayMeetings.map(m => (
                        <div 
                          key={m.id}
                          onClick={() => setSelectedEvent({ type: 'meeting', data: m })}
                          className="bg-indigo-100 text-indigo-800 text-[10px] font-semibold p-1 rounded cursor-pointer truncate hover:bg-indigo-200 flex items-center gap-1"
                          title={`${m.time} - ${m.title}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0"></span>
                          <span className="truncate">{m.time} {m.title}</span>
                        </div>
                      ))}
                      {dayTasks.map(t => (
                        <div 
                          key={t.id}
                          onClick={() => setSelectedEvent({ type: 'task', data: t })}
                          className={`text-[10px] font-medium p-1 rounded cursor-pointer truncate flex items-center gap-1 ${
                            t.completed ? 'bg-gray-100 text-gray-500 line-through' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                          }`}
                          title={`Task Due: ${t.title}`}
                        >
                          <CheckSquare size={10} className="shrink-0 text-amber-600" />
                          <span className="truncate">{t.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week View */}
      {view === 'week' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Week Schedule</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() - d.getDay() + i);
              const dateStr = d.toISOString().split('T')[0];
              const { meetings: dayMeetings, tasks: dayTasks } = getItemsForDate(dateStr);

              return (
                <div key={dateStr} className="p-3 border border-gray-200 rounded-xl bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="w-36 shrink-0">
                    <p className="text-xs font-bold text-brand-muted uppercase">{d.toLocaleDateString('default', { weekday: 'short' })}</p>
                    <p className="text-sm font-bold text-brand-text">{d.toLocaleDateString()}</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {dayMeetings.length === 0 && dayTasks.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No scheduled meetings or tasks.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {dayMeetings.map(m => (
                          <div 
                            key={m.id}
                            onClick={() => setSelectedEvent({ type: 'meeting', data: m })}
                            className="bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs px-3 py-1.5 rounded-lg cursor-pointer hover:bg-indigo-100 font-semibold flex items-center gap-2"
                          >
                            <Clock size={12} className="text-indigo-600" />
                            <span>{m.time} - {m.title} ({m.leadName || 'Meeting'})</span>
                          </div>
                        ))}
                        {dayTasks.map(t => (
                          <div 
                            key={t.id}
                            onClick={() => setSelectedEvent({ type: 'task', data: t })}
                            className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-3 py-1.5 rounded-lg cursor-pointer hover:bg-amber-100 font-medium flex items-center gap-2"
                          >
                            <CheckSquare size={12} className="text-amber-600" />
                            <span>Task Due: {t.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Day View */}
      {view === 'day' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Schedule for {currentDate.toLocaleDateString()}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const dateStr = currentDate.toISOString().split('T')[0];
              const { meetings: dayMeetings, tasks: dayTasks } = getItemsForDate(dateStr);

              if (dayMeetings.length === 0 && dayTasks.length === 0) {
                return (
                  <div className="text-center py-12 text-brand-muted">
                    <CalendarIcon size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="font-medium text-sm">No meetings or tasks scheduled for today.</p>
                    <Button onClick={handleOpenCreate} size="sm" className="mt-3">Schedule Meeting</Button>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {dayMeetings.map(m => (
                    <div key={m.id} className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="primary">{m.time}</Badge>
                          <h4 className="font-bold text-brand-text text-sm">{m.title}</h4>
                        </div>
                        <p className="text-xs text-brand-muted mt-1">{m.description || 'No description'} • {m.leadName} • {m.location}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleOpenEdit(m)}>Edit</Button>
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDelete(m.id)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                  {dayTasks.map(t => (
                    <div key={t.id} className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-amber-100 text-amber-800">Task Due</Badge>
                          <h4 className="font-bold text-brand-text text-sm">{t.title}</h4>
                        </div>
                        <p className="text-xs text-brand-muted mt-1">{t.notes || 'No notes'} • {t.leadName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Create / Edit Meeting Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingMeeting ? 'Edit Meeting' : 'Schedule New Meeting'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">Meeting Title *</label>
            <input 
              type="text" 
              required
              value={title} 
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Q3 Strategy Review"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Time</label>
              <input 
                type="time" 
                value={time} 
                onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Lead / Company</label>
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
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Location / Link</label>
              <input 
                type="text" 
                value={location} 
                onChange={e => setLocation(e.target.value)}
                placeholder="Google Meet / Zoom / Office"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Meeting agenda..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingMeeting ? 'Save Changes' : 'Schedule Meeting'}</Button>
          </div>
        </form>
      </Modal>

      {/* Event Details Modal */}
      <Modal 
        isOpen={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
        title={selectedEvent?.type === 'meeting' ? 'Meeting Details' : 'Task Details'}
        maxWidth="md"
      >
        {selectedEvent && (
          <div className="space-y-4">
            {selectedEvent.type === 'meeting' ? (
              <>
                <div>
                  <span className="text-xs font-semibold text-brand-muted uppercase">Meeting Title</span>
                  <h3 className="text-base font-bold text-brand-text">{(selectedEvent.data as Meeting).title}</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-3 rounded-xl">
                  <div>
                    <span className="text-brand-muted font-medium">Date & Time:</span>
                    <p className="font-bold text-brand-text">{(selectedEvent.data as Meeting).date} at {(selectedEvent.data as Meeting).time}</p>
                  </div>
                  <div>
                    <span className="text-brand-muted font-medium">Location:</span>
                    <p className="font-bold text-brand-text">{(selectedEvent.data as Meeting).location || 'Online'}</p>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-brand-muted uppercase">Lead / Company</span>
                  <p className="text-sm font-semibold text-brand-text">{(selectedEvent.data as Meeting).leadName || 'General Meeting'}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-brand-muted uppercase">Description</span>
                  <p className="text-sm text-brand-text bg-white p-3 border border-gray-200 rounded-xl">
                    {(selectedEvent.data as Meeting).description || 'No description provided.'}
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => {
                    const m = selectedEvent.data as Meeting;
                    setSelectedEvent(null);
                    handleOpenEdit(m);
                  }}>Edit</Button>
                  <Button variant="outline" className="text-red-600" onClick={() => handleDelete((selectedEvent.data as Meeting).id)}>Delete</Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-xs font-semibold text-brand-muted uppercase">Task Title</span>
                  <h3 className="text-base font-bold text-brand-text">{(selectedEvent.data as TaskItem).title}</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-3 rounded-xl">
                  <div>
                    <span className="text-brand-muted font-medium">Due Date:</span>
                    <p className="font-bold text-brand-text">{(selectedEvent.data as TaskItem).dueDate}</p>
                  </div>
                  <div>
                    <span className="text-brand-muted font-medium">Priority:</span>
                    <p className="font-bold text-brand-text uppercase">{(selectedEvent.data as TaskItem).priority || 'Medium'}</p>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-brand-muted uppercase">Notes</span>
                  <p className="text-sm text-brand-text bg-white p-3 border border-gray-200 rounded-xl">
                    {(selectedEvent.data as TaskItem).notes || 'No notes provided.'}
                  </p>
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={() => setSelectedEvent(null)}>Close</Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
