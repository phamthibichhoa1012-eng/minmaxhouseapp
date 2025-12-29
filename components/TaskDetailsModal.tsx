
import React, { useState, useRef, useEffect } from 'react';
import { User, Task, TaskImage, TaskFile, Comment, TaskStatus, ImageType, Priority, DesignPhase, Project } from '../types';
import { TASKS, TASK_IMAGES, USERS, PROJECTS } from '../mockData';
import { ROLE_LABELS } from '../App';
import { generateProfessionalRender } from '../lib/gemini';

interface TaskDetailsModalProps {
  taskId: string;
  onClose: () => void;
  user: User;
}

const DESIGN_STYLES = [
  { id: 'Modern', label: 'Hiện đại', icon: '🏢' },
  { id: 'Minimalism', label: 'Tối giản', icon: '⚪' },
  { id: 'Luxury', label: 'Sang trọng', icon: '✨' },
  { id: 'Indochine', label: 'Đông Dương', icon: '🏮' },
  { id: 'Wabi-sabi', label: 'Wabi-sabi', icon: '🌿' },
  { id: 'Neo Classical', label: 'Tân cổ điển', icon: '🏛️' },
  { id: 'Industrial', label: 'Công nghiệp', icon: '🏗️' },
];

const ASPECT_RATIOS = [
  { id: '16:9', label: '16:9 (Ngang)' },
  { id: '4:3', label: '4:3 (Vừa)' },
  { id: '1:1', label: '1:1 (Vuông)' },
  { id: '9:16', label: '9:16 (Dọc)' },
];

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ taskId, onClose, user }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'images' | 'ai-studio' | 'comments'>('info');
  const [imageFolder, setImageFolder] = useState<ImageType>(ImageType.SITE);
  
  // Render Studio State
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Modern');
  const [selectedRatio, setSelectedRatio] = useState<any>('16:9');
  const [isHighQuality, setIsHighQuality] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [selectedSourceImg, setSelectedSourceImg] = useState<string | null>(null);
  const [taskImages, setTaskImages] = useState<TaskImage[]>(() => TASK_IMAGES.filter(img => img.taskId === taskId));
  
  const uploadRefInput = useRef<HTMLInputElement>(null);

  const task = TASKS.find(t => t.id === taskId);
  if (!task) return null;

  const project = PROJECTS.find(p => p.id === task.projectId);
  const assignee = USERS.find(u => u.id === task.assigneeId);
  const filteredImages = taskImages.filter(img => img.type === imageFolder);

  const handleStartRender = async () => {
    if (!aiPrompt && !selectedSourceImg) return;
    setIsAiLoading(true);
    
    // Tạo prompt kết hợp bối cảnh ảnh nguồn nếu có
    const finalPrompt = selectedSourceImg 
      ? `Transform this architectural photo into ${selectedStyle} style. ${aiPrompt}. Maintain structural integrity but upgrade all materials, lighting, and furniture.`
      : `${aiPrompt}`;

    const result = await generateProfessionalRender({
      prompt: finalPrompt || `Render a high-end ${selectedStyle} architectural space`,
      style: selectedStyle,
      aspectRatio: selectedRatio,
      isHighQuality: isHighQuality,
      sourceImage: selectedSourceImg || undefined
    });

    if (result) setAiResult(result);
    setIsAiLoading(false);
  };

  const handleLocalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedSourceImg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveToLibrary = () => {
    if (!aiResult) return;
    const newImg: TaskImage = {
      id: `ai-${Date.now()}`,
      taskId,
      url: aiResult,
      type: ImageType.AI_GEN,
      note: `AI Render - Style ${selectedStyle}`,
      isFinal: false
    };
    setTaskImages(prev => [newImg, ...prev]);
    alert("Đã lưu ảnh AI vào thư viện dự án!");
    setActiveTab('images');
    setImageFolder(ImageType.AI_GEN);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-6xl h-[92vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full">{task.phase}</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full">{task.status}</span>
              {project && <span className="text-xs font-bold text-slate-400">/ {project.name}</span>}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">{task.title}</h2>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-200">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex border-b border-slate-100 px-8 space-x-10 bg-white overflow-x-auto no-scrollbar shrink-0">
          {(['info', 'images', 'ai-studio', 'comments'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-6 text-xs font-black uppercase tracking-[0.2em] border-b-2 transition-all whitespace-nowrap flex items-center ${
                activeTab === tab ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-300 hover:text-slate-500'
              }`}
            >
              {tab === 'ai-studio' && <span className="mr-2 text-indigo-500">✨</span>}
              {tab === 'info' ? 'Chi tiết' : tab === 'images' ? 'Hình ảnh' : tab === 'ai-studio' ? 'AI Render Studio' : 'Thảo luận'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-white min-h-0 custom-scrollbar">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Nội dung thực hiện</h3>
                  <p className="text-slate-700 leading-relaxed font-medium bg-slate-50 p-6 rounded-3xl italic">"{task.description}"</p>
                </div>
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Độ ưu tiên</h3>
                    <p className={`font-black uppercase tracking-widest text-sm ${task.priority === Priority.URGENT ? 'text-red-500' : 'text-blue-500'}`}>{task.priority}</p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phiên bản sửa lỗi</h3>
                    <p className="font-black text-slate-800 text-sm">V{task.revisionCount}</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-950 p-8 rounded-[2.5rem] text-white space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div>
                  <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-6">Designer phụ trách</h3>
                  <div className="flex items-center space-x-4">
                    <img src={assignee?.avatar} className="w-14 h-14 rounded-2xl border-2 border-white/10 shadow-xl object-cover" alt="" />
                    <div>
                      <p className="font-black text-lg">{assignee?.name}</p>
                      <p className="text-[10px] text-white/50 uppercase font-black tracking-widest">{assignee ? ROLE_LABELS[assignee.role] : ''}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 pt-8 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-white/30 uppercase">Bắt đầu</span>
                    <span className="font-bold text-sm">{task.startDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-white/30 uppercase">Hạn chót</span>
                    <span className="font-black text-sm text-red-400 uppercase tracking-widest">{task.deadline}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai-studio' && (
            <div className="h-full flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
              {/* Controls Sidebar */}
              <div className="w-full lg:w-80 space-y-6 flex flex-col shrink-0">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phong cách kiến trúc</label>
                  <div className="grid grid-cols-2 gap-2">
                    {DESIGN_STYLES.map(style => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`p-3 rounded-2xl border-2 text-[10px] font-black uppercase transition-all flex flex-col items-center gap-1 ${
                          selectedStyle === style.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        <span className="text-lg">{style.icon}</span>
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tỷ lệ khung hình</label>
                  <div className="flex flex-wrap gap-2">
                    {ASPECT_RATIOS.map(ratio => (
                      <button
                        key={ratio.id}
                        onClick={() => setSelectedRatio(ratio.id)}
                        className={`px-3 py-2 rounded-xl border-2 text-[9px] font-black uppercase transition-all ${
                          selectedRatio === ratio.id ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-slate-100 text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                   <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Render chất lượng cao (Pro)</label>
                      <button 
                        onClick={() => setIsHighQuality(!isHighQuality)}
                        className={`w-10 h-6 rounded-full transition-all relative ${isHighQuality ? 'bg-indigo-600' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isHighQuality ? 'left-5' : 'left-1'}`}></div>
                      </button>
                   </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả chi tiết (AI Prompt)</label>
                  <textarea 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Mô tả ánh sáng, vật liệu cụ thể... Ví dụ: 'Tường ốp đá Marble, ánh sáng chiều tà hắt qua cửa sổ, thêm nhiều cây xanh...'"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium focus:border-indigo-500 outline-none h-32 resize-none transition-all"
                  />
                  <button 
                    onClick={handleStartRender}
                    disabled={isAiLoading || (!aiPrompt && !selectedSourceImg)}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 disabled:opacity-50 shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    {isAiLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang kiến tạo...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        <span>Bắt đầu Render</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Main Canvas Area */}
              <div className="flex-1 flex flex-col gap-6">
                <div className="bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex-1 relative overflow-hidden flex items-center justify-center group/canvas">
                  {aiResult ? (
                    <div className="w-full h-full relative group">
                      <img src={aiResult} className="w-full h-full object-contain" alt="AI Render" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                        <div className="flex gap-4">
                          <button onClick={() => setAiResult(null)} className="px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">Hủy kết quả</button>
                          <button onClick={handleSaveToLibrary} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">Lưu vào thư viện</button>
                        </div>
                        <p className="text-white text-[10px] font-black uppercase tracking-widest">Kích thước: 1K HD ({selectedRatio})</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-12 max-w-sm">
                      {selectedSourceImg ? (
                        <div className="relative group">
                          <img src={selectedSourceImg} className="max-h-[350px] rounded-3xl shadow-2xl mx-auto border-8 border-white" alt="Reference" />
                          <button 
                            onClick={() => setSelectedSourceImg(null)} 
                            className="absolute -top-4 -right-4 p-3 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform active:scale-95"
                            title="Xóa ảnh nguồn"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                          <div className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></span>
                            Đang dùng làm bối cảnh gốc
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-8 text-indigo-500 animate-pulse">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          </div>
                          <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Architectural Canvas</h4>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-loose">Chọn một ảnh hiện trạng hoặc ảnh ý tưởng từ thư viện nhiệm vụ để AI render dựa trên bối cảnh thực tế.</p>
                        </>
                      )}
                    </div>
                  )}
                  {isAiLoading && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center z-20">
                      <div className="relative">
                        <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                      </div>
                      <p className="text-white font-black uppercase tracking-[0.4em] text-xs mt-8 animate-pulse text-center">AI đang kiến tạo không gian mới...</p>
                      <p className="text-white/40 text-[9px] uppercase font-bold mt-2 tracking-widest">Thời gian dự kiến: 15-30 giây</p>
                    </div>
                  )}
                </div>

                {/* Source Selection Area */}
                <div className="shrink-0 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center space-x-2">
                       <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Thư viện ảnh nguồn (Render from Image)</h5>
                       <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded text-[8px] font-black uppercase">Chuyên dụng</span>
                    </div>
                    <button 
                      onClick={() => uploadRefInput.current?.click()}
                      className="px-5 py-2.5 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all border-2 border-slate-100 shadow-sm flex items-center"
                    >
                      <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                      Tải ảnh tham khảo
                    </button>
                    <input type="file" ref={uploadRefInput} className="hidden" accept="image/*" onChange={handleLocalUpload} />
                  </div>
                  
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {taskImages.map(img => (
                      <button 
                        key={img.id} 
                        onClick={() => setSelectedSourceImg(selectedSourceImg === img.url ? null : img.url)}
                        className={`h-24 aspect-square rounded-2xl overflow-hidden border-4 transition-all shrink-0 relative group shadow-sm ${
                          selectedSourceImg === img.url ? 'border-indigo-500 scale-105 shadow-xl z-10' : 'border-white opacity-60 hover:opacity-100 hover:scale-105'
                        }`}
                      >
                        <img src={img.url} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                           <div className="bg-white/90 p-2 rounded-lg text-indigo-600">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                           </div>
                        </div>
                        {selectedSourceImg === img.url && (
                           <div className="absolute top-1 right-1 bg-indigo-500 text-white p-1 rounded-md">
                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                           </div>
                        )}
                      </button>
                    ))}
                    {taskImages.length === 0 && (
                      <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl px-12 w-full bg-white/50">
                         <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest text-center">Chưa có ảnh tư liệu. Hãy tải lên ảnh hiện trạng hoặc moodboard ý tưởng.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="flex gap-4 overflow-x-auto no-scrollbar border-b border-slate-50 pb-4">
                {Object.values(ImageType).map(type => (
                  <button
                    key={type}
                    onClick={() => setImageFolder(type)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      imageFolder === type ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {type} ({taskImages.filter(img => img.type === type).length})
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {filteredImages.map(img => (
                  <div key={img.id} className="relative group rounded-[2rem] overflow-hidden border border-slate-100 shadow-xl bg-white aspect-square">
                    <img src={img.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                      <button className="p-3 bg-white rounded-2xl text-slate-900 shadow-xl hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></button>
                      <button onClick={() => {setSelectedSourceImg(img.url); setActiveTab('ai-studio');}} className="p-3 bg-indigo-500 rounded-2xl text-white shadow-xl hover:scale-110 transition-transform" title="Sử dụng làm ảnh gốc AI"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></button>
                    </div>
                    {img.type === ImageType.AI_GEN && (
                      <div className="absolute top-4 left-4 px-3 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase rounded-full shadow-lg">AI Generated</div>
                    )}
                  </div>
                ))}
                {filteredImages.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Không có hình ảnh trong mục này</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
