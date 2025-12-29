
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, ProjectStatus, ProjectType, Project } from '../types';
import { TASKS } from '../mockData';
import CreateProjectModal from '../components/CreateProjectModal';

interface ProjectListProps {
  user: User;
  projects: Project[];
  users: User[];
  onAddProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ user, projects, users, onAddProject, onDeleteProject }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Chỉ Huỳnh Văn Quân (u1) mới được quyền quản lý dự án tối cao
  const isSuperAdmin = user.id === 'u1';

  // LOGIC LỌC DỰ ÁN THEO PHÂN QUYỀN
  const visibleProjects = projects.filter(p => {
    // Admin thấy tất cả
    if (isSuperAdmin) return true;
    // PM thấy dự án họ quản lý
    if (p.pmId === user.id) return true;
    // Designer thấy dự án họ có ít nhất 1 task được giao
    const hasTask = TASKS.some(t => t.projectId === p.id && t.assigneeId === user.id);
    return hasTask;
  });

  const filteredProjects = visibleProjects.filter(p => {
    const statusMatch = filterStatus === 'all' || p.status === filterStatus;
    const typeMatch = filterType === 'all' || p.type === filterType;
    return statusMatch && typeMatch;
  });

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.INIT: return 'bg-gray-100 text-gray-600';
      case ProjectStatus.DESIGNING: return 'bg-blue-100 text-blue-600';
      case ProjectStatus.WAITING_APPROVAL: return 'bg-amber-100 text-amber-600';
      case ProjectStatus.CONSTRUCTING: return 'bg-purple-100 text-purple-600';
      case ProjectStatus.COMPLETED: return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  const handleDelete = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa dự án "${project.name}" không? Thao tác này không thể hoàn tác.`)) {
      onDeleteProject(project.id);
    }
  };

  const checkUrgency = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days <= 3 && days >= 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách Dự án</h1>
          <p className="text-gray-500">{isSuperAdmin ? 'Quản lý toàn bộ hệ thống dự án' : 'Các dự án bạn đang tham gia'}</p>
        </div>
        {isSuperAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl font-semibold shadow-md transition-all flex items-center justify-center active:scale-95"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Dự án mới
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-4">
        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-400 uppercase mb-1">Trạng thái</label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border-gray-200 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500 p-2 border outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-400 uppercase mb-1">Loại công trình</label>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border-gray-200 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500 p-2 border outline-none"
          >
            <option value="all">Tất cả loại</option>
            {Object.values(ProjectType).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="ml-auto self-end text-xs font-bold text-slate-400 uppercase tracking-widest">
            Hiển thị: {filteredProjects.length} / {visibleProjects.length} dự án
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length > 0 ? filteredProjects.map(project => {
          const pm = users.find(u => u.id === project.pmId);
          const isUrgent = checkUrgency(project.deadline);
          
          return (
            <Link 
              key={project.id} 
              to={`/projects/${project.id}`}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group relative"
            >
              {isUrgent && project.status !== ProjectStatus.COMPLETED && (
                <div className="absolute top-2 right-2 z-10 p-2 bg-red-500 text-white rounded-xl shadow-lg animate-bounce" title="Hạn chót rất gần!">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              )}

              {isSuperAdmin && (
                <button 
                  onClick={(e) => handleDelete(e, project)}
                  className="absolute top-2 left-2 z-10 p-2 bg-white/80 backdrop-blur-sm text-red-500 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all shadow-sm border border-red-100"
                  title="Xóa dự án"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              )}

              <div className="h-40 bg-gray-200 relative">
                <img 
                  src={project.thumbnailUrl || `https://picsum.photos/seed/${project.id}/400/200`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  alt={project.name} 
                />
                <span className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-800 group-hover:text-amber-600 transition-colors">{project.name}</h3>
                  <span className="text-xs font-mono text-gray-400">{project.code}</span>
                </div>
                <p className="text-sm text-gray-500 mb-4 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  {project.address || 'Chưa cập nhật địa chỉ'}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center">
                    <img src={pm?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(pm?.name || '')}`} className="w-6 h-6 rounded-full mr-2" alt="" />
                    <span className="text-xs font-medium text-gray-600">{pm?.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Hạn chót</p>
                    <p className={`text-xs font-bold ${isUrgent ? 'text-red-600' : 'text-slate-600'}`}>{project.deadline}</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        }) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
             <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
             <p className="text-lg font-medium">Không có dự án nào hiển thị</p>
             <p className="text-sm">Bạn chưa được giao việc trong dự án nào hoặc không tìm thấy kết quả lọc.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <CreateProjectModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={onAddProject}
          existingProjects={projects}
          users={users}
        />
      )}
    </div>
  );
};

export default ProjectList;
