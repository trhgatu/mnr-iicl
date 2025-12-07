export enum ContainerType {
  GP20 = '20GP',
  GP40 = '40GP',
  HC40 = '40HC',
  HC45 = '45HC',
  RF20 = '20RF',
  RF40 = '40RF',
  OT = 'Open Top',
  FR = 'Flat Rack'
}

export enum InspectionStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  PASSED = 'Đạt',
  REPAIR_NEEDED = 'Cần sửa chữa',
  FAILED = 'Không đạt',
  QUOTATION_SENT = 'Đã có báo giá'
}

export enum QuotationStatus {
  DRAFT = 'Nháp',
  SENT = 'Đã gửi',
  APPROVED = 'Đã duyệt',
  REJECTED = 'Từ chối'
}

export interface CatalogItem {
  code: string;
  description: string;
}

// Mô phỏng dòng dữ liệu từ file Excel IICL
export interface IICLItem {
  id: string;
  maIICL: string;
  maNoiBo?: string;
  moTa: string;
  nhomHuHong: string;
  viTriMacDinh?: string;
  ghiChu?: string;
  mucDo?: 'Nhẹ' | 'Vừa' | 'Nặng';
}

export interface DetectedDefect {
  id: string;
  iiclCode: string;
  description: string;
  location: string; // Panel, khu vực
  severity: string;
  confidence: number;
}

export interface AIOutputDefect {
  type: string;
  location: string;
  severity: string;
  size: string;
  confidence?: number;
}

export interface ImageUpload {
  file: File;
  previewUrl: string;
}

export interface FaceData {
  id: string;
  name: string;
  images: ImageUpload[]; // Changed to support file object and preview URL
  defects: DetectedDefect[];
  status: 'pending' | 'analyzing' | 'completed';
}

export interface InspectionRecord {
  _id: string; // From MongoDB
  id: string; // Can be mapped from _id
  containerId: string;
  containerType: ContainerType;
  owner: string;
  depot: string;
  inspectionDate: string;
  status: InspectionStatus;
  images: string[]; // Paths to images
  damages: DetectedDefect[];
  user: string; // User ID
  createdAt: string;
}

export interface QuotationItem {
  _id?: string;
  description: string;
  code?: string;
  quantity: number;
  cost: number;
}

export interface QuotationRecord {
  _id: string;
  id: string; // Mapped from _id
  inspection: {
    _id: string;
    containerId: string;
    owner: string;
  };
  quotationId: string; // Auto-generated human-readable ID
  status: QuotationStatus;
  lineItems: QuotationItem[];
  totalCost: number;
  user: string;
  createdAt: string;
  notes?: string;
}

export type ContainerFaceKey = 
  | 'ext_front' | 'ext_back' | 'ext_left' | 'ext_right' | 'ext_top' | 'ext_bottom'
  | 'int_front' | 'int_back' | 'int_left' | 'int_right' | 'int_top' | 'int_floor';

export const FACE_LABELS: Record<ContainerFaceKey, string> = {
  ext_front: 'Ngoài - Mặt trước',
  ext_back: 'Ngoài - Mặt sau',
  ext_left: 'Ngoài - Bên trái',
  ext_right: 'Ngoài - Bên phải',
  ext_top: 'Ngoài - Nóc (Mái)',
  ext_bottom: 'Ngoài - Gầm (Đáy)',
  int_front: 'Trong - Mặt trước',
  int_back: 'Trong - Mặt sau',
  int_left: 'Trong - Bên trái',
  int_right: 'Trong - Bên phải',
  int_top: 'Trong - Nóc (Mái)',
  int_floor: 'Trong - Sàn',
};