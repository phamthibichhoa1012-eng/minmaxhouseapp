
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole, Project, WorkRegistration } from './types';
import { USERS as INITIAL_USERS, PROJECTS as INITIAL_PROJECTS } from './mockData';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProjectList from './pages/ProjectList';
import ProjectDetail from './pages/ProjectDetail';
import KanbanBoard from './pages/KanbanBoard';
import CalendarView from './pages/CalendarView';
import Reports from './pages/Reports';
import StaffList from './pages/StaffList';
import ClientList from './pages/ClientList';
import WorkSchedule from './pages/WorkSchedule';

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.OWNER]: 'Kiến trúc sư',
  [UserRole.PM]: 'Quản lý dự án',
  [UserRole.DESIGNER]: 'Họa viên thiết kế',
  [UserRole.VIEWER]: 'Khách hàng/Viewer',
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('minmax_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('minmax_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [workRegistrations, setWorkRegistrations] = useState<WorkRegistration[]>(() => {
    const saved = localStorage.getItem('minmax_work_regs');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    localStorage.setItem('minmax_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('minmax_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('minmax_work_regs', JSON.stringify(workRegistrations));
  }, [workRegistrations]);

  useEffect(() => {
    const savedUser = localStorage.getItem('archi_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      const exists = users.find(u => u.id === parsedUser.id);
      if (exists) {
        setCurrentUser(exists);
      } else {
        localStorage.removeItem('archi_user');
      }
    }
    setIsLoading(false);
  }, [users]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const email = emailInput.trim().toLowerCase();
    const password = passwordInput;

    const ADMIN_EMAIL = 'mmdesign.thietke@gmail.com';
    const ADMIN_PWD = 'Quan21011998*';
    const DEFAULT_PWD = '123456';

    if (email === ADMIN_EMAIL && password === ADMIN_PWD) {
      const adminUser = users.find(u => u.email === ADMIN_EMAIL);
      if (adminUser) { login(adminUser); return; }
    }

    const user = users.find(u => u.email.toLowerCase() === email);
    if (user) {
      if (email === ADMIN_EMAIL) {
        setLoginError('Mật khẩu quản trị không đúng.');
      } else if (password === DEFAULT_PWD) {
        login(user);
      } else {
        setLoginError('Mật khẩu không chính xác.');
      }
    } else {
      setLoginError('Tài khoản không tồn tại.');
    }
  };

  const login = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('archi_user', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('archi_user');
  };

  const addProject = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev]);
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleUpdateProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const addUser = (newUser: User) => setUsers(prev => [...prev, newUser]);
  const updateUser = (updatedUser: User) => setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  const deleteUser = (userId: string) => setUsers(prev => prev.filter(u => u.id !== userId));

  const handleUpdateWorkRegs = (regs: WorkRegistration[]) => {
    setWorkRegistrations(regs);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-slate-950 text-white">MINMAX Khởi động...</div>;
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4 font-inter">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
              MINMA<span className="text-amber-500">X</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Architecture Studio</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="email" required placeholder="Email"
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-amber-500 transition-all"
              value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
            />
            <input 
              type="password" required placeholder="Password"
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-amber-500 transition-all"
              value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
            />
            {loginError && <p className="text-red-500 text-xs font-bold text-center">{loginError}</p>}
            <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-amber-600 transition-all">
              Đăng nhập
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Layout user={currentUser} onLogout={logout}>
        <Routes>
          <Route path="/" element={<Dashboard user={currentUser} projects={projects} onUpdateProject={updateProject} />} />
          <Route path="/projects" element={<ProjectList user={currentUser} projects={projects} users={users} onAddProject={addProject} onDeleteProject={deleteProject} />} />
          <Route path="/projects/:id" element={<ProjectDetail user={currentUser} projects={projects} users={users} onUpdateProject={updateProject} onDeleteProject={deleteProject} />} />
          <Route path="/clients" element={<ClientList user={currentUser} projects={projects} onUpdateProjects={handleUpdateProjects} />} />
          <Route path="/kanban" element={<KanbanBoard user={currentUser} projects={projects} users={users} />} />
          <Route path="/calendar" element={<CalendarView user={currentUser} projects={projects} />} />
          <Route path="/schedule" element={<WorkSchedule user={currentUser} users={users} registrations={workRegistrations} onUpdateRegistrations={handleUpdateWorkRegs} />} />
          <Route path="/reports" element={<Reports user={currentUser} projects={projects} users={users} />} />
          <Route path="/staff" element={<StaffList user={currentUser} users={users} onAddUser={addUser} onUpdateUser={updateUser} onDeleteUser={deleteUser} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
