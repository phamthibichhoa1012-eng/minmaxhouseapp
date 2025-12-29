
import React, { useState, useEffect } from 'react';
import { User, UserRole, WorkRegistration, WorkSession } from '../types';

interface WorkScheduleProps {
  user: User;
  users: User[];
  registrations: WorkRegistration[];
  onUpdateRegistrations: (regs: WorkRegistration[]) => void;
}

const WorkSchedule: React.FC<WorkScheduleProps> = ({ user, users, registrations, onUpdateRegistrations }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Thứ 2
    return new Date(d.setDate(diff));
  });

  const [localRegs, setLocalRegs] = useState<WorkRegistration[]>(registrations);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalRegs(registrations);
  }, [registrations]);

  const isSuperAdmin = user.id === 'u1' || user.role === UserRole.OWNER;

  const daysOfWeek = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(currentWeekStart.getDate() + i);
    return d;
  });

  const getWeekRangeLabel = () => {
    const end = new Date(currentWeekStart);
    end.setDate(currentWeekStart.getDate() + 5);
    return `${currentWeekStart.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })} - ${end.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })}`;
  };

  const navigateWeek = (weeks: number) => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + weeks * 7);
    setCurrentWeekStart(newStart);
  };

  const toggleRegistration = (dateStr: string, sessionType: 'MORNING' | 'AFTERNOON', targetMemberId: string) => {
    // Chỉ cho phép sửa lịch của bản thân hoặc Admin/Owner sửa của tất cả
    if (!isSuperAdmin && targetMemberId !== user.id) return;

    const existing = localRegs.find(r => r.date === dateStr && r.userId === targetMemberId);
    let nextSession: WorkSession;

    if (!existing) {
      nextSession = sessionType === 'MORNING' ? WorkSession.MORNING : WorkSession.AFTERNOON;
    } else {
      const current = existing.session;
      if (sessionType === 'MORNING') {
        if (current === WorkSession.MORNING) nextSession = WorkSession.OFF;
        else if (current === WorkSession.AFTERNOON) nextSession = WorkSession.FULL_DAY;
        else if (current === WorkSession.FULL_DAY) nextSession = WorkSession.AFTERNOON;
        else nextSession = WorkSession.MORNING;
      } else {
        if (current === WorkSession.AFTERNOON) nextSession = WorkSession.OFF;
        else if (current === WorkSession.MORNING) nextSession = WorkSession.FULL_DAY;
        else if (current === WorkSession.FULL_DAY) nextSession = WorkSession.MORNING;
        else nextSession = WorkSession.AFTERNOON;
      }
    }

    let newRegs: WorkRegistration[];
    if (!existing) {
      newRegs = [...localRegs, { id: `wr-${Date.now()}`, userId: targetMemberId, date: dateStr, session: nextSession }];
    } else {
      newRegs = localRegs.map(r => (r.date === dateStr && r.userId === targetMemberId) ? { ...r, session: nextSession } : r);
    }

    const filteredRegs = newRegs.filter(r => r.session !== WorkSession.OFF);
    setLocalRegs(filteredRegs);
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    setIsSaving(true);
    // Giả lập độ trễ mạng
    setTimeout(() => {
      onUpdateRegistrations(localRegs);
      setHasChanges(false);
      setIsSaving(false);
      alert("Lịch làm việc đã được cập nhật thành công cho toàn bộ hệ thống.");
    }, 800);
  };

  const getSessionStatus = (userId: string, dateStr: string) => {
    const reg = localRegs.find(r => r.userId === userId && r.date === dateStr);
    if (!reg) return { morning: false, afternoon: false };
    return {
      morning: reg.session === WorkSession.MORNING || reg.session === WorkSession.FULL_DAY,
      afternoon: reg.session === WorkSession.AFTERNOON || reg.session === WorkSession.FULL_DAY
    };
  };

  const staffMembers = users.filter(u => u.role !== UserRole.VIEWER);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">Lịch trực Studio</h1>
          <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] md:text-xs tracking-[0.2em]">Cập nhật quân số & Phân bổ lịch họp</p>
        </div>
        <div className="flex bg-white rounded-2xl shadow-sm border border-slate-100 p-1">
          <button onClick={() => navigateWeek(-1)} className="p-3 hover:bg-slate-50 rounded-xl transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg></button>
          <div className="px-6 flex items-center text-xs font-black uppercase tracking-widest text-slate-600">{getWeekRangeLabel()}</div>
          <button onClick={() => navigateWeek(1)} className="p-3 hover:bg-slate-50 rounded-xl transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg></button>
        </div>
      </header>

      {/* Thanh trạng thái và Nút lưu (Sticky) */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ${hasChanges ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}>
        <div className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center space-x-6 border border-white/10 backdrop-blur-xl">
           <div className="flex items-center">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse mr-3"></span>
              <p className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Có thay đổi chưa lưu</p>
           </div>
           <button 
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center"
           >
             {isSaving ? (
               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
             ) : (
               <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
             )}
             Lưu đăng ký & Cập nhật hệ thống
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden relative">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-white">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest sticky left-0 bg-slate-950 z-20 min-w-[220px]">Nhân sự / Thứ</th>
                {daysOfWeek.map(day => (
                  <th key={day.toISOString()} className="p-6 text-center min-w-[140px] border-l border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">{day.toLocaleDateString('vi-VN', { weekday: 'long' })}</p>
                    <p className="text-lg font-black mt-1">{day.getDate()}/{day.getMonth() + 1}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {staffMembers.map(member => (
                <tr key={member.id} className={`${member.id === user.id ? 'bg-amber-50/20' : ''} hover:bg-slate-50/30 transition-colors group`}>
                  <td className="p-6 sticky left-0 bg-white shadow-xl z-10 border-r border-slate-50">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img src={member.avatar} className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-100 shadow-sm" alt="" />
                        {member.id === user.id && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                      </div>
                      <div>
                        <p className={`font-black text-sm ${member.id === user.id ? 'text-amber-600' : 'text-slate-800'}`}>
                          {member.name} {member.id === user.id && '(Tôi)'}
                        </p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{member.role}</p>
                      </div>
                    </div>
                  </td>
                  {daysOfWeek.map(day => {
                    const dateStr = day.toISOString().split('T')[0];
                    const status = getSessionStatus(member.id, dateStr);
                    const canEdit = member.id === user.id || isSuperAdmin;

                    return (
                      <td key={dateStr} className={`p-4 border-l border-slate-50 transition-colors ${canEdit ? 'cursor-pointer' : 'cursor-default'}`}>
                        <div className="flex flex-col space-y-2">
                          {/* Sáng */}
                          <button
                            disabled={!canEdit}
                            onClick={() => toggleRegistration(dateStr, 'MORNING', member.id)}
                            className={`py-2 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-between ${
                              status.morning 
                                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
                                : 'bg-slate-50 text-slate-300 hover:bg-slate-100'
                            } ${!canEdit ? 'opacity-80' : 'active:scale-95'}`}
                          >
                            <span>Sáng</span>
                            {status.morning && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                          </button>
                          {/* Chiều */}
                          <button
                            disabled={!canEdit}
                            onClick={() => toggleRegistration(dateStr, 'AFTERNOON', member.id)}
                            className={`py-2 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-between ${
                              status.afternoon 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                                : 'bg-slate-50 text-slate-300 hover:bg-slate-100'
                            } ${!canEdit ? 'opacity-80' : 'active:scale-95'}`}
                          >
                            <span>Chiều</span>
                            {status.afternoon && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                          </button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50/80 backdrop-blur-sm border-t border-slate-200">
                <td className="p-6 sticky left-0 bg-slate-50/90 font-black text-[10px] uppercase text-slate-500 tracking-[0.2em] border-r border-slate-100">Tổng quân số hiện diện</td>
                {daysOfWeek.map(day => {
                  const dateStr = day.toISOString().split('T')[0];
                  const morningCount = localRegs.filter(r => r.date === dateStr && (r.session === WorkSession.MORNING || r.session === WorkSession.FULL_DAY)).length;
                  const afternoonCount = localRegs.filter(r => r.date === dateStr && (r.session === WorkSession.AFTERNOON || r.session === WorkSession.FULL_DAY)).length;
                  return (
                    <td key={dateStr} className="p-6 text-center border-l border-slate-100">
                      <div className="flex flex-col items-center space-y-1">
                        <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black w-14">S: {morningCount}</div>
                        <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black w-14">C: {afternoonCount}</div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-amber-500/20 transition-all duration-700"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center">
               <span className="w-2 h-8 bg-amber-500 mr-4"></span>
               Lưu ý cho Nhân sự
            </h3>
            <ul className="space-y-5 text-[11px] font-bold text-white/60 uppercase tracking-widest leading-loose">
              <li className="flex items-start"><span className="text-amber-500 mr-3">01.</span> Đăng ký lịch trước 17:00 thứ 7 hàng tuần để KTS trưởng sắp xếp lịch họp.</li>
              <li className="flex items-start"><span className="text-amber-500 mr-3">02.</span> Sau khi tích chọn ca làm việc, hãy nhấn nút "Lưu đăng ký" để hệ thống cập nhật.</li>
              <li className="flex items-start"><span className="text-amber-500 mr-3">03.</span> Mọi thay đổi sau khi đã chốt tuần cần báo trực tiếp qua nhóm Chat hoặc PM.</li>
              <li className="flex items-start"><span className="text-amber-500 mr-3">04.</span> Dữ liệu này công khai để các thành viên biết lịch làm việc của nhau.</li>
            </ul>
          </div>
        </div>
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-amber-500 mb-8 shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Timeline Studio</h3>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-3">Sáng: 08:00 - 11:45 | Chiều: 13:30 - 17:30</p>
          <div className="mt-8 flex space-x-2">
             <div className="w-2 h-2 rounded-full bg-slate-200"></div>
             <div className="w-2 h-2 rounded-full bg-amber-500"></div>
             <div className="w-2 h-2 rounded-full bg-slate-200"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WorkSchedule;
