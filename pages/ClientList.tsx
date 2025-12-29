
import React, { useState } from 'react';
import { Project, User } from '../types';
import { Link } from 'react-router-dom';
import { TASKS } from '../mockData';

interface ClientListProps {
  user: User;
  projects: Project[];
  onUpdateProjects?: (updatedProjects: Project[]) => void;
}

interface ClientProfile {
  name: string;
  phone: string;
  email: string;
  address?: string;
  cccd?: string;
  projects: Project[];
}

const ClientList: React.FC<ClientListProps> = ({ user, projects, onUpdateProjects }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<ClientProfile | null>(null);
  const [originalKey, setOriginalKey] = useState<string | null>(null);

  const isSuperAdmin = user.id === 'u1';

  // LOGIC LỌC DỰ ÁN ĐỂ LẤY DANH SÁCH KHÁCH HÀNG TƯƠNG ỨNG
  const visibleProjects = projects.filter(p => {
    if (isSuperAdmin) return true;
    if (p.pmId === user.id) return true;
    return TASKS.some(t => t.projectId === p.id && t.assigneeId === user.id);
  });

  // Tổng hợp khách hàng duy nhất dựa trên SĐT hoặc Email từ danh sách dự án ĐÃ LỌC
  const clientsMap = new Map<string, ClientProfile>();

  visibleProjects.forEach(p => {
    const key = p.clientPhone || p.clientEmail;
    if (!clientsMap.has(key)) {
      clientsMap.set(key, {
        name: p.clientName,
        phone: p.clientPhone,
        email: p.clientEmail,
        address: p.clientAddress,
        cccd: p.clientCCCD,
        projects: [p]
      });
    } else {
      const existing = clientsMap.get(key)!;
      if (!existing.projects.some(proj => proj.id === p.id)) {
        existing.projects.push(p);
      }
    }
  });

  const clients = Array.from(clientsMap.values()).filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const handleEditClick = (client: ClientProfile) => {
    if (!isSuperAdmin) {
        alert("Chỉ Admin tối cao mới có quyền sửa hồ sơ gốc của khách hàng.");
        return;
    }
    setEditingClient({ ...client });
    setOriginalKey(client.phone || client.email);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !onUpdateProjects || !originalKey) return;

    // Cập nhật tất cả các dự án có cùng thông tin khách hàng cũ
    const updatedProjectsList = projects.map(p => {
      const pKey = p.clientPhone || p.clientEmail;
      if (pKey === originalKey) {
        return {
          ...p,
          clientName: editingClient.name,
          clientPhone: editingClient.phone,
          clientEmail: editingClient.email,
          clientAddress: editingClient.address,
          clientCCCD: editingClient.cccd
        };
      }
      return p;
    });

    onUpdateProjects(updatedProjectsList);
    setEditingClient(null);
    setOriginalKey(null);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">Danh mục Khách hàng</h1>
          <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] md:text-xs tracking-[0.2em]">
            {isSuperAdmin ? 'Quản lý dữ liệu toàn bộ khách hàng' : 'Khách hàng trong các dự án của bạn'}
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc SĐT..." 
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:border-amber-500 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.length > 0 ? clients.map((client, idx) => (
          <div key={idx} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 md:p-8 hover:shadow-2xl hover:border-amber-100 transition-all group overflow-hidden relative flex flex-col">
            {isSuperAdmin && (
                <button 
                onClick={() => handleEditClick(client)}
                className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-amber-600 hover:text-white shadow-sm"
                title="Chỉnh sửa hồ sơ khách hàng"
                >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
            )}

            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-950 text-amber-500 flex items-center justify-center text-xl font-black shadow-lg flex-shrink-0">
                {client.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-slate-900 text-lg group-hover:text-amber-600 transition-colors truncate">{client.name}</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Mã đối tác: MM-CL{idx + 100}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8 flex-1">
              <div className="flex items-center text-xs text-slate-600 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                <svg className="w-4 h-4 mr-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                {client.phone}
              </div>
              <div className="flex items-center text-xs text-slate-600 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <span className="truncate">{client.email}</span>
              </div>
              {client.address && (
                <div className="flex items-start text-[11px] text-slate-400 font-medium leading-relaxed italic">
                  <svg className="w-4 h-4 mr-3 mt-0.5 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  {client.address}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Dự án của khách ({client.projects.length})</h4>
              <div className="space-y-2">
                {client.projects.map(p => (
                  <Link key={p.id} to={`/projects/${p.id}`} className="block p-2 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-700 hover:bg-amber-600 hover:text-white transition-all truncate">
                    &bull; {p.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-8 flex gap-3">
               <a href={`tel:${client.phone}`} className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-center text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-colors active:scale-95 shadow-lg">Gọi điện</a>
               <a href={`mailto:${client.email}`} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-center text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors active:scale-95 shadow-sm">Email</a>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-300 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
             <svg className="w-16 h-16 mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
             <p className="text-sm font-bold uppercase tracking-widest">Không có khách hàng nào hiển thị</p>
             <p className="text-[10px] mt-2 px-10 text-center">Bạn chỉ thấy khách hàng của các dự án mà mình đang trực tiếp thực hiện.</p>
          </div>
        )}
      </div>

      {/* MODAL CHỈNH SỬA HỒ SƠ KHÁCH HÀNG (CHỈ ADMIN) */}
      {editingClient && isSuperAdmin && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Cập nhật hồ sơ gốc</h2>
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-1">Dữ liệu này sẽ cập nhật tất cả dự án liên quan</p>
              </div>
              <button onClick={() => setEditingClient(null)} className="p-3 hover:bg-white rounded-2xl text-slate-300 hover:text-slate-900 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Họ và tên</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-amber-500 transition-all font-bold"
                  value={editingClient.name}
                  onChange={e => setEditingClient({...editingClient, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Số điện thoại</label>
                  <input 
                    type="tel" 
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-amber-500 transition-all font-mono font-bold"
                    value={editingClient.phone}
                    onChange={e => setEditingClient({...editingClient, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Số CCCD</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-amber-500 transition-all font-mono font-bold"
                    value={editingClient.cccd || ''}
                    onChange={e => setEditingClient({...editingClient, cccd: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email liên lạc</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-amber-500 transition-all font-semibold"
                  value={editingClient.email}
                  onChange={e => setEditingClient({...editingClient, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Địa chỉ thường trú</label>
                <textarea 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-amber-500 transition-all min-h-[100px] text-sm"
                  value={editingClient.address || ''}
                  onChange={e => setEditingClient({...editingClient, address: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setEditingClient(null)} 
                  className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-amber-600 transition-all active:scale-95"
                >
                  Lưu thay đổi hồ sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;
