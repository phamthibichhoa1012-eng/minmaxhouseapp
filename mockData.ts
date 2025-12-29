
import { 
  User, UserRole, Project, ProjectType, ProjectStatus, 
  Scope, Task, Priority, DesignPhase, TaskStatus,
  ImageType, TaskImage, DesignRequirements
} from './types';

export interface ExtendedUser extends User {
  phone?: string;
}

export const USERS: ExtendedUser[] = [
  { id: 'u1', name: 'Huỳnh Văn Quân', email: 'mmdesign.thietke@gmail.com', role: UserRole.OWNER, avatar: 'https://picsum.photos/seed/u1/100/100', dob: '1985-05-20', phone: '0901234567' },
  { id: 'u2', name: 'Trần Thị Minh Hiếu', email: 'hieu@minmaxhouse.com', role: UserRole.PM, avatar: 'https://picsum.photos/seed/u2/100/100', dob: '1990-12-15' },
  { id: 'u3', name: 'Đan', email: 'dan@minmaxhouse.com', role: UserRole.DESIGNER, avatar: 'https://picsum.photos/seed/u3/100/100', dob: '1995-08-10' },
  { id: 'u4', name: 'Long', email: 'long@minmaxhouse.com', role: UserRole.DESIGNER, avatar: 'https://picsum.photos/seed/u4/100/100', dob: '1997-03-22' },
  { id: 'u5', name: 'Min', email: 'min@minmaxhouse.com', role: UserRole.VIEWER, avatar: 'https://picsum.photos/seed/u5/100/100', dob: '1998-11-30', phone: '0988888888' },
  { id: 'u6', name: 'Hoàng Thị Mai', email: 'mai@minmaxhouse.com', role: UserRole.DESIGNER, avatar: 'https://picsum.photos/seed/u6/100/100', dob: '2000-01-05' },
];

export const DEFAULT_DRIVE_URL = 'https://drive.google.com/drive/folders/1RLmWKliTiFz0nucqwPCXQkuN0B2gpV-o?usp=sharing';

const DEFAULT_REQUIREMENTS: DesignRequirements = {
  arch: {
    purpose: 'Nhà ở gia đình kết hợp văn phòng nhỏ',
    members: '4 người (Bố mẹ, 2 con nhỏ)',
    habits: 'Thích không gian mở, sinh hoạt chung tại tầng trệt',
    spaces: '4 PN, 5 WC, Phòng thờ tầng thượng, Gara 1 ô tô',
    style: 'Hiện đại tối giản (Minimalism)',
    budget: 'Dưới 3 tỷ',
    special: 'Hướng Tây nên cần giải pháp chống nóng mặt tiền'
  },
  interior: {
    scope: 'Trọn gói phòng khách, bếp và 3 phòng ngủ',
    style: 'Luxury Modern, tông xám ấm',
    usage: 'Thường xuyên nấu ăn, cần bếp đảo rộng',
    materials: 'Gỗ công nghiệp An Cường, mặt đá Vicostone',
    budget: '800 triệu',
    other: 'Cần hệ thống nhà thông minh cơ bản'
  },
  landscape: {
    area: 'Khoảng 50m2 sân sau và ban công',
    style: 'Nhật Bản - Zen Garden',
    functions: 'Hồ cá Koi nhỏ, khu ngồi thiền',
    maintenance: 'Ít chăm sóc, dùng hệ thống tưới tự động',
    lighting: 'Đèn hắt chân tường và đèn lồng đá',
    budget: '150 triệu'
  },
  documents: {
    status: 'Đã có sổ đỏ và bản vẽ hiện trạng từ địa chính',
    notes: 'Khu vực yêu cầu lùi trước 3m, lùi sau 2m',
    landDeedImageUrl: 'https://picsum.photos/seed/deed1/800/1000',
    referenceImageUrls: [
      'https://picsum.photos/seed/refwork1/800/600',
      'https://picsum.photos/seed/refwork2/800/600'
    ]
  }
};

export const PROJECTS: Project[] = [
  {
    id: 'p1', code: 'MM2712202401', name: 'Biệt thự Thảo Điền', type: ProjectType.VILLA,
    address: 'Q2, TP. HCM', landArea: 500, buildArea: 350,
    clientName: 'Anh Minh', clientPhone: '0901234567', clientEmail: 'minh@gmail.com',
    clientCCCD: '012345678901', clientAddress: '45 Lê Lợi, Quận 1, TP. HCM',
    pmId: 'u2', startDate: '2024-01-01', deadline: '2024-06-30', status: ProjectStatus.DESIGNING,
    requirements: 'Phong cách Modern Luxury. Chú trọng không gian thông tầng.',
    designDetails: DEFAULT_REQUIREMENTS,
    driveUrl: DEFAULT_DRIVE_URL
  },
  {
    id: 'p2', code: 'MM2712202402', name: 'Căn hộ Penthouse Landmark', type: ProjectType.APARTMENT,
    address: 'Bình Thạnh, TP. HCM', landArea: 200, buildArea: 200,
    clientName: 'Chị Lan', clientPhone: '0987654321', clientEmail: 'lan@gmail.com',
    clientCCCD: '098765432109', clientAddress: 'Vinhomes Central Park, Bình Thạnh',
    pmId: 'u2', startDate: '2024-02-15', deadline: '2024-04-15', status: ProjectStatus.WAITING_APPROVAL,
    requirements: 'Phong cách Wabi-sabi. Tối ưu bếp và phòng thay đồ.',
    designDetails: {
      ...DEFAULT_REQUIREMENTS,
      arch: { ...DEFAULT_REQUIREMENTS.arch, style: 'Wabi-sabi', purpose: 'Nghỉ dưỡng cuối tuần' }
    },
    driveUrl: DEFAULT_DRIVE_URL
  },
  {
    id: 'p3', code: 'MM2812202401', name: 'Nhà vườn sinh thái Củ Chi', type: ProjectType.GARDEN_HOUSE,
    address: 'Củ Chi, TP. HCM', landArea: 1200, buildArea: 250,
    clientName: 'Bác Hùng', clientPhone: '0912334455', clientEmail: 'hung@gmail.com',
    clientCCCD: '045678912345', clientAddress: 'Thị trấn Củ Chi, TP. HCM',
    pmId: 'u6', startDate: '2024-03-01', deadline: '2024-08-01', status: ProjectStatus.INIT,
    requirements: 'Kiến trúc xanh, kết hợp hồ cá Koi.',
    designDetails: {
      ...DEFAULT_REQUIREMENTS,
      landscape: { ...DEFAULT_REQUIREMENTS.landscape, area: '1000m2', functions: 'Vườn cây ăn trái, nhà chòi BBQ' }
    },
    driveUrl: DEFAULT_DRIVE_URL
  }
];

export const SCOPES: Scope[] = [
  { id: 's1', projectId: 'p1', name: 'Thiết kế Nội thất Tầng 1', type: 'interior', headId: 'u3', progress: 45, deadline: '2024-04-01', status: 'In Progress' },
  { id: 's2', projectId: 'p1', name: 'Kiến trúc Mặt tiền', type: 'architecture', headId: 'u4', progress: 80, deadline: '2024-03-15', status: 'In Progress' },
];

export const TASKS: Task[] = [
  {
    id: 't1', projectId: 'p1', scopeId: 's1', title: 'Phòng khách - Moodboard', 
    description: 'Thiết kế phong cách hiện đại tối giản cho phòng khách chính.',
    assigneeId: 'u3', followerIds: ['u2'], priority: Priority.HIGH, 
    phase: DesignPhase.CONCEPT, status: TaskStatus.IN_PROGRESS,
    startDate: '2024-03-01', deadline: '2024-03-10', revisionCount: 2
  },
  {
    id: 't2', projectId: 'p1', scopeId: 's1', title: 'Triển khai bản vẽ kỹ thuật kệ TV', 
    description: 'Chi tiết thi công gỗ An Cường.',
    assigneeId: 'u3', followerIds: ['u2'], priority: Priority.NORMAL, 
    phase: DesignPhase.TECHNICAL, status: TaskStatus.NEW,
    startDate: '2024-03-05', deadline: '2024-03-12', revisionCount: 0
  },
  {
    id: 't3', projectId: 'p1', scopeId: 's2', title: 'Render 3D mặt tiền chính', 
    description: 'Render ban đêm có ánh sáng đèn.',
    assigneeId: 'u4', followerIds: ['u2'], priority: Priority.URGENT, 
    phase: DesignPhase.THREE_D, status: TaskStatus.NEED_REVISION,
    startDate: '2024-02-20', deadline: '2024-03-05', revisionCount: 3
  }
];

export const TASK_IMAGES: TaskImage[] = [
  { id: 'img1', taskId: 't1', url: 'https://picsum.photos/seed/site1/800/600', type: ImageType.SITE, note: 'Hiện trạng phòng khách chưa cải tạo' },
  { id: 'img2', taskId: 't1', url: 'https://picsum.photos/seed/ref1/800/600', type: ImageType.REF, note: 'Tham khảo tông màu trắng xám' },
  { id: 'img3', taskId: 't3', url: 'https://picsum.photos/seed/edit1/800/600', type: ImageType.TO_EDIT, note: 'Cần sửa lại màu đá ốp mặt tiền', revision: 2 },
  { id: 'img4', taskId: 't3', url: 'https://picsum.photos/seed/final1/800/600', type: ImageType.FINAL, note: 'Bản render đã chốt với khách', isFinal: true }
];
