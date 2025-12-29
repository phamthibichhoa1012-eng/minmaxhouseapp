
import React from 'react';
import { User, UserRole, Project } from '../types';
import { TASKS } from '../mockData';
import { ROLE_LABELS } from '../App';

interface ReportsProps {
  user: User;
  projects: Project[];
  users: User[];
}

const Reports: React.FC<ReportsProps> = ({ user, projects, users }) => {
  const isManagement = user.role === UserRole.OWNER || user.role === UserRole.PM;

  if (!isManagement) {
    return <div className="p-10 text-center">Bạn không có quyền truy cập báo cáo.</div>;
  }

  const projectCompletion = projects.map(p => {
    const pTasks = TASKS.filter(t => t.projectId === p.id);
    const completed = pTasks.filter(t => t.status === 'Hoàn thành' || t.status === 'Đã duyệt').length;
    return { name: p.name, percentage: pTasks.length > 0 ? (completed / pTasks.length) * 100 : 0 };
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Báo cáo Hoạt động</h1>
        <p className="text-gray-500">Phân tích hiệu suất dự án và nhân sự</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-6">Hiệu suất theo Dự án (%)</h2>
          <div className="space-y-6">
            {projectCompletion.length > 0 ? projectCompletion.map(p => (
              <div key={p.name}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{p.name}</span>
                  <span className="text-sm font-bold text-amber-600">{Math.round(p.percentage)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="bg-amber-500 h-3 rounded-full shadow-inner" style={{ width: `${p.percentage}%` }}></div>
                </div>
              </div>
            )) : <p className="text-center text-gray-400">Chưa có dữ liệu dự án</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-6">Thống kê nhân sự</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-gray-400 uppercase font-bold border-b border-gray-100">
                  <th className="pb-3">Thành viên</th>
                  <th className="pb-3">Vai trò</th>
                  <th className="pb-3">Đang làm</th>
                  <th className="pb-3">Trễ hạn</th>
                  <th className="pb-3">Avg Revisions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.filter(u => u.role === UserRole.DESIGNER || u.role === UserRole.PM).map(member => {
                  const mTasks = TASKS.filter(t => t.assigneeId === member.id);
                  const activeTasks = mTasks.filter(t => t.status !== 'Hoàn thành').length;
                  const lateTasks = mTasks.filter(t => new Date(t.deadline) < new Date()).length;
                  const totalRevisions = mTasks.reduce((acc, t) => acc + t.revisionCount, 0);
                  const avgRev = mTasks.length > 0 ? (totalRevisions / mTasks.length).toFixed(1) : 0;

                  return (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="py-4">
                        <div className="flex items-center">
                          <img src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`} className="w-8 h-8 rounded-full mr-3" alt="" />
                          <span className="text-sm font-bold text-gray-700">{member.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-xs text-gray-500 font-medium">{ROLE_LABELS[member.role]}</td>
                      <td className="py-4"><span className="text-sm font-semibold">{activeTasks}</span></td>
                      <td className="py-4"><span className="text-sm font-bold text-red-500">{lateTasks}</span></td>
                      <td className="py-4"><span className="text-sm font-mono">{avgRev}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
