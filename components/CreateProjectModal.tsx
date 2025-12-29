
import React, { useState, useEffect, useRef } from 'react';
import { Project, ProjectType, ProjectStatus, UserRole, User, DesignRequirements } from '../types';
import { DEFAULT_DRIVE_URL } from '../mockData';

interface CreateProjectModalProps {
  onClose: () => void;
  onSave: (project: Project) => void;
  existingProjects: Project[];
  users: User[];
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onSave, existingProjects, users }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'arch' | 'interior' | 'landscape' | 'docs'>('general');
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: ProjectType.HOUSE,
    address: '',
    landArea: 0,
    buildArea: 0,
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    pmId: users.find(u => u.role === UserRole.PM || u.role === UserRole.OWNER)?.id || '',
    startDate: new Date().toISOString().split('T')[0],
    deadline: '',
    thumbnailUrl: '',
    driveUrl: DEFAULT_DRIVE_URL,
  });

  const [surveyData, setSurveyData] = useState<DesignRequirements>({
    arch: {
      purpose: '', members: '', habits: '', spaces: '', style: '', budget: '', special: '', constructionTime: '', landStatus: ''
    },
    interior: {
      scope: '', style: '', usage: '', materials: '', budget: '', other: ''
    },
    landscape: {
      area: '', style: '', functions: '', maintenance: '', lighting: '', budget: ''
    },
    documents: {
      status: '', notes: '', landDeedImageUrl: '', referenceImageUrls: [], additionalPhotos: [], regulations: ''
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalPhotosRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    const datePart = `${d}${m}${y}`;
    const prefix = `MM${datePart}`;
    
    const todayProjects = existingProjects.filter(p => p.code.startsWith(prefix));
    const nextId = (todayProjects.length + 1).toString().padStart(2, '0');
    
    setFormData(prev => ({ ...prev, code: `${prefix}${nextId}` }));
  }, [existingProjects]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, thumbnailUrl: reader.result as string }));
      };
      reader.readAsDataURL(file as File);
    }
  };

  const handleAdditionalPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const currentCount = surveyData.documents.additionalPhotos?.length || 0;
      const remainingSlots = 2 - currentCount;
      const fileArray = Array.from(files).slice(0, remainingSlots);

      fileArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSurveyData(prev => ({
            ...prev,
            documents: {
              ...prev.documents,
              additionalPhotos: [...(prev.documents.additionalPhotos || []), reader.result as string].slice(0, 2)
            }
          }));
        };
        reader.readAsDataURL(file as File);
      });
    }
  };

  const removeAdditionalPhoto = (index: number) => {
    setSurveyData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        additionalPhotos: (prev.documents.additionalPhotos || []).filter((_, i) => i !== index)
      }
    }));
  };

  const updateField = (category: keyof DesignRequirements, field: string, value: string) => {
    setSurveyData(prev => ({
      ...prev,
      [category]: { ...prev[category as keyof DesignRequirements] as any, [field]: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.deadline) {
      alert('Vui lòng điền đầy đủ Tên dự án và Hạn chót ở tab Chung');
      setActiveTab('general');
      return;
    }

    const newProject: Project = {
      ...formData,
      id: `p-${Date.now()}`,
      status: ProjectStatus.INIT,
      designDetails: surveyData
    };

    onSave(newProject);
    onClose();
  };

  const tabs = [
    { id: 'general', label: 'Chung', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'arch', label: 'Kiến trúc', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16' },
    { id: 'interior', label: 'Nội thất', icon: 'M3 12l2-2m0 0l7-7 7 7' },
    { id: 'landscape', label: 'Sân vườn', icon: 'M12 19l9 2-9-18-9 18 9-2z' },
    { id: 'docs', label: 'Tài liệu', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col my-8 animate-in zoom-in duration-300 h-[90vh]">
        <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase">Thiết lập Dự án Mới</h2>
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-1">Hồ sơ khảo sát MINMAXHOUSE</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex border-b border-slate-50 bg-white overflow-x-auto no-scrollbar shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[100px] py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-2 border-b-2 transition-all ${
                activeTab === tab.id ? 'bg-amber-50/30 border-amber-500 text-amber-600' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon}></path></svg>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar bg-slate-50/20">
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="flex flex-col items-center">
                <div onClick={() => fileInputRef.current?.click()} className="w-full max-w-md h-40 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all overflow-hidden relative group bg-white shadow-sm">
                  {formData.thumbnailUrl ? (
                    <img src={formData.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <svg className="w-8 h-8 text-amber-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ảnh đại diện công trình</p>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Tên Dự án *</label><input type="text" className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 focus:border-amber-500 outline-none font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 ml-1 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z"></path></svg>
                    Google Drive (Link upload ảnh)
                  </label>
                  <input 
                    type="url" 
                    className="w-full bg-blue-50/50 border-2 border-blue-100 rounded-2xl p-4 outline-none focus:border-blue-500 font-mono text-xs text-blue-700" 
                    value={formData.driveUrl} 
                    onChange={e => setFormData({...formData, driveUrl: e.target.value})} 
                    placeholder="Dán link Drive dự án vào đây..."
                  />
                  <p className="text-[9px] text-slate-400 mt-1 ml-1">* Nhân sự sẽ upload ảnh thi công/hiện trạng vào Drive này.</p>
                </div>

                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Mã Dự án</label><input type="text" className="w-full bg-slate-100 border-2 border-slate-100 rounded-2xl p-4 font-mono font-black text-amber-600 outline-none" value={formData.code} readOnly /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Loại Công trình</label><select className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-amber-500 font-bold text-xs shadow-sm" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ProjectType})}>{Object.values(ProjectType).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div className="md:col-span-2"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Địa chỉ thi công</label><input type="text" className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-amber-500 text-sm font-medium shadow-sm" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Tên khách hàng</label><input type="text" className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-amber-500 font-bold shadow-sm" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Số điện thoại</label><input type="tel" className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-amber-500 font-mono font-bold shadow-sm" value={formData.clientPhone} onChange={e => setFormData({...formData, clientPhone: e.target.value})} /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Hạn chót *</label><input type="date" required className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-amber-500 font-bold shadow-sm" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">PM Phụ trách</label><select className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-amber-500 font-bold text-xs shadow-sm" value={formData.pmId} onChange={e => setFormData({...formData, pmId: e.target.value})}>{users.filter(u => u.role !== UserRole.VIEWER).map(u => (<option key={u.id} value={u.id}>{u.name}</option>))}</select></div>
              </div>
            </div>
          )}

          {activeTab === 'arch' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-amber-500 pl-3">🏠 1. CÂU HỎI KIẾN TRÚC</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Thời gian dự kiến xây</label><input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500" value={surveyData.arch.constructionTime} onChange={e => updateField('arch', 'constructionTime', e.target.value)} /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tình trạng đất</label><input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500" value={surveyData.arch.landStatus} onChange={e => updateField('arch', 'landStatus', e.target.value)} /></div>
                <div className="md:col-span-2"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mục đích sử dụng</label><input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500" value={surveyData.arch.purpose} onChange={e => updateField('arch', 'purpose', e.target.value)} placeholder="Nhà ở GĐ, Nghỉ dưỡng..." /></div>
                <div className="md:col-span-2"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Thành viên sinh sống</label><textarea className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 h-20 text-sm" value={surveyData.arch.members} onChange={e => updateField('arch', 'members', e.target.value)} placeholder="Số lượng, độ tuổi, yêu cầu đặc thù..." /></div>
                <div className="md:col-span-2"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nhu cầu không gian chính</label><textarea className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 h-24 text-sm" value={surveyData.arch.spaces} onChange={e => updateField('arch', 'spaces', e.target.value)} placeholder="Số PN, WC, Gara, Phòng thờ..." /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Phong cách mong muốn</label><input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 font-bold text-amber-600" value={surveyData.arch.style} onChange={e => updateField('arch', 'style', e.target.value)} /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Ngân sách xây dự kiến</label><input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 font-bold" value={surveyData.arch.budget} onChange={e => updateField('arch', 'budget', e.target.value)} /></div>
              </div>
            </div>
          )}

          {activeTab === 'interior' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-blue-500 pl-3">🛋️ 2. CÂU HỎI NỘI THẤT</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Phạm vi thiết kế</label><textarea className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 h-20 text-sm" value={surveyData.interior.scope} onChange={e => updateField('interior', 'scope', e.target.value)} placeholder="Phòng khách, bếp, PN..." /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Gu nội thất</label><input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 font-bold text-blue-600" value={surveyData.interior.style} onChange={e => updateField('interior', 'style', e.target.value)} /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Vật liệu mong muốn</label><input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500" value={surveyData.interior.materials} onChange={e => updateField('interior', 'materials', e.target.value)} /></div>
                <div className="md:col-span-2"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nhu cầu sử dụng đặc thù</label><textarea className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 h-20 text-sm" value={surveyData.interior.usage} onChange={e => updateField('interior', 'usage', e.target.value)} /></div>
              </div>
            </div>
          )}

          {activeTab === 'landscape' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-green-500 pl-3">🌿 3. CÂU HỎI SÂN VƯỜN</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Diện tích & Hiện trạng</label><input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500" value={surveyData.landscape.area} onChange={e => updateField('landscape', 'area', e.target.value)} /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Phong cách sân vườn</label><input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 font-bold text-green-600" value={surveyData.landscape.style} onChange={e => updateField('landscape', 'style', e.target.value)} /></div>
                <div className="md:col-span-2"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nhu cầu chức năng</label><textarea className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 h-24 text-sm" value={surveyData.landscape.functions} onChange={e => updateField('landscape', 'functions', e.target.value)} placeholder="Hồ cá Koi, BBQ, Khu chơi trẻ em..." /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Bảo dưỡng & Ánh sáng</label><input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500" value={surveyData.landscape.maintenance} onChange={e => updateField('landscape', 'maintenance', e.target.value)} /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Ngân sách dự kiến</label><input type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500" value={surveyData.landscape.budget} onChange={e => updateField('landscape', 'budget', e.target.value)} /></div>
              </div>
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-indigo-500 pl-3">📎 4. TÀI LIỆU & PHÁP LÝ</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Ảnh hồ sơ bổ sung (Tối đa 2 ảnh)</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {surveyData.documents.additionalPhotos?.map((photo, index) => (
                      <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm">
                        <img src={photo} className="w-full h-full object-cover" alt="" />
                        <button type="button" onClick={() => removeAdditionalPhoto(index)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                      </div>
                    ))}
                    {(surveyData.documents.additionalPhotos?.length || 0) < 2 && (
                      <div onClick={() => additionalPhotosRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all bg-white">
                        <svg className="w-6 h-6 text-slate-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        <span className="text-[9px] font-black text-slate-400 uppercase">Thêm ảnh</span>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={additionalPhotosRef} className="hidden" accept="image/*" multiple onChange={handleAdditionalPhotosChange} />
                </div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tình trạng tài liệu hiện có</label><textarea className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 h-20 text-sm" value={surveyData.documents.status} onChange={e => updateField('documents', 'status', e.target.value)} placeholder="Sổ đỏ, hiện trạng..." /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Quy định xây dựng khu vực</label><textarea className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 focus:border-amber-500 h-20 text-sm" value={surveyData.documents.regulations} onChange={e => updateField('documents', 'regulations', e.target.value)} /></div>
              </div>
            </div>
          )}
        </form>

        <div className="p-6 md:p-8 border-t border-gray-100 bg-white flex gap-4 shrink-0">
          <button type="button" onClick={onClose} className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Hủy bỏ</button>
          <button type="submit" onClick={handleSubmit} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-amber-600 transition-all active:scale-95">Khởi tạo & Lưu hồ sơ</button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
