
import React, { useState, useRef } from 'react';
import { User, ProjectStatus, Project, UserRole, DesignRequirements } from '../types';
import { TASKS } from '../mockData';

interface DashboardProps {
  user: User;
  projects: Project[];
  onUpdateProject: (project: Project) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, projects, onUpdateProject }) => {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [activeEditTab, setActiveEditTab] = useState<'info' | 'arch' | 'interior' | 'landscape' | 'docs'>('info');
  
  const landDeedRef = useRef<HTMLInputElement>(null);
  const refWorkRef = useRef<HTMLInputElement>(null);

  const isMemberOfProject = (projectId: string) => {
    if (user.role === UserRole.OWNER) return true;
    const project = projects.find(p => p.id === projectId);
    if (!project) return false;
    if (project.pmId === user.id) return true;
    return TASKS.some(t => t.projectId === projectId && t.assigneeId === user.id);
  };

  const handleEditClick = (project: Project) => {
    if (!isMemberOfProject(project.id)) {
      alert("Bạn không có quyền chỉnh sửa thông tin dự án này.");
      return;
    }
    const initialDetails: DesignRequirements = project.designDetails || {
      arch: { purpose: '', members: '', habits: '', spaces: '', style: '', budget: '', special: '' },
      interior: { scope: '', style: '', usage: '', materials: '', budget: '', other: '' },
      landscape: { area: '', style: '', functions: '', maintenance: '', lighting: '', budget: '' },
      documents: { status: '', notes: '', landDeedImageUrl: '', referenceImageUrls: [] }
    };
    setEditingProject({ ...project, designDetails: initialDetails });
    setActiveEditTab('info');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      onUpdateProject(editingProject);
      setEditingProject(null);
    }
  };

  const updateArchField = (field: keyof DesignRequirements['arch'], value: string) => {
    if (!editingProject?.designDetails) return;
    setEditingProject({
      ...editingProject,
      designDetails: {
        ...editingProject.designDetails,
        arch: { ...editingProject.designDetails.arch, [field]: value }
      }
    });
  };

  const updateInteriorField = (field: keyof DesignRequirements['interior'], value: string) => {
    if (!editingProject?.designDetails) return;
    setEditingProject({
      ...editingProject,
      designDetails: {
        ...editingProject.designDetails,
        interior: { ...editingProject.designDetails.interior, [field]: value }
      }
    });
  };

  const updateLandscapeField = (field: keyof DesignRequirements['landscape'], value: string) => {
    if (!editingProject?.designDetails) return;
    setEditingProject({
      ...editingProject,
      designDetails: {
        ...editingProject.designDetails,
        landscape: { ...editingProject.designDetails.landscape, [field]: value }
      }
    });
  };

  const updateDocsField = (field: keyof DesignRequirements['documents'], value: any) => {
    if (!editingProject?.designDetails) return;
    setEditingProject({
      ...editingProject,
      designDetails: {
        ...editingProject.designDetails,
        documents: { ...editingProject.designDetails.documents, [field]: value }
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'landDeedImageUrl' | 'referenceImageUrls') => {
    const files = e.currentTarget.files;
    if (!files || !editingProject?.designDetails) return;

    if (field === 'landDeedImageUrl') {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          updateDocsField('landDeedImageUrl', reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } else {
      const fileList = Array.from(files);
      fileList.forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
          setEditingProject(prev => {
            if (!prev?.designDetails) return prev;
            const currentUrls = prev.designDetails.documents.referenceImageUrls || [];
            return {
              ...prev,
              designDetails: {
                ...prev.designDetails,
                documents: {
                  ...prev.designDetails.documents,
                  referenceImageUrls: [...currentUrls, reader.result as string]
                }
              }
            };
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Logic lọc các mục sắp đến hạn (7 ngày)
  const getUrgentItems = () => {
    const now = new Date();
    const urgentLimit = new Date();
    urgentLimit.setDate(now.getDate() + 7);

    const urgentProjects = projects
      .filter(p => p.status !== ProjectStatus.COMPLETED && p.status !== ProjectStatus.ARCHIVED)
      .map(p => ({ ...p, typeItem: 'Dự án', deadlineDate: new Date(p.deadline) }))
      .filter(p => p.deadlineDate <= urgentLimit);

    const urgentTasks = TASKS
      .filter(t => t.status !== 'Hoàn thành' && t.status !== 'Đã duyệt')
      .filter(t => user.role === UserRole.OWNER || t.assigneeId === user.id)
      .map(t => ({ ...t, typeItem: 'Công việc', deadlineDate: new Date(t.deadline) }))
      .filter(t => t.deadlineDate <= urgentLimit);

    return [...urgentProjects, ...urgentTasks].sort((a, b) => a.deadlineDate.getTime() - b.deadlineDate.getTime());
  };

  const urgentItems = getUrgentItems();

  const stats = [
    { label: 'Dự án đang làm', value: projects.filter(p => p.status === ProjectStatus.DESIGNING).length, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'text-blue-600 bg-blue-100' },
    { label: 'Công việc trễ hạn', value: TASKS.filter(t => new Date(t.deadline) < new Date()).length, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-red-600 bg-red-100' },
    { label: 'Việc của tôi', value: TASKS.filter(t => t.assigneeId === user.id).length, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'text-amber-600 bg-amber-100' },
    { label: 'Hoàn thành', value: projects.filter(p => p.status === ProjectStatus.COMPLETED).length, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-green-600 bg-green-100' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-10 px-0 sm:px-4 md:px-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="px-2 md:px-0">
          <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">Xin chào, {user.name.split(' ').pop()}!</h1>
          <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] md:text-xs tracking-[0.2em]">Hệ thống quản lý MINMAX</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl md:rounded-2xl shadow-sm border border-slate-100 text-xs md:text-sm font-bold text-slate-600 flex items-center self-start md:self-auto">
          <svg className="w-4 h-4 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          {new Date().toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      {/* Nhắc nhở hạn chót (Mới) */}
      {urgentItems.length > 0 && (
        <section className="bg-red-50 border-2 border-red-100 rounded-[2rem] p-6 md:p-8 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-500/30 animate-pulse">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <h2 className="text-base md:text-xl font-black text-red-900 uppercase">Nhắc nhở hạn chót</h2>
                <p className="text-[9px] md:text-xs text-red-500 font-black uppercase tracking-widest mt-0.5">Các mục cần xử lý ngay lập tức</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {urgentItems.map((item: any) => {
              const daysLeft = Math.ceil((item.deadlineDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
              const isOverdue = daysLeft < 0;

              return (
                <div key={item.id} className="bg-white p-5 rounded-3xl border border-red-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${item.typeItem === 'Dự án' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
                      {item.typeItem}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                      {isOverdue ? 'Quá hạn' : `Còn ${daysLeft} ngày`}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-red-600 transition-colors line-clamp-1">
                    {'name' in item ? item.name : item.title}
                  </h3>
                  <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    {item.deadline}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 hover:shadow-lg transition-all">
            <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${stat.color} flex-shrink-0`}>
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}></path>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] md:text-xs font-black text-slate-400 uppercase tracking-widest truncate">{stat.label}</p>
              <p className="text-lg md:text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* Recent Tasks */}
          <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 md:p-8 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-base md:text-xl font-black text-slate-900 uppercase">Công việc gần đây</h2>
                <p className="text-[9px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Cần xử lý gấp</p>
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {TASKS.slice(0, 3).map(task => (
                <div key={task.id} className="p-5 md:p-8 hover:bg-slate-50/50 transition-colors flex justify-between items-center group">
                  <div className="space-y-1 min-w-0 mr-4">
                    <h3 className="font-bold text-slate-800 text-sm md:text-base group-hover:text-amber-600 transition-colors truncate">{task.title}</h3>
                    <div className="flex items-center space-x-3 text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                       <span className="flex items-center"><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>{task.deadline.split('-').slice(1).join('/')}</span>
                       <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500 whitespace-nowrap">{task.phase}</span>
                    </div>
                  </div>
                  <span className={`flex-shrink-0 px-2 md:px-3 py-1 text-[8px] md:text-[10px] font-black uppercase rounded-full tracking-widest ${
                    task.priority === 'Khẩn cấp' ? 'bg-red-100 text-red-600' :
                    task.priority === 'Cao' ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>{task.priority}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Projects Info */}
          <div className="bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-amber-500/10 rounded-full -mr-24 -mt-24 md:-mr-32 md:-mt-32 blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6 md:mb-8">
                <div>
                  <h2 className="text-base md:text-xl font-black text-white uppercase">Dự án tiêu biểu</h2>
                  <p className="text-[9px] md:text-xs text-amber-500 font-bold uppercase tracking-[0.3em] mt-1">Thông tin thiết kế</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {projects.filter(p => p.status === ProjectStatus.DESIGNING && p.designDetails).slice(0, 4).map(project => (
                  <div key={project.id} className="bg-white/5 border border-white/10 p-5 md:p-6 rounded-2xl md:rounded-3xl hover:bg-white/10 transition-all group relative">
                    {isMemberOfProject(project.id) && (
                      <button 
                        onClick={() => handleEditClick(project)}
                        className="absolute top-4 right-4 p-2 bg-white/10 text-amber-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-amber-50 hover:text-white"
                        title="Sửa hồ sơ & bộ câu hỏi"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                    )}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 text-xs md:text-sm font-black">
                        {project.clientName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-white font-bold text-xs md:text-sm truncate">{project.clientName}</h3>
                        <p className="text-amber-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest truncate">{project.name}</p>
                      </div>
                    </div>
                    <div className="bg-black/20 rounded-xl md:rounded-2xl p-4 border border-white/5 space-y-2">
                      <p className="text-white/70 text-[10px] md:text-[11px] leading-relaxed italic line-clamp-2">
                        <span className="text-amber-500 font-bold not-italic">Kiến trúc: </span>
                        {project.designDetails?.arch.style}
                      </p>
                      <p className="text-white/70 text-[10px] md:text-[11px] leading-relaxed italic line-clamp-2">
                        <span className="text-blue-400 font-bold not-italic">Nội thất: </span>
                        {project.designDetails?.interior.style}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          {/* Contacts List */}
          <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-base md:text-xl font-black text-slate-900 uppercase">Khách hàng</h2>
              <p className="text-[9px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Liên lạc nhanh</p>
            </div>
            <div className="space-y-4 md:space-y-6">
              {projects.slice(0, 5).map(project => (
                <div key={project.id} className="flex items-center justify-between group p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-all">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-slate-100 rounded-lg md:rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-bold text-slate-800 truncate">{project.clientName}</p>
                      <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-tighter truncate">{project.clientPhone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-base md:text-xl font-black text-slate-900 uppercase">Tiến độ</h2>
              <p className="text-[9px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Dự án thiết kế</p>
            </div>
            <div className="space-y-6 md:space-y-8">
              {projects.filter(p => p.status !== ProjectStatus.COMPLETED).map(project => {
                const projectTasks = TASKS.filter(t => t.projectId === project.id);
                const doneTasks = projectTasks.filter(t => t.status === 'Hoàn thành' || t.status === 'Đã duyệt').length;
                const progress = projectTasks.length > 0 ? Math.round((doneTasks / projectTasks.length) * 100) : 0;
                
                return (
                  <div key={project.id}>
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] md:text-xs font-black text-slate-800 uppercase tracking-tight truncate mr-2">{project.name}</span>
                      <span className="text-[10px] md:text-xs font-black text-amber-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 md:h-2 overflow-hidden">
                      <div className="bg-slate-900 h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE EDIT MODAL */}
      {editingProject && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl h-[95vh] sm:h-[90vh] rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl p-0 overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300 flex flex-col">
            <div className="p-5 md:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="min-w-0">
                <h2 className="text-lg md:text-2xl font-black text-slate-900 uppercase tracking-tight truncate">Hồ sơ thiết kế</h2>
                <p className="text-[9px] md:text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mt-1 truncate">{editingProject.name}</p>
              </div>
              <button onClick={() => setEditingProject(null)} className="p-2 hover:bg-white rounded-full text-slate-300 hover:text-slate-900 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="flex border-b border-slate-50 px-4 md:px-8 bg-white overflow-x-auto no-scrollbar scroll-smooth">
                {[
                { id: 'info', label: 'KH', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0z' },
                { id: 'arch', label: 'K.Trúc', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16' },
                { id: 'interior', label: 'N.Thất', icon: 'M3 12l2-2m0 0l7-7 7 7' },
                { id: 'landscape', label: 'S.Vườn', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
                { id: 'docs', label: 'Tài liệu', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveEditTab(tab.id as any)}
                  className={`flex-1 min-w-[80px] py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest border-b-2 transition-all flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2 ${
                    activeEditTab === tab.id ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon}></path></svg>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-5 md:p-8 bg-slate-50/30 custom-scrollbar">
                {activeEditTab === 'info' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tên khách hàng</label>
                      <input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 md:p-4 focus:border-amber-500 font-bold" value={editingProject.clientName} onChange={(e) => setEditingProject({...editingProject, clientName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Số điện thoại</label>
                      <input type="tel" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 md:p-4 focus:border-amber-500 font-mono font-bold" value={editingProject.clientPhone} onChange={(e) => setEditingProject({...editingProject, clientPhone: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
                      <input type="email" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 md:p-4 focus:border-amber-500" value={editingProject.clientEmail} onChange={(e) => setEditingProject({...editingProject, clientEmail: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Số CCCD</label>
                      <input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 md:p-4 focus:border-amber-500 font-mono" value={editingProject.clientCCCD || ''} onChange={(e) => setEditingProject({...editingProject, clientCCCD: e.target.value})} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Địa chỉ khách hàng</label>
                      <input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 md:p-4 focus:border-amber-500" value={editingProject.clientAddress || ''} onChange={(e) => setEditingProject({...editingProject, clientAddress: e.target.value})} />
                    </div>
                  </div>
                )}

                {activeEditTab === 'arch' && editingProject.designDetails && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mục đích sử dụng</label>
                        <input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500" value={editingProject.designDetails.arch.purpose} onChange={(e) => updateArchField('purpose', e.target.value)} placeholder="VD: Nhà ở, Nghỉ dưỡng..." />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Thành viên sinh sống</label>
                        <input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500" value={editingProject.designDetails.arch.members} onChange={(e) => updateArchField('members', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Thói quen sinh hoạt</label>
                        <input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500" value={editingProject.designDetails.arch.habits} onChange={(e) => updateArchField('habits', e.target.value)} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nhu cầu không gian chính</label>
                        <textarea className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 h-24" value={editingProject.designDetails.arch.spaces} onChange={(e) => updateArchField('spaces', e.target.value)} placeholder="Số PN, WC, phòng thờ..."></textarea>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phong cách kiến trúc</label>
                        <input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 font-bold text-amber-600" value={editingProject.designDetails.arch.style} onChange={(e) => updateArchField('style', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ngân sách xây dựng dự kiến</label>
                        <input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 font-bold" value={editingProject.designDetails.arch.budget} onChange={(e) => updateArchField('budget', e.target.value)} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Yêu cầu đặc biệt</label>
                        <textarea className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 h-20" value={editingProject.designDetails.arch.special} onChange={(e) => updateArchField('special', e.target.value)}></textarea>
                      </div>
                    </div>
                  </div>
                )}

                {activeEditTab === 'interior' && editingProject.designDetails && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phạm vi thiết kế nội thất</label>
                        <input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500" value={editingProject.designDetails.interior.scope} onChange={(e) => updateInteriorField('scope', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gu nội thất / Style</label>
                        <input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 font-bold text-blue-600" value={editingProject.designDetails.interior.style} onChange={(e) => updateInteriorField('style', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vật liệu ưu tiên</label>
                        <input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500" value={editingProject.designDetails.interior.materials} onChange={(e) => updateInteriorField('materials', e.target.value)} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nhu cầu sử dụng đặc thù</label>
                        <textarea className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 h-20" value={editingProject.designDetails.interior.usage} onChange={(e) => updateInteriorField('usage', e.target.value)}></textarea>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ngân sách nội thất</label>
                        <input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 font-bold" value={editingProject.designDetails.interior.budget} onChange={(e) => updateInteriorField('budget', e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                {activeEditTab === 'landscape' && editingProject.designDetails && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Diện tích & Hiện trạng sân vườn</label>
                        <input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500" value={editingProject.designDetails.landscape.area} onChange={(e) => updateLandscapeField('area', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phong cách sân vườn</label>
                        <input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 font-bold text-green-600" value={editingProject.designDetails.landscape.style} onChange={(e) => updateLandscapeField('style', e.target.value)} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nhu cầu chức năng</label>
                        <textarea className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 h-24" value={editingProject.designDetails.landscape.functions} onChange={(e) => updateLandscapeField('functions', e.target.value)} placeholder="Hồ cá, BBQ..."></textarea>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Yêu cầu ánh sáng cảnh đêm</label>
                        <input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500" value={editingProject.designDetails.landscape.lighting} onChange={(e) => updateLandscapeField('lighting', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ngân sách sân vườn</label>
                        <input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 font-bold" value={editingProject.designDetails.landscape.budget} onChange={(e) => updateLandscapeField('budget', e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                {activeEditTab === 'docs' && editingProject.designDetails && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tình trạng hồ sơ (Ghi chú)</label>
                        <textarea className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 h-20" value={editingProject.designDetails.documents.status} onChange={(e) => updateDocsField('status', e.target.value)}></textarea>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Liên kết Google Drive (Cloud)</label>
                        <input type="url" className="w-full bg-white border-2 border-blue-50 rounded-xl p-3 focus:border-blue-500 font-mono text-xs" value={editingProject.driveUrl || ''} onChange={(e) => setEditingProject({...editingProject, driveUrl: e.target.value})} placeholder="https://drive.google.com/..." />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Sổ đỏ / Hiện trạng khu đất</label>
                        <div onClick={() => landDeedRef.current?.click()} className="aspect-video border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-all overflow-hidden bg-white">
                          {editingProject.designDetails.documents.landDeedImageUrl ? (
                            <img src={editingProject.designDetails.documents.landDeedImageUrl} className="w-full h-full object-cover" alt="Land Deed" />
                          ) : (
                            <div className="text-center">
                              <svg className="w-8 h-8 text-slate-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Tải lên ảnh sổ đỏ</p>
                            </div>
                          )}
                        </div>
                        <input type="file" ref={landDeedRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'landDeedImageUrl')} />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Hình ảnh tham khảo</label>
                        <div className="grid grid-cols-2 gap-2">
                          {editingProject.designDetails.documents.referenceImageUrls?.map((url, i) => (
                            <div key={i} className="aspect-square rounded-xl overflow-hidden relative group">
                              <img src={url} className="w-full h-full object-cover" alt="" />
                              <button type="button" onClick={(e) => { e.stopPropagation(); const newUrls = editingProject.designDetails?.documents.referenceImageUrls?.filter((_, idx) => idx !== i); updateDocsField('referenceImageUrls', newUrls); }} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                            </div>
                          ))}
                          <button type="button" onClick={() => refWorkRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center hover:bg-slate-50 text-slate-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg></button>
                        </div>
                        <input type="file" ref={refWorkRef} className="hidden" accept="image/*" multiple onChange={(e) => handleFileUpload(e, 'referenceImageUrls')} />
                      </div>
                    </div>
                  </div>
                )}
            </form>
            
            <div className="p-4 md:p-8 border-t border-slate-100 bg-white flex gap-3 md:gap-4">
              <button type="button" onClick={() => setEditingProject(null)} className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Hủy bỏ</button>
              <button type="submit" onClick={handleSaveEdit} className="flex-[2] py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all">Cập nhật toàn bộ hồ sơ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
