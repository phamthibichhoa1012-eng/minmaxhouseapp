
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, UserRole, Project } from '../types';
import { ROLE_LABELS } from '../App';
import { TASKS } from '../mockData';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isSuperAdmin = user.id === 'u1';

  // Tính toán số lượng nhắc nhở (Dự án/Công việc còn < 7 ngày hoặc quá hạn)
  const getReminderCount = () => {
    const savedProjects = localStorage.getItem('minmax_projects');
    const projects: Project[] = savedProjects ? JSON.parse(savedProjects) : [];
    
    const now = new Date();
    const urgentDate = new Date();
    urgentDate.setDate(now.getDate() + 7);

    const urgentProjects = projects.filter(p => {
      const deadline = new Date(p.deadline);
      return deadline <= urgentDate && p.status !== 'Hoàn thành';
    }).length;

    const urgentTasks = TASKS.filter(t => {
      const deadline = new Date(t.deadline);
      return deadline <= urgentDate && t.status !== 'Hoàn thành' && (user.role === UserRole.OWNER || t.assigneeId === user.id);
    }).length;

    return urgentProjects + urgentTasks;
  };

  const reminderCount = getReminderCount();

  const menuItems = [
    { label: 'Bảng điều khiển', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', path: '/', alwaysShow: true },
    { label: 'Dự án', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z', path: '/projects', alwaysShow: true },
    { label: 'Khách hàng', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', path: '/clients', alwaysShow: true },
    { label: 'Đăng ký lịch', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', path: '/schedule', alwaysShow: true },
    { label: 'Nhân sự', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197', path: '/staff', superAdminOnly: true },
    { label: 'Bảng Kanban', icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2', path: '/kanban', alwaysShow: true },
    { label: 'Báo cáo', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2', path: '/reports', superAdminOnly: true },
  ];

  const filteredMenu = menuItems.filter(item => {
    if (item.superAdminOnly) return isSuperAdmin;
    return item.alwaysShow;
  });

  return (
    <div className="min-h-screen flex bg-gray-50 flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white fixed h-full z-20">
        <div className="p-8">
          <h1 className="text-xl font-black tracking-tighter text-white select-none uppercase">
            MINMA<span className="text-amber-500">X</span>
          </h1>
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mt-2">Studio Manager</p>
        </div>
        
        <nav className="flex-1 px-4 mt-4 space-y-1">
          {filteredMenu.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all relative ${
                location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20 translate-x-1'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
              </svg>
              {item.label}
              {item.path === '/' && reminderCount > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-slate-900 animate-pulse">
                  {reminderCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} className="w-10 h-10 rounded-xl border-2 border-slate-700 object-cover" alt="" />
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-[10px] text-amber-500 font-black uppercase tracking-tighter">{ROLE_LABELS[user.role]}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full mt-4 flex items-center justify-center px-4 py-3 text-xs font-black text-slate-400 hover:text-white border-2 border-slate-800 rounded-xl hover:bg-red-600 hover:border-red-600 transition-all uppercase tracking-widest"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Mobile Top Nav */}
      <div className="md:hidden flex flex-col w-full z-40">
        <header className="bg-slate-900 text-white p-4 flex justify-between items-center fixed top-0 w-full z-30 shadow-md border-b border-slate-800">
          <h1 className="text-lg font-black tracking-tighter text-white select-none uppercase">
            MINMA<span className="text-amber-500">X</span>
          </h1>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-slate-800 rounded-lg text-amber-500 relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
            </svg>
            {!isMobileMenuOpen && reminderCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-slate-900">
                {reminderCount}
              </span>
            )}
          </button>
        </header>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-slate-900 z-50 pt-20 flex flex-col px-6 overflow-y-auto animate-in slide-in-from-right duration-300">
             <div className="flex justify-between items-center mb-10">
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Menu</h1>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
             </div>
            <nav className="flex flex-col space-y-4">
              {filteredMenu.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center py-5 px-6 text-base font-black uppercase tracking-widest rounded-2xl transition-all relative ${
                    location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                      ? 'bg-amber-600 text-white shadow-xl shadow-amber-600/30' 
                      : 'text-slate-400 border border-slate-800'
                  }`}
                >
                  <svg className="w-6 h-6 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                  </svg>
                  {item.label}
                  {item.path === '/' && reminderCount > 0 && (
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full">
                      {reminderCount} Cần chú ý
                    </span>
                  )}
                </Link>
              ))}
            </nav>
            
            <div className="mt-auto mb-10 pt-10">
                <div className="flex items-center p-4 bg-slate-800/50 rounded-2xl mb-6">
                    <img src={user.avatar} className="w-12 h-12 rounded-xl object-cover" alt="" />
                    <div className="ml-4">
                        <p className="text-white font-bold">{user.name}</p>
                        <p className="text-amber-500 text-xs font-black uppercase">{ROLE_LABELS[user.role]}</p>
                    </div>
                </div>
                <button 
                onClick={onLogout}
                className="w-full text-red-500 font-black uppercase tracking-[0.2em] py-5 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20"
                >
                Đăng xuất hệ thống
                </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-24 md:pt-8 w-full">
        <div className="max-w-7xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
