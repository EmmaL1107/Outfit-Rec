import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { CalendarEvent, DressCode } from '../types';
import { DRESS_CODES } from '../types';
import { eventDB } from '../store/db';
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconClose,
  IconBriefcase,
  IconShirt,
  IconRunning,
  IconSparkle,
} from '../components/Icons';

function DressCodeIcon({ code, size = 16 }: { code: string; size?: number }) {
  const color = 'currentColor';
  switch (code) {
    case '正式': return <IconBriefcase size={size} color={color} />;
    case '运动': return <IconRunning size={size} color={color} />;
    case '简约': return <IconSparkle size={size} color={color} />;
    default: return <IconShirt size={size} color={color} />;
  }
}

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showAdd, setShowAdd] = useState(false);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    dressCode: '休闲' as DressCode,
    description: '',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const allEvents = await eventDB.getAll();
    setEvents(allEvents);
  }

  function getMonthDays() {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    const startDay = start.getDay();
    const padding = Array(startDay).fill(null);
    return [...padding, ...days];
  }

  function getEventsForDate(date: string) {
    return events.filter((e) => e.date === date);
  }

  function openAddModal(date?: string) {
    setEditEvent(null);
    setForm({
      title: '',
      date: date || selectedDate,
      dressCode: '休闲',
      description: '',
    });
    setShowAdd(true);
  }

  function openEditModal(event: CalendarEvent) {
    setEditEvent(event);
    setForm({
      title: event.title,
      date: event.date,
      dressCode: event.dressCode,
      description: event.description,
    });
    setShowAdd(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;

    if (editEvent) {
      const updated: CalendarEvent = {
        ...editEvent,
        ...form,
      };
      await eventDB.put(updated);
    } else {
      const newEvent: CalendarEvent = {
        id: uuidv4(),
        ...form,
      };
      await eventDB.add(newEvent);
    }

    resetForm();
    await loadEvents();
  }

  async function handleDelete(id: string) {
    if (confirm('确定要删除这个事件吗？')) {
      await eventDB.delete(id);
      await loadEvents();
    }
  }

  function resetForm() {
    setShowAdd(false);
    setEditEvent(null);
    setForm({
      title: '',
      date: selectedDate,
      dressCode: '休闲',
      description: '',
    });
  }

  const monthDays = getMonthDays();
  const selectedDateEvents = getEventsForDate(selectedDate);
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="page calendar-page">
      <div className="page-header">
        <h1>日历 & 事件</h1>
        <button className="btn btn-primary" onClick={() => openAddModal()}>
          <IconPlus size={16} color="#fff" /> 添加事件
        </button>
      </div>

      <div className="calendar-container">
        <div className="calendar-nav">
          <button className="btn btn-ghost" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <IconChevronLeft size={18} />
          </button>
          <h3>{format(currentMonth, 'yyyy年 M月', { locale: zhCN })}</h3>
          <button className="btn btn-ghost" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <IconChevronRight size={18} />
          </button>
        </div>

        <div className="calendar-grid">
          {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
            <div key={d} className="calendar-header-cell">{d}</div>
          ))}
          {monthDays.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="calendar-cell empty" />;
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayEvents = getEventsForDate(dateStr);
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <div
                key={dateStr}
                className={`calendar-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
                onClick={() => setSelectedDate(dateStr)}
              >
                <span className="day-number">{format(day, 'd')}</span>
                {dayEvents.length > 0 && (
                  <div className="day-dots">
                    {dayEvents.slice(0, 3).map((e) => (
                      <span key={e.id} className="day-dot-indicator" title={e.title} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="selected-date-section">
        <div className="selected-date-header">
          <h3>{format(new Date(selectedDate + 'T00:00:00'), 'M月d日 EEEE', { locale: zhCN })}</h3>
          <button className="btn btn-sm" onClick={() => openAddModal(selectedDate)}>
            <IconPlus size={14} /> 添加
          </button>
        </div>

        {selectedDateEvents.length === 0 ? (
          <div className="empty-state small">当天没有事件</div>
        ) : (
          <div className="event-list">
            {selectedDateEvents.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-card-header">
                  <span className="event-icon">
                    <DressCodeIcon code={event.dressCode} size={18} />
                  </span>
                  <span className="event-card-title">{event.title}</span>
                  <span className={`dress-code-badge ${event.dressCode}`}>{event.dressCode}</span>
                </div>
                {event.description && <p className="event-card-desc">{event.description}</p>}
                <div className="event-card-actions">
                  <button className="btn btn-sm" onClick={() => openEditModal(event)}>编辑</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(event.id)}>删除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editEvent ? '编辑事件' : '添加事件'}</h2>
              <button className="btn-close" onClick={resetForm}>
                <IconClose size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>事件名称</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="例如：面试、约会、运动..."
                />
              </div>
              <div className="form-group">
                <label>日期</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>着装要求</label>
                <div className="tag-selector">
                  {DRESS_CODES.map((dc) => (
                    <button
                      key={dc}
                      className={`tag-btn ${form.dressCode === dc ? 'active' : ''}`}
                      onClick={() => setForm((f) => ({ ...f, dressCode: dc }))}
                    >
                      <DressCodeIcon code={dc} size={14} /> {dc}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>备注</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="可选，添加事件描述..."
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={resetForm}>取消</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={!form.title.trim()}>
                {editEvent ? '保存修改' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
