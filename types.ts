
export enum UserRole {
  OWNER = 'OWNER',
  PM = 'PM',
  DESIGNER = 'DESIGNER',
  VIEWER = 'VIEWER'
}

export enum ProjectStatus {
  INIT = 'Khởi tạo',
  DESIGNING = 'Đang thiết kế',
  WAITING_APPROVAL = 'Chờ duyệt',
  CONSTRUCTING = 'Đang thi công',
  COMPLETED = 'Hoàn thành',
  ARCHIVED = 'Lưu trữ'
}

export enum ProjectType {
  HOUSE = 'Nhà phố',
  VILLA = 'Biệt thự',
  GARDEN_HOUSE = 'Nhà vườn',
  APARTMENT = 'Căn hộ',
  OFFICE = 'Văn phòng',
  OTHER = 'Khác'
}

export enum DesignPhase {
  SURVEY = 'Khảo sát',
  CONCEPT = 'Concept',
  THREE_D = '3D',
  TECHNICAL = 'Hồ sơ kỹ thuật',
  HANDOVER = 'Bàn giao'
}

export enum TaskStatus {
  NEW = 'Mới',
  IN_PROGRESS = 'Đang thực hiện',
  WAITING_FEEDBACK = 'Chờ phản hồi',
  NEED_REVISION = 'Cần chỉnh sửa',
  APPROVED = 'Đã duyệt',
  DONE = 'Hoàn thành'
}

export enum Priority {
  LOW = 'Thấp',
  NORMAL = 'Bình thường',
  HIGH = 'Cao',
  URGENT = 'Khẩn cấp'
}

export enum ImageType {
  SITE = 'Hiện trạng',
  REF = 'Tham khảo',
  TO_EDIT = 'Chỉnh sửa',
  FINAL = 'Hoàn thành',
  AI_GEN = 'AI Gợi ý'
}

export enum WorkSession {
  MORNING = 'Sáng',
  AFTERNOON = 'Chiều',
  FULL_DAY = 'Cả ngày',
  OFF = 'Nghỉ'
}

export interface WorkRegistration {
  id: string;
  userId: string;
  date: string; // ISO Date YYYY-MM-DD
  session: WorkSession;
  note?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  dob?: string;
  phone?: string;
}

// Bộ hồ sơ khảo sát chi tiết cập nhật theo yêu cầu
export interface DesignRequirements {
  arch: {
    purpose: string;
    members: string;
    habits: string;
    spaces: string;
    style: string;
    budget: string;
    special: string;
    constructionTime?: string;
    landStatus?: string;
  };
  interior: {
    scope: string;
    style: string;
    usage: string;
    materials: string;
    budget: string;
    other: string;
  };
  landscape: {
    area: string;
    style: string;
    functions: string;
    maintenance: string;
    lighting: string;
    budget: string;
  };
  documents: {
    status: string;
    notes: string;
    landDeedImageUrl?: string;
    referenceImageUrls?: string[];
    additionalPhotos?: string[]; // Thêm ảnh pháp lý/hồ sơ bổ sung
    regulations?: string;
  };
}

export interface Project {
  id: string;
  code: string;
  name: string;
  type: ProjectType;
  address: string;
  landArea: number;
  buildArea: number;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientCCCD?: string;
  clientAddress?: string;
  pmId: string;
  startDate: string;
  deadline: string;
  status: ProjectStatus;
  thumbnailUrl?: string;
  requirements?: string;
  designDetails?: DesignRequirements;
  driveUrl?: string;
  aiConceptSuggestion?: string; 
}

export interface Scope {
  id: string;
  projectId: string;
  name: string;
  type: 'architecture' | 'interior' | 'landscape' | 'other';
  headId: string;
  progress: number;
  deadline: string;
  status: string;
}

export interface Task {
  id: string;
  projectId: string;
  scopeId: string;
  title: string;
  description: string;
  assigneeId: string;
  followerIds: string[];
  priority: Priority;
  phase: DesignPhase;
  status: TaskStatus;
  startDate: string;
  deadline: string;
  revisionCount: number;
}

export interface TaskImage {
  id: string;
  taskId: string;
  url: string;
  type: ImageType;
  note: string;
  revision?: number;
  isFinal?: boolean;
}

export interface TaskFile {
  id: string;
  taskId: string;
  name: string;
  url: string;
  type: string;
  version: string;
  uploaderId: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
}
