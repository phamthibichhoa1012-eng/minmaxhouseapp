
import React, { useState, useRef } from 'react';
import { User, UserRole } from '../types';
import { ROLE_LABELS } from '../App';

interface StaffListProps {
  user: User;
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

const StaffList: React.FC<StaffListProps> = ({ user, users, onAddUser, onUpdateUser, onDeleteUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.DESIGNER,
    dob: '',
    phone: '',
    avatar: '',
    newPassword: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSuperAdmin = user.id === 'u1';

  const handleOpenAdd = () => {
    if (!isSuperAdmin) return;
    setEditingStaff(null);
    setShowPasswordChange(false);
    setFormData({ name: '', email: '', role: UserRole.DESIGNER, dob: '', phone: '', avatar: '', newPassword: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (staff: User) => {
    if (!isSuperAdmin && staff.id !== user.id) return;
    
    setEditingStaff(staff);
    setShowPasswordChange(false);
    setFormData({
      name: staff.name,
      email: staff.email,
      role: staff.role,
      dob: staff.dob || '',
      phone: staff.phone || '',
      avatar: staff.avatar || '',
      newPassword: '',
    });
    setIsModalOpen(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff && !isSuperAdmin) return;

    if (editingStaff) {
      const updatedUser: User = {
        ...editingStaff,
        name: isSuperAdmin ? formData.name : editingStaff.name,
        role: isSuperAdmin ? formData.role : editingStaff.role,
        email: formData.email,
        dob: formData.dob,
        phone: formData.phone,
        avatar: formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
      };
      onUpdateUser(updatedUser);
    } else if (isSuperAdmin) {
      const newUser: User = {
        id: `u-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        dob: formData.dob,
        phone: formData.phone,
        avatar: formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
      };
      onAddUser(newUser);
    }
    setIsModalOpen(false);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Chưa cập nhật';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2 md:px-0">
        <div>
          <h1 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight uppercase">Thành viên MINMAX</h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1 uppercase tracking-widest font-bold">Quản trị nhân sự và hồ sơ cá nhân</p>
        </div>
        {isSuperAdmin && (
          <button 
            onClick={handleOpenAdd}
            className="bg-slate-900 hover:bg-amber-600 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 transition-all flex items-center self-stretch sm:self-auto justify-center active:scale-95"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Thêm Nhân sự
          </button>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Thành viên</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Liên hệ</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Ngày sinh</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Vai trò</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(staff => (
                <tr key={staff.id} className={`group hover:bg-slate-50/50 transition-all ${staff.id === user.id ? 'bg-amber-50/20' : ''}`}>
                  <td className="px-6 py-5">
                    <div className="flex items-center">
                      <img src={staff.avatar} className="w-12 h-12 rounded-2xl mr-4 border-2 border-white shadow-sm object-cover" alt="" />
                      <div>
                        <span className="font-bold text-slate-800 block group-hover:text-amber-600 transition-colors">{staff.name}</span>
                        {staff.id === 'u1' && <span className="text-[9px] bg-amber-600 text-white px-1.5 py-0.5 rounded uppercase font-black tracking-tighter">Admin</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm text-slate-700 font-semibold">{staff.email}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{staff.phone || '(Chưa có SĐT)'}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded-lg">{formatDate(staff.dob)}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                      staff.role === UserRole.OWNER ? 'bg-amber-100 text-amber-700 border-amber-200' :
                      staff.role === UserRole.PM ? 'bg-blue-100 text-blue-700 border-blue-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {ROLE_LABELS[staff.role]}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleOpenEdit(staff)}
                        className="opacity-0 group-hover:opacity-100 bg-white border border-slate-200 text-slate-600 hover:text-amber-600 hover:border-amber-200 px-3 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
                      >
                        Sửa
                      </button>
                      {isSuperAdmin && staff.id !== 'u1' && (
                        <button 
                          onClick={() => onDeleteUser(staff.id)}
                          className="opacity-0 group-hover:opacity-100 bg-white border border-red-100 text-red-400 hover:text-white hover:bg-red-500 hover:border-red-500 px-3 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden grid grid-cols-1 gap-4 px-2">
        {users.map(staff => (
          <div key={staff.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group active:scale-[0.98] transition-all">
            <div className="flex items-center mb-4">
              <img src={staff.avatar} className="w-14 h-14 rounded-2xl mr-4 border-2 border-slate-50 object-cover" alt="" />
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-slate-900 truncate">{staff.name}</h3>
                <div className="flex items-center mt-1">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                        staff.role === UserRole.OWNER ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                        {ROLE_LABELS[staff.role]}
                    </span>
                    {staff.id === 'u1' && <span className="ml-2 text-[8px] bg-amber-600 text-white px-1.5 py-0.5 rounded uppercase font-black">Admin</span>}
                </div>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-slate-50">
                <div className="flex items-center text-xs text-slate-600">
                    <svg className="w-4 h-4 mr-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    <span className="truncate">{staff.email}</span>
                </div>
                <div className="flex items-center text-xs text-slate-600">
                    <svg className="w-4 h-4 mr-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    <span>{staff.phone || '(Chưa có SĐT)'}</span>
                </div>
                <div className="flex items-center text-xs text-slate-600">
                    <svg className="w-4 h-4 mr-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span>{formatDate(staff.dob)}</span>
                </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button 
                onClick={() => handleOpenEdit(staff)}
                className="flex-1 py-3 bg-slate-100 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest active:bg-amber-100 active:text-amber-700 transition-all"
              >
                Chỉnh sửa
              </button>
              {isSuperAdmin && staff.id !== 'u1' && (
                <button 
                  onClick={() => onDeleteUser(staff.id)}
                  className="flex-1 py-3 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest active:bg-red-500 active:text-white transition-all"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal chỉnh sửa (giữ nguyên logic modal nhưng tối ưu responsive) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/70 backdrop-blur-md">
            <div className="bg-white w-full max-w-md h-[90vh] sm:h-auto rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl p-6 md:p-8 overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in duration-200 flex flex-col">
            <div className="flex justify-between items-center mb-6 md:mb-8">
                <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase">Hồ sơ thành viên</h2>
                <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Thông tin quản trị</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6 flex-1">
                <div className="flex flex-col items-center mb-6">
                <div onClick={() => fileInputRef.current?.click()} className="relative group cursor-pointer">
                    <img 
                    src={formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'U')}&background=random`} 
                    className="w-24 h-24 md:w-28 md:h-28 rounded-[1.5rem] md:rounded-[2rem] border-4 border-slate-50 shadow-xl object-cover transition-all" 
                    alt="Avatar" 
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-[1.5rem] md:rounded-[2rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
                    </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                <p className="mt-2 text-[9px] font-black text-amber-600 uppercase tracking-widest">Bấm ảnh để đổi đại diện</p>
                </div>

                <div className="space-y-4">
                <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Họ và tên</label>
                    <input 
                    type="text" 
                    required
                    disabled={!isSuperAdmin}
                    className={`w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl p-4 outline-none focus:border-amber-500 transition-all font-bold ${!isSuperAdmin ? 'opacity-60' : ''}`}
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                
                <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email công ty</label>
                    <input 
                    type="email" 
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl p-4 outline-none focus:border-amber-500 transition-all font-semibold"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Ngày sinh</label>
                    <input 
                        type="date" 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl p-4 outline-none focus:border-amber-500 transition-all font-bold text-xs"
                        value={formData.dob}
                        onChange={e => setFormData({...formData, dob: e.target.value})}
                    />
                    </div>
                    <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Vai trò</label>
                    <select 
                        disabled={!isSuperAdmin}
                        className={`w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl p-4 outline-none focus:border-amber-500 transition-all font-black appearance-none text-xs ${!isSuperAdmin ? 'opacity-60' : ''}`}
                        value={formData.role}
                        onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                    >
                        {Object.values(UserRole).map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                    </div>
                </div>
                </div>

                <div className="flex gap-4 pt-6 mt-auto">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Đóng</button>
                    <button type="submit" className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all">Lưu hồ sơ</button>
                </div>
            </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default StaffList;
