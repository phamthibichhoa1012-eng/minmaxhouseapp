
import React from 'react';
import { User, Project } from '../types';
import { TASKS } from '../mockData';

interface CalendarViewProps {
  user: User;
  projects: Project[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ user, projects }) => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const currentMonth = "Tháng 3, 2024";

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch làm việc</h1>
          <p className="text-gray-500">Theo dõi thời hạn và các sự kiện quan trọng</p>
        </div>
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          <button className="px-4 py-2 bg-amber-600 text-white text-sm font-bold rounded-lg shadow-md">Tháng</button>
          <button className="px-4 py-2 text-gray-500 text-sm font-bold rounded-lg">Tuần</button>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-gray-800">{currentMonth}</h2>
          <div className="flex space-x-2">
            <button className="p-2 hover:bg-gray-200 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg></button>
            <button className="p-2 hover:bg-gray-200 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg></button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 border-b border-gray-100 bg-slate-50">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
            <div key={d} className="py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map(day => {
            const dateStr = `2024-03-${day.toString().padStart(2, '0')}`;
            const dayTasks = TASKS.filter(t => t.deadline === dateStr);
            
            return (
              <div key={day} className={`min-h-[120px] p-2 border-b border-r border-gray-100 hover:bg-gray-50 transition-colors group ${day > 31 ? 'bg-gray-50/50' : ''}`}>
                <span className="text-sm font-bold text-gray-400 group-hover:text-amber-600">{day}</span>
                <div className="mt-2 space-y-1">
                  {dayTasks.map(task => (
                    <div key={task.id} className="p-1 rounded bg-amber-100 border-l-2 border-amber-500 overflow-hidden cursor-pointer hover:bg-amber-200 transition-colors">
                      <p className="text-[10px] font-bold text-amber-900 truncate">{task.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
