
import React, { useState } from 'react';
import { User, DesignPhase, Project } from '../types';
import { TASKS } from '../mockData';
import TaskDetailsModal from '../components/TaskDetailsModal';

interface KanbanBoardProps {
  user: User;
  projects: Project[];
  users: User[];
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ user, projects, users }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const columns = Object.values(DesignPhase);
  const filteredTasks = TASKS.filter(t => selectedProjectId === 'all' || t.projectId === selectedProjectId);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Khẩn cấp': return 'bg-red-500';
      case 'Cao': return 'bg-orange-500';
      case 'Bình thường': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] flex flex-col space-y-4">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2 md:px-0">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase">Quy trình thiết kế</h1>
          <p className="text-slate-500 text-[10px] md:text-sm uppercase tracking-widest font-bold">Quản lý giai đoạn theo Kanban</p>
        </div>
        <div className="w-full md:w-auto">
          <select 
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full md:w-auto border-gray-200 rounded-xl text-xs font-bold focus:ring-amber-500 p-3 border bg-white shadow-sm min-w-[200px] outline-none appearance-none"
          >
            <option value="all">Tất cả dự án</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </header>

      {/* Kanban Scroll Container */}
      <div className="flex-1 flex space-x-4 overflow-x-auto pb-6 px-2 snap-x snap-mandatory no-scrollbar md:scroll-auto">
        {columns.map(column => (
          <div key={column} className="flex-shrink-0 w-[85vw] sm:w-80 flex flex-col bg-slate-100/60 rounded-2xl md:rounded-3xl border border-slate-100/50 snap-center">
            <div className="p-4 md:p-5 flex items-center justify-between sticky top-0 bg-slate-100/60 backdrop-blur-sm rounded-t-3xl z-10">
              <div className="flex items-center">
                <h3 className="font-black text-slate-700 text-xs md:text-sm uppercase tracking-widest">{column}</h3>
                <span className="ml-2 bg-white px-2 py-0.5 rounded-lg text-[9px] md:text-xs font-black text-slate-400 border border-slate-100 shadow-sm">
                  {filteredTasks.filter(t => t.phase === column).length}
                </span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-10 custom-scrollbar">
              {filteredTasks
                .filter(task => task.phase === column)
                .map(task => {
                  const assignee = users.find(u => u.id === task.assigneeId);
                  const project = projects.find(p => p.id === task.projectId);
                  return (
                    <div 
                      key={task.id} 
                      onClick={() => setSelectedTaskId(task.id)}
                      className="bg-white p-4 rounded-xl md:rounded-2xl shadow-sm border border-transparent hover:border-amber-300 hover:shadow-lg transition-all active:scale-[0.97] group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></span>
                        <span className="text-[9px] text-slate-300 font-mono font-bold">#{project?.code}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-xs md:text-sm mb-1 line-clamp-2 group-hover:text-amber-600 transition-colors uppercase tracking-tight">{task.title}</h4>
                      <p className="text-[10px] text-slate-400 mb-4 truncate font-bold uppercase">{project?.name}</p>
                      
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50">
                        <div className="flex items-center">
                          <img src={assignee?.avatar} className="w-6 h-6 rounded-lg border-2 border-white shadow-sm object-cover" alt="" />
                          <span className="ml-2 text-[10px] font-bold text-slate-500 truncate max-w-[80px]">{assignee?.name.split(' ').pop()}</span>
                        </div>
                        <div className="flex items-center text-[9px] font-black text-red-500 uppercase">
                           <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                           {task.deadline.split('-').slice(1).join('/')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              
              {filteredTasks.filter(task => task.phase === column).length === 0 && (
                  <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                      <svg className="w-10 h-10 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                      <p className="text-[10px] font-bold uppercase tracking-widest">Trống</p>
                  </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedTaskId && (
        <TaskDetailsModal 
          taskId={selectedTaskId} 
          onClose={() => setSelectedTaskId(null)} 
          user={user}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
