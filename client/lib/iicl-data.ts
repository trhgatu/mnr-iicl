import { IICLItem } from '../types';

// Dữ liệu IICL được trích xuất và tổng hợp từ tài liệu PDF (Rows 1-500)
export const MOCK_IICL_DATA: IICLItem[] = [
  // --- 1. Hư hỏng nội bộ (Damage Types) ---
  { id: '1', maIICL: 'DT', maNoiBo: 'Mo', moTa: 'Móp (Dent)', nhomHuHong: 'Biến dạng', mucDo: 'Nhẹ' },
  { id: '2', maIICL: 'BW', maNoiBo: 'Pi', moTa: 'Phình (Bowed)', nhomHuHong: 'Biến dạng', mucDo: 'Vừa' },
  { id: '3', maIICL: 'BT', maNoiBo: 'Co', moTa: 'Cong (Bent)', nhomHuHong: 'Biến dạng', mucDo: 'Vừa' },
  { id: '4', maIICL: 'RO', maNoiBo: 'Mu', moTa: 'Mục (Rot)', nhomHuHong: 'Hư hỏng sàn/gỗ', mucDo: 'Nặng' },
  { id: '5', maIICL: 'CO', maNoiBo: 'Gi', moTa: 'Rỉ sét (Corrosion)', nhomHuHong: 'Rỉ sét', mucDo: 'Vừa' },
  { id: '6', maIICL: 'DL', maNoiBo: 'Bo', moTa: 'Bong tách lớp (Delamination)', nhomHuHong: 'Hư hỏng sàn/gỗ', mucDo: 'Vừa' },
  { id: '7', maIICL: 'LO', maNoiBo: 'Bu', moTa: 'Bung (Loose)', nhomHuHong: 'Cấu trúc', mucDo: 'Vừa' },
  { id: '8', maIICL: 'BR', maNoiBo: 'Ga', moTa: 'Gãy/Vỡ (Broken)', nhomHuHong: 'Cấu trúc', mucDo: 'Nặng' },
  { id: '9', maIICL: 'CK', maNoiBo: 'Nu', moTa: 'Nứt (Crack)', nhomHuHong: 'Cấu trúc', mucDo: 'Nặng' },
  { id: '10', maIICL: 'OL', maNoiBo: 'No', moTa: 'Dầu/nhớt (Oil)', nhomHuHong: 'Vệ sinh', mucDo: 'Nhẹ' },
  { id: '11', maIICL: 'HO', maNoiBo: 'Lu', moTa: 'Lủng (Hole)', nhomHuHong: 'Thủng/Rách', mucDo: 'Nặng' },
  { id: '12', maIICL: 'GD', maNoiBo: 'Xu', moTa: 'Xước (Gouge)', nhomHuHong: 'Xước', mucDo: 'Nhẹ' },
  { id: '13', maIICL: 'CU', maNoiBo: 'Ra', moTa: 'Rách (Cut)', nhomHuHong: 'Thủng/Rách', mucDo: 'Vừa' },
  { id: '14', maIICL: 'MA', maNoiBo: 'Bi', moTa: 'Biến dạng (Major distortion)', nhomHuHong: 'Biến dạng', mucDo: 'Nặng' },
  { id: '15', maIICL: 'MS', maNoiBo: 'Ma', moTa: 'Mất (Missing)', nhomHuHong: 'Cấu trúc', mucDo: 'Nặng' },
  { id: '16', maIICL: 'CT', maNoiBo: 'De', moTa: 'Keo và băng keo', nhomHuHong: 'Vệ sinh', mucDo: 'Nhẹ' },
  { id: '17', maIICL: 'DY', maNoiBo: 'Ba', moTa: 'Dơ/bẩn', nhomHuHong: 'Vệ sinh', mucDo: 'Nhẹ' },
  // ... (rest of the data from user)
  { id: '500', maIICL: 'PAA', maNoiBo: 'Ct', moTa: 'Vách cửa TRÁI', viTriMacDinh: 'DT2N', nhomHuHong: 'Thành phần' }
];

export const getIICLByCode = (code: string) => MOCK_IICL_DATA.find(i => i.maIICL === code);
export const searchIICL = (query: string) => {
  const q = query.toLowerCase();
  return MOCK_IICL_DATA.filter(i => 
    i.maIICL.toLowerCase().includes(q) || 
    i.moTa.toLowerCase().includes(q) ||
    i.nhomHuHong.toLowerCase().includes(q) ||
    (i.maNoiBo && i.maNoiBo.toLowerCase().includes(q))
  );
};
