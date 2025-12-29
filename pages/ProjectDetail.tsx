
import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Project, ProjectStatus, UserRole, TaskStatus, DesignRequirements } from '../types';
import { TASKS } from '../mockData';
import TaskDetailsModal from '../components/TaskDetailsModal';
import { analyzeDesignRequirements, createArchitectChat } from '../lib/gemini';

interface ProjectDetailProps {
  user: User;
  projects: Project[];
  users: User[];
  onUpdateProject?: (project: Project) => void;
  onDeleteProject?: (projectId: string) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ user, projects, users, onUpdateProject, onDeleteProject }) => {
  const { id } = useParams<{ id: string }>();
  const project = projects.find(p => p.id === id);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeInfoTab, setActiveInfoTab] = useState<'arch' | 'interior' | 'landscape' | 'client' | 'ai' | 'chat'>('client');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // AI Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [aiChat, setAiChat] = useState<any>(null);

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [activeEditTab, setActiveEditTab] = useState<'info' | 'arch' | 'interior' | 'landscape' | 'docs'>('info');
  
  const additionalPhotosRef = useRef<HTMLInputElement>(null);

  const isMember = user.role === UserRole.OWNER || (project && (project.pmId === user.id || TASKS.some(t => t.projectId === project.id && t.assigneeId === user.id)));

  useEffect(() => {
    if (project && !aiChat) {
      setAiChat(createArchitectChat(project));
    }
  }, [project]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  if (!project) return <div className="p-10 text-center font-bold text-slate-400">Không tìm thấy dự án</div>;

  const projectTasks = TASKS.filter(t => t.projectId === project.id);
  const pm = users.find(u => u.id === project.pmId);

  const handleAIAnalysis = async () => {
    if (!project.designDetails) return;
    setIsAnalyzing(true);
    setActiveInfoTab('ai');
    const result = await analyzeDesignRequirements(project.designDetails);
    if (onUpdateProject) {
      onUpdateProject({ ...project, aiConceptSuggestion: result });
    }
    setIsAnalyzing(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !aiChat || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsChatLoading(true);

    try {
      const response = await aiChat.sendMessage({ message: userMessage });
      setChatHistory(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'model', text: "Lỗi kết nối: Trợ lý KTS không thể trả lời lúc này." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleEditClick = (tab: 'info' | 'arch' | 'interior' | 'landscape' | 'docs' = 'info') => {
    const initialDetails: DesignRequirements = project.designDetails || {
      arch: { purpose: '', members: '', habits: '', spaces: '', style: '', budget: '', special: '', constructionTime: '', landStatus: '' },
      interior: { scope: '', style: '', usage: '', materials: '', budget: '', other: '' },
      landscape: { area: '', style: '', functions: '', maintenance: '', lighting: '', budget: '' },
      documents: { status: '', notes: '', landDeedImageUrl: '', referenceImageUrls: [], additionalPhotos: [], regulations: '' }
    };
    setEditingProject({ ...project, designDetails: initialDetails });
    setActiveEditTab(tab);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject && onUpdateProject) {
      onUpdateProject(editingProject);
      setEditingProject(null);
    }
  };

  const updateSubField = (category: keyof DesignRequirements, field: string, value: string) => {
    if (!editingProject?.designDetails) return;
    setEditingProject({
      ...editingProject,
      designDetails: {
        ...editingProject.designDetails,
        [category]: { ...(editingProject.designDetails[category] as any), [field]: value }
      }
    });
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link to="/projects" className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-amber-600 shadow-sm transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </Link>
          <div>
            <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">{project.name}</h1>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{project.type} &bull; {project.address}</p>
          </div>
        </div>
        
        {isMember && (
          <div className="flex space-x-2">
            <button onClick={() => setActiveInfoTab('chat')} className="p-2 md:px-6 md:py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
              <span className="hidden sm:inline">Hỏi Trợ lý KTS</span>
            </button>
            <button onClick={() => handleEditClick('info')} className="p-2 md:px-6 md:py-3 bg-amber-600 text-white rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl hover:bg-amber-700 transition-all">
              Sửa hồ sơ
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
            <div className="flex border-b border-slate-50 bg-slate-50/50 overflow-x-auto no-scrollbar shrink-0">
              {[
                { id: 'client', label: 'Khách hàng', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0z' },
                { id: 'arch', label: 'Kiến trúc', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16' },
                { id: 'ai', label: 'Phân tích AI', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                { id: 'chat', label: 'Trợ lý KTS', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveInfoTab(tab.id as any)}
                  className={`flex-1 min-w-[120px] py-5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-2 border-b-2 transition-all ${
                    activeInfoTab === tab.id ? 'bg-white border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:bg-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon}></path></svg>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-8 min-h-[500px] max-h-[600px] overflow-y-auto custom-scrollbar">
              {activeInfoTab === 'client' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-4 border-amber-500 pl-3">Thông tin định danh</h3>
                    <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                      <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-[10px] font-black text-slate-400 uppercase">Khách hàng</span><span className="text-sm font-bold text-slate-800">{project.clientName}</span></div>
                      <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-[10px] font-black text-slate-400 uppercase">Điện thoại</span><span className="text-sm font-bold text-amber-600">{project.clientPhone}</span></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-4 border-blue-500 pl-3">Địa chỉ & Pháp lý</h3>
                    <div className="bg-slate-50 p-6 rounded-3xl min-h-[140px] space-y-4">
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">{project.clientAddress || 'Chưa cập nhật địa chỉ'}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeInfoTab === 'arch' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <h4 className="text-[10px] font-black text-amber-600 uppercase mb-4">Thông tin xây dựng</h4>
                      <ul className="space-y-3 text-sm">
                        <li className="flex justify-between"><span className="text-slate-400 font-bold">Dự kiến xây:</span> <span className="font-bold text-slate-800">{project.designDetails?.arch.constructionTime || 'N/A'}</span></li>
                        <li className="flex justify-between"><span className="text-slate-400 font-bold">Phong cách:</span> <span className="font-bold text-amber-600 uppercase">{project.designDetails?.arch.style || 'N/A'}</span></li>
                      </ul>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <h4 className="text-[10px] font-black text-blue-600 uppercase mb-4">Gia đình & Nhu cầu</h4>
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">{project.designDetails?.arch.spaces || 'Chưa cập nhật nhu cầu không gian chính.'}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeInfoTab === 'ai' && (
                <div className="space-y-6">
                   {isAnalyzing ? (
                     <div className="flex flex-col items-center py-20"><div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div><p className="text-xs font-black text-slate-400 uppercase">AI đang lập phương án...</p></div>
                   ) : project.aiConceptSuggestion ? (
                     <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 prose prose-slate max-w-none text-sm leading-relaxed whitespace-pre-wrap font-medium text-slate-700">{project.aiConceptSuggestion}</div>
                   ) : (
                     <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-6 text-amber-500">
                           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] mb-4">Gemini 3 Pro đã sẵn sàng phân tích hồ sơ</p>
                        <button onClick={handleAIAnalysis} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-amber-600 transition-all">Phân tích chuyên sâu</button>
                     </div>
                   )}
                </div>
              )}

              {activeInfoTab === 'chat' && (
                <div className="h-full flex flex-col space-y-4">
                  <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                    {chatHistory.length === 0 && (
                      <div className="text-center py-10">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-indigo-500">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hỏi AI về vật liệu, giải pháp mặt bằng hoặc ý tưởng decor cho dự án này.</p>
                      </div>
                    )}
                    {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 p-4 rounded-2xl flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  
                  <form onSubmit={handleSendMessage} className="relative mt-4 shrink-0">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Hỏi trợ lý KTS AI..."
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-6 pr-14 text-sm font-medium focus:border-indigo-500 outline-none transition-all"
                    />
                    <button type="submit" disabled={isChatLoading || !chatInput.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-xl shadow-lg disabled:opacity-50">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Công việc dự án</h2>
            <div className="divide-y divide-slate-50">
              {projectTasks.length > 0 ? projectTasks.map(task => {
                const assignee = users.find(u => u.id === task.assigneeId);
                return (
                  <div key={task.id} className="py-6 flex justify-between items-center group cursor-pointer" onClick={() => setSelectedTaskId(task.id)}>
                    <div className="space-y-1"><h4 className="font-bold text-slate-800 group-hover:text-amber-600 transition-all">{task.title}</h4><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.phase} &bull; V{task.revisionCount}</p></div>
                    <div className="flex items-center space-x-4"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${task.status === TaskStatus.DONE ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>{task.status}</span><img src={assignee?.avatar} className="w-8 h-8 rounded-xl object-cover" alt="" /></div>
                  </div>
                );
              }) : <div className="py-10 text-center text-slate-300 font-bold uppercase text-xs tracking-widest">Chưa có công việc nào được giao</div>}
            </div>
          </section>
        </div>

        <div className="space-y-8">
           <section className="bg-slate-950 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="relative z-10 space-y-8">
              <div><h2 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-6">Quản lý dự án (PM)</h2><div className="flex items-center space-x-4"><img src={pm?.avatar} className="w-14 h-14 rounded-2xl border-2 border-white/10 object-cover" alt="" /><div><p className="font-black text-lg">{pm?.name}</p><p className="text-[9px] text-white/50 uppercase tracking-widest font-bold mt-1">{pm?.email}</p></div></div></div>
              <div className="pt-8 border-t border-white/5"><h2 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-6">Thông số XD</h2><div className="grid grid-cols-2 gap-4"><div className="bg-white/5 p-4 rounded-3xl border border-white/5 text-center"><p className="text-[9px] text-white/40 font-black uppercase mb-1">D.Tích đất</p><p className="text-lg font-black">{project.landArea} m²</p></div><div className="bg-white/5 p-4 rounded-3xl border border-white/5 text-center"><p className="text-[9px] text-white/40 font-black uppercase mb-1">D.Tích XD</p><p className="text-lg font-black">{project.buildArea} m²</p></div></div></div>
              <div className="pt-8 border-t border-white/5"><h2 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-6">Lưu trữ đám mây</h2><a href={project.driveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"><div className="flex items-center"><svg className="w-6 h-6 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z"></path></svg><span className="text-xs font-bold text-white/80 group-hover:text-white">Google Drive</span></div><svg className="w-4 h-4 text-white/30 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7"></path></svg></a></div>
            </div>
          </section>
        </div>
      </div>

      {editingProject && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl h-[95vh] sm:h-[90vh] rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl p-0 overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase">Cập nhật hồ sơ dự án</h2>
              <button onClick={() => setEditingProject(null)} className="p-3 text-slate-300 hover:text-slate-900 transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
            <div className="flex border-b border-slate-50 px-4 md:px-8 bg-white overflow-x-auto no-scrollbar scroll-smooth shrink-0">
              {[
                { id: 'info', label: 'Chung', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0z' },
                { id: 'arch', label: 'Kiến trúc', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16' },
                { id: 'interior', label: 'Nội thất', icon: 'M3 12l2-2m0 0l7-7 7 7' },
                { id: 'landscape', label: 'Sân vườn', icon: 'M12 19l9 2-9-18-9 18 9-2z' },
                { id: 'docs', label: 'Tài liệu', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveEditTab(tab.id as any)} className={`flex-1 min-w-[80px] py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center justify-center space-x-2 ${activeEditTab === tab.id ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon}></path></svg><span>{tab.label}</span></button>
              ))}
            </div>

            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/20 space-y-8 custom-scrollbar">
                {activeEditTab === 'info' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in">
                    <div className="sm:col-span-2"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tên Dự án</label><input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 font-bold" value={editingProject.name} onChange={e => setEditingProject({...editingProject, name: e.target.value})} /></div>
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tên khách hàng</label><input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 font-bold" value={editingProject.clientName} onChange={e => setEditingProject({...editingProject, clientName: e.target.value})} /></div>
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Số điện thoại</label><input type="tel" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 font-mono" value={editingProject.clientPhone} onChange={e => setEditingProject({...editingProject, clientPhone: e.target.value})} /></div>
                  </div>
                )}

                {activeEditTab === 'arch' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in">
                    <div className="sm:col-span-2"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mục đích sử dụng</label><input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500" value={editingProject.designDetails?.arch.purpose} onChange={e => updateSubField('arch', 'purpose', e.target.value)} /></div>
                    <div className="sm:col-span-2"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nhu cầu không gian</label><textarea className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 h-24 text-sm" value={editingProject.designDetails?.arch.spaces} onChange={e => updateSubField('arch', 'spaces', e.target.value)} /></div>
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Phong cách</label><input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 font-black text-amber-600" value={editingProject.designDetails?.arch.style} onChange={e => updateSubField('arch', 'style', e.target.value)} /></div>
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Ngân sách</label><input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 font-bold" value={editingProject.designDetails?.arch.budget} onChange={e => updateSubField('arch', 'budget', e.target.value)} /></div>
                  </div>
                )}
            </form>
            
            <div className="p-6 md:p-8 border-t border-slate-100 bg-white flex gap-4 shrink-0">
              <button type="button" onClick={() => setEditingProject(null)} className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Hủy</button>
              <button onClick={handleSaveEdit} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

      {selectedTaskId && <TaskDetailsModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} user={user} />}
    </div>
  );
};

export default ProjectDetail;
