import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Input, Button, Badge } from '../../components/ui-lib';
import { Search, FileEdit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { getQuotations, deleteQuotation } from '../../lib/api';
import { QuotationRecord, QuotationStatus } from '../../types';

const QuotationList = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<QuotationRecord[]>([]);
  const [filteredData, setFilteredData] = useState<QuotationRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        setLoading(true);
        const data = await getQuotations();
        const processedData = data.map(item => ({ ...item, id: item._id }));
        setQuotations(processedData);
        setFilteredData(processedData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch quotations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotations();
  }, []);
  
  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const result = quotations.filter(q => 
      q.inspection?.containerId.toLowerCase().includes(lowerSearch) ||
      q.inspection?.owner.toLowerCase().includes(lowerSearch) ||
      q.quotationId.toLowerCase().includes(lowerSearch)
    );
    setFilteredData(result);
  }, [search, quotations]);

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa báo giá này?')) {
      try {
        await deleteQuotation(id);
        setQuotations(prev => prev.filter(q => q.id !== id));
        alert('Xóa báo giá thành công.');
      } catch (err) {
        alert(`Lỗi khi xóa báo giá: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case QuotationStatus.APPROVED: return <Badge variant="success">{status}</Badge>;
      case QuotationStatus.REJECTED: return <Badge variant="destructive">{status}</Badge>;
      case QuotationStatus.SENT: return <Badge variant="warning">{status}</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Quản lý Báo giá</h2>
          <p className="text-slate-500">Danh sách báo giá sửa chữa container</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Tìm kiếm theo mã báo giá, số container, hãng tàu..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Mã Báo Giá</th>
                  <th className="px-4 py-3">Số Container</th>
                  <th className="px-4 py-3">Hãng tàu</th>
                  <th className="px-4 py-3">Ngày tạo</th>
                  <th className="px-4 py-3 text-right">Tổng tiền ($)</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500"><Loader2 className="h-6 w-6 animate-spin inline-block mr-2" /> Đang tải...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-red-500 bg-red-50"><AlertCircle className="h-6 w-6 inline-block mr-2" /> {error}</td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{item.quotationId || item.id}</td>
                      <td className="px-4 py-3 font-medium text-blue-600">{item.inspection?.containerId}</td>
                      <td className="px-4 py-3">{item.inspection?.owner}</td>
                      <td className="px-4 py-3">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td className="px-4 py-3 text-right font-bold">
                        {(item.totalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate(`/bao-gia/chi-tiet?id=${item.id}`)}
                          title="Chỉnh sửa"
                        >
                          <FileEdit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(item.id)}
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Chưa có báo giá nào. Hãy tạo báo giá từ kết quả giám định.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotationList;