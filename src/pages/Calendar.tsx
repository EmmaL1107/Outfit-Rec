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

function DressCodeIcon({ code, size = 14 }: { code: string; size?: number }) {
  switch (code) {
    case '正式': return <IconBriefcase size={size} />;
    case '运动': return <IconRunning size={size} />;
    case '简约': return <IconSparkle size={size} />;
    default: return <IconShirt size={size} />;
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
    <div className="min-h-screen bg-white pb-24">
      {/* HEADER */}
      <section className="max-w-lg mx-auto px-5 pt-10 pb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-[11px] tracking-[0.3em] text-gray-500 mb-1.5">MY</p>
            <h1 className="text-[28px] font-bold text-black tracking-tight">CALENDAR</h1>
          </div>
          <button
            className="w-9 h-9 bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
            onClick={() => openAddModal()}
          >
            <IconPlus size={16} />
          </button>
        </div>
        <p className="text-[13px] text-gray-500 mt-1">日程与着装安排</p>
      </section>

      {/* CALENDAR */}
      <section className="max-w-lg mx-auto px-5">
        <div className="border border-[var(--color-border)] rounded-lg p-5">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-5">
            <button
              className="p-1.5 text-gray-400 hover:text-black transition-colors"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <IconChevronLeft size={18} />
            </button>
            <h2 className="text-[15px] font-semibold text-black">
              {format(currentMonth, 'yyyy年 M月', { locale: zhCN })}
            </h2>
            <button
              className="p-1.5 text-gray-400 hover:text-black transition-colors"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <IconChevronRight size={18} />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
              <div key={d} className="text-center text-[11px] font-medium text-gray-400 py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} className="aspect-square" />;
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayEvents = getEventsForDate(dateStr);
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDate;
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <button
                  key={dateStr}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg transition-all ${
                    isSelected
                      ? 'bg-black text-white'
                      : isToday
                        ? 'text-black font-semibold border border-black'
                        : isCurrentMonth
                          ? 'text-gray-700 hover:bg-gray-50'
                          : 'text-gray-300'
                  }`}
                  onClick={() => setSelectedDate(dateStr)}
                >
                  <span className="text-[13px]">{format(day, 'd')}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map((e) => (
                        <span
                          key={e.id}
                          className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/70' : 'bg-gray-400'}`}
                          title={e.title}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Events */}
        <div className="mt-4 border border-[var(--color-border)] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold text-black">
              {format(new Date(selectedDate + 'T00:00:00'), 'M月d日 EEEE', { locale: zhCN })}
            </h3>
            <button
              className="px-3 py-1.5 text-[12px] text-gray-500 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => openAddModal(selectedDate)}
            >
              <IconPlus size={13} /> 添加
            </button>
          </div>

          {selectedDateEvents.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[12px] text-gray-400">当天没有事件</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {selectedDateEvents.map((event) => (
                <div key={event.id} className="p-3.5 bg-gray-50 rounded-lg border border-[var(--color-border)]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-500">
                      <DressCodeIcon code={event.dressCode} />
                    </span>
                    <span className="text-[13px] font-semibold text-black">{event.title}</span>
                    <span className="ml-auto px-2 py-0.5 text-[10px] bg-gray-200 text-gray-600 rounded-full">
                      {event.dressCode}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-[12px] text-gray-500 mb-2">{event.description}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      className="px-2.5 py-1 text-[11px] text-gray-500 hover:text-black hover:bg-white rounded-lg transition-colors border border-[var(--color-border)]"
                      onClick={() => openEditModal(event)}
                    >
                      编辑
                    </button>
                    <button
                      className="px-2.5 py-1 text-[11px] text-gray-500 hover:text-black hover:bg-white rounded-lg transition-colors border border-[var(--color-border)]"
                      onClick={() => handleDelete(event.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ADD MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-2xl max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white border-b border-[var(--color-border)] px-5 py-4 flex items-center justify-between z-10">
              <h2 className="text-base font-semibold text-black">{editEvent ? '编辑事件' : '添加事件'}</h2>
              <button className="p-1 text-gray-400 hover:text-black" onClick={resetForm}>
                <IconClose size={18} />
              </button>
            </div>
            <div className="px-5 py-5 space-y-5">
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-2">事件名称</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="例如：面试、约会、运动..."
                  className="w-full px-3 py-2.5 bg-gray-50 border border-[var(--color-border)] rounded-lg text-[13px] text-black focus:outline-none focus:border-black focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-2">日期</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-[var(--color-border)] rounded-lg text-[13px] text-black focus:outline-none focus:border-black focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-2">着装要求</label>
                <div className="flex flex-wrap gap-2">
                  {DRESS_CODES.map((dc) => (
                    <button
                      key={dc}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-lg transition-colors ${
                        form.dressCode === dc
                          ? 'bg-black text-white'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-[var(--color-border)]'
                      }`}
                      onClick={() => setForm((f) => ({ ...f, dressCode: dc }))}
                    >
                      <DressCodeIcon code={dc} size={12} /> {dc}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-2">备注</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="可选，添加事件描述..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-[var(--color-border)] rounded-lg text-[13px] text-black focus:outline-none focus:border-black focus:bg-white resize-none"
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-[var(--color-border)] px-5 py-4 flex gap-2">
              <button
                className="flex-1 px-4 py-2.5 text-gray-600 text-[13px] rounded-lg hover:bg-gray-50 transition-colors border border-[var(--color-border)]"
                onClick={resetForm}
              >
                取消
              </button>
              <button
                className="flex-1 px-4 py-2.5 bg-black text-white text-[13px] rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                onClick={handleSave}
                disabled={!form.title.trim()}
              >
                {editEvent ? '保存修改' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
