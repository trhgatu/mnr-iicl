import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, Button, Badge, Select, Label } from '../../components/ui-lib';
import { Search, Filter, FileText, Eye, Trash2, X, ZoomIn, ClipboardList, Calendar, Box, User, Container, Download, Loader2, AlertCircle } from 'lucide-react';
import { getInspections, deleteInspection } from '../../lib/api';
import { InspectionRecord, InspectionStatus, FACE_LABELS, ContainerFaceKey, ContainerType } from '../../types';

const API_BASE_URL = 'http://localhost:5000';

// --- Global getStatusBadge ---
const getStatusBadge = (status: InspectionStatus) => {
  switch(status) {
    case InspectionStatus.PASSED: return <Badge variant="success">{status}</Badge>;
    case InspectionStatus.FAILED: return <Badge variant="destructive">{status}</Badge>;
    case InspectionStatus.REPAIR_NEEDED: return <Badge variant="warning">{status}</Badge>;
    case InspectionStatus.QUOTATION_SENT: return <Badge variant="info">{status}</Badge>;
    case InspectionStatus.PENDING:
    case InspectionStatus.COMPLETED:
    default: return <Badge>{status}</Badge>;
  }
};

// --- Helper Components ---

const ImagePreviewModal: React.FC<{ src: string | null; onClose: () => void }> = ({ src, onClose }) => {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 animate-fade-in" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
        <X size={24} />
      </button>
      <div className="relative max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <img src={src} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl" />
      </div>
    </div>
  );
};

const InspectionDetailModal: React.FC<{ record: InspectionRecord | null; onClose: () => void }> = ({ record, onClose }) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!record) return null;

  const allDefects = (Object.values(record.damages) as any[]).map((d: any, i: number) => ({ ...d, id: d._id || i }));

  const hasImages = (face: any) => face.images && face.images.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <ImagePreviewModal src={previewImage} onClose={() => setPreviewImage(null)} />

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {record.containerId}
              {getStatusBadge(record.status)}
            </h3>
            <p className="text-sm text-slate-500">Chi tiết kết quả giám định</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6 bg-slate-50/30">

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex items-center gap-3">
               <div className="p-2 bg-blue-50 rounded text-blue-600"><Container size={20} /></div>
               <div>
                 <p className="text-xs text-slate-500 font-medium uppercase">Loại Container</p>
                 <p className="font-semibold text-slate-800">{record.containerType}</p>
               </div>
            </div>
            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex items-center gap-3">
               <div className="p-2 bg-purple-50 rounded text-purple-600"><User size={20} /></div>
               <div>
                 <p className="text-xs text-slate-500 font-medium uppercase">Hãng tàu / Chủ</p>
                 <p className="font-semibold text-slate-800">{record.owner}</p>
               </div>
            </div>
            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex items-center gap-3">
               <div className="p-2 bg-green-50 rounded text-green-600"><Calendar size={20} /></div>
               <div>
                 <p className="text-xs text-slate-500 font-medium uppercase">Ngày giám định</p>
                 <p className="font-semibold text-slate-800">{new Date(record.inspectionDate).toLocaleDateString('vi-VN')}</p>
               </div>
            </div>
             <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex items-center gap-3">
               <div className="p-2 bg-orange-50 rounded text-orange-600"><Box size={20} /></div>
               <div>
                 <p className="text-xs text-slate-500 font-medium uppercase">Tổng số lỗi</p>
                 <p className="font-semibold text-slate-800">{record.damages.length}</p>
               </div>
            </div>
          </div>

          {/* Defect Summary Table */}
          {allDefects.length > 0 ? (
            <Card className="border-orange-200 shadow-sm bg-white">
              <CardHeader className="pb-2 border-b border-orange-100 bg-orange-50/30">
                <CardTitle className="text-base text-orange-800 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" /> Tổng hợp hư hỏng
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold">
                      <tr>
                        <th className="px-4 py-2 text-center w-10">#</th>
                        <th className="px-4 py-2">Mã IICL</th>
                        <th className="px-4 py-2">Mô tả</th>
                        <th className="px-4 py-2">Vị trí</th>
                        <th className="px-4 py-2">Mức độ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allDefects.map((d: any, idx: number) => (
                        <tr key={d.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2 text-center text-slate-400">{idx + 1}</td>
                          <td className="px-4 py-2 font-bold text-red-600">{d.type}</td>
                          <td className="px-4 py-2">{d.description}</td>
                          <td className="px-4 py-2 text-slate-500 text-xs">{d.location}</td>
                          <td className="px-4 py-2">
                            <Badge variant={d.severity === 'Nặng' ? 'destructive' : d.severity === 'Vừa' ? 'warning' : 'default'}>
                              {d.severity}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
             <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-center">
                Container đạt chuẩn, không phát hiện hư hỏng nào.
             </div>
          )}

          {/* Face Details Grid */}
          <div>
            <h4 className="font-bold text-slate-700 mb-3">Hình ảnh chi tiết</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {record.images.map((imagePath, index) => (
                 <div key={index} className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
                    <div className="p-3">
                       <div
                          className="aspect-square border border-slate-100 rounded bg-black/5 overflow-hidden relative group cursor-pointer"
                          onClick={() => setPreviewImage(`${imagePath}`)}
                        >
                          <img src={`${imagePath}`} alt="inspection" className="w-full h-full object-contain" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <ZoomIn className="text-white drop-shadow-sm" size={16} />
                          </div>
                        </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <Button onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  );
};

const History = () => {
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [filteredData, setFilteredData] = useState<InspectionRecord[]>([]);
  const [viewingRecord, setViewingRecord] = useState<InspectionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  useEffect(() => {
    const fetchInspections = async () => {
      try {
        setLoading(true);
        const data = await getInspections();
        // Assuming the API returns _id, let's map it to id for consistency if needed,
        // or just use _id throughout. For now, let's assume the type handles it.
        // Let's also ensure the date is a comparable value.
        const processedData = data.map(item => ({ ...item, id: item._id, date: item.inspectionDate }));
        setInspections(processedData);
        setFilteredData(processedData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInspections();
  }, []);

  // Handle Filtering
  useEffect(() => {
    let result = inspections;

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(i =>
        i.containerId.toLowerCase().includes(lowerSearch) ||
        (i.owner && i.owner.toLowerCase().includes(lowerSearch))
      );
    }

    if (filterStatus !== 'ALL') {
      result = result.filter(i => i.status === filterStatus);
    }

    if (filterType !== 'ALL') {
      result = result.filter(i => i.containerType === filterType);
    }

    if (dateFrom) {
      const from = new Date(dateFrom).setHours(0,0,0,0);
      result = result.filter(i => new Date(i.date).setHours(0,0,0,0) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).setHours(23,59,59,999);
      result = result.filter(i => new Date(i.date).getTime() <= to);
    }

    setFilteredData(result);
  }, [search, filterStatus, filterType, dateFrom, dateTo, inspections]);

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
      try {
        await deleteInspection(id);
        const newData = inspections.filter(item => item.id !== id);
        setInspections(newData);
        alert('Xóa thành công!');
      } catch (err) {
        alert(`Lỗi khi xóa: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      alert("Không có dữ liệu để xuất.");
      return;
    }

    const headers = [
      "Số Container", "Loại", "Hãng tàu / Chủ khai thác", "Ngày giám định", "Trạng thái", "Tổng số lỗi", "Chi tiết lỗi (Mã IICL - Mô tả - Vị trí)"
    ];

    const rows = filteredData.map(item => {
      const defectDetails = (item.damages || [])
        .map(d => `[${d.type}] ${d.description || ''} (${d.location})`)
        .join('; ');

      return [
        item.containerId, item.containerType, item.owner, new Date(item.date).toLocaleDateString('vi-VN'),
        item.status, item.damages.length, `"${defectDetails.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bao_cao_giam_dinh_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <InspectionDetailModal
        record={viewingRecord}
        onClose={() => setViewingRecord(null)}
      />

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">Lịch sử giám định</h2>
        <div className="flex gap-2">
          <Button variant={showFilter ? "secondary" : "outline"} onClick={() => setShowFilter(!showFilter)}>
             <Filter className="mr-2 h-4 w-4" /> Lọc
          </Button>
          <Button variant="outline" onClick={handleExportExcel} className="hover:bg-green-50 hover:text-green-600 hover:border-green-200">
             <Download className="mr-2 h-4 w-4" /> Xuất Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm theo số container hoặc chủ hàng..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {showFilter && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
               <div>
                  <Label className="mb-1 block text-xs">Từ ngày</Label>
                  <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
               </div>
               <div>
                  <Label className="mb-1 block text-xs">Đến ngày</Label>
                  <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
               </div>
               <div>
                  <Label className="mb-1 block text-xs">Trạng thái</Label>
                  <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="ALL">Tất cả</option>
                    {Object.values(InspectionStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </Select>
               </div>
               <div>
                  <Label className="mb-1 block text-xs">Loại Container</Label>
                   <Select value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="ALL">Tất cả</option>
                    {Object.values(ContainerType).map(t => <option key={t} value={t}>{t}</option>)}
                  </Select>
               </div>
               <div className="md:col-span-4 flex justify-end">
                 <Button variant="ghost" size="sm" className="text-slate-500"
                   onClick={() => { setFilterStatus('ALL'); setFilterType('ALL'); setDateFrom(''); setDateTo(''); setSearch(''); }}>
                   Xóa bộ lọc
                 </Button>
               </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className="rounded-md border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Số Container</th>
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Ngày giám định</th>
                  <th className="px-4 py-3">Hãng tàu / Chủ</th>
                  <th className="px-4 py-3">Số lỗi</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" /> Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : error ? (
                   <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-red-500 bg-red-50">
                      <AlertCircle className="h-6 w-6 inline-block mr-2" /> {error}
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium">{item.containerId}</td>
                      <td className="px-4 py-3">{item.containerType}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(item.date).toLocaleDateString('vi-VN')}</td>
                      <td className="px-4 py-3">{item.owner}</td>
                      <td className="px-4 py-3">
                        {item.damages.length > 0 ? (
                          <span className="text-red-600 font-medium">{item.damages.length}</span>
                        ) : (
                          <span className="text-green-600">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Button variant="ghost" size="sm" title="Xem chi tiết" onClick={() => setViewingRecord(item)}>
                          <Eye className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} title="Xóa">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Không tìm thấy dữ liệu phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-xs text-slate-400 text-right">
             Hiển thị {filteredData.length} / {inspections.length} bản ghi
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
