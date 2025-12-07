import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Input, Button, Select, Badge, Label } from '../../components/ui-lib';
import { Save, Plus, Trash2, ChevronRight, ArrowLeft, AlertTriangle, FileEdit, Loader2 } from 'lucide-react';
import { getInspection, getQuotation, createQuotation, updateQuotation } from '../../lib/api';
import { MOCK_IICL_DATA } from '../../lib/iicl-data';
import { QuotationRecord, QuotationItem, QuotationStatus } from '../../types';

const QuotationDetail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inspectionId = searchParams.get('inspectionId');
  const quotationId = searchParams.get('id');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [quotation, setQuotation] = useState<Partial<QuotationRecord>>({});

  const recalculateTotal = (items: QuotationItem[]): number => {
    return items.reduce((sum, item) => sum + (item.cost ?? 0) * (item.quantity ?? 1), 0);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (quotationId) {
          const loadedQuote = await getQuotation(quotationId);
          setQuotation({ ...loadedQuote, id: loadedQuote._id });
        } else if (inspectionId) {
          const inspection = await getInspection(inspectionId);
          // Create a new draft quotation from the inspection
          const newLineItems: QuotationItem[] = (inspection.damages || []).map(defect => ({
            description: defect.description,
            code: defect.iiclCode,
            quantity: 1,
            cost: 50, // Default cost, user should edit this
          }));

          setQuotation({
            inspection: inspection._id,
            containerNumber: inspection.containerId,
            containerType: inspection.containerType,
            owner: inspection.owner,
            status: QuotationStatus.DRAFT,
            lineItems: newLineItems,
            totalCost: recalculateTotal(newLineItems),
            notes: 'Báo giá được tạo từ giám định.',
          });
        } else {
          setError("Không có ID giám định hoặc báo giá được cung cấp.");
        }
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : "Lỗi khi tải dữ liệu.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [inspectionId, quotationId]);

  const updateQuotationField = (field: keyof QuotationRecord, value: any) => {
    setQuotation(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    setQuotation(prev => {
      const newLineItems = [...(prev.lineItems || [])];

      if (field === 'code') {
        const selectedIICL = MOCK_IICL_DATA.find(iicl => iicl.maIICL === value);
        newLineItems[index] = {
          ...newLineItems[index],
          code: value,
          description: selectedIICL ? selectedIICL.moTa : 'Mô tả không khả dụng',
          // Optionally, set a default cost here if IICL data includes it
          // cost: selectedIICL ? (selectedIICL.defaultCost || 0) : 0,
        };
      } else {
        newLineItems[index] = { ...newLineItems[index], [field]: value };
      }

      const totalCost = recalculateTotal(newLineItems);
      return { ...prev, lineItems: newLineItems, totalCost };
    });
  };

  const handleAddItem = () => {
    const newItem: QuotationItem = {
      description: 'Hư hỏng phát sinh',
      code: 'MAN',
      quantity: 1,
      cost: 0,
    };
    const newLineItems = [...(quotation.lineItems || []), newItem];
    setQuotation(prev => ({
      ...prev,
      lineItems: newLineItems,
      totalCost: recalculateTotal(newLineItems)
    }));
  };

  const handleDeleteItem = (index: number) => {
    const newLineItems = (quotation.lineItems || []).filter((_, i) => i !== index);
    setQuotation(prev => ({
       ...prev,
       lineItems: newLineItems,
       totalCost: recalculateTotal(newLineItems)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (quotation.id) {
        await updateQuotation(quotation.id, quotation);
        alert('Cập nhật báo giá thành công!');
      } else {
        await createQuotation(quotation);
        alert('Đã tạo báo giá thành công!');
      }
      navigate('/bao-gia');
    } catch (err) {
      alert(`Lỗi khi lưu báo giá: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-red-50 border border-red-200 rounded-lg text-center">
      <AlertTriangle className="mx-auto h-10 w-10 text-red-500 mb-2" />
      <h3 className="text-lg font-bold text-red-700 mb-2">Không thể tải báo giá</h3>
      <p className="text-slate-600 mb-4">{error}</p>
      <Button onClick={() => navigate('/bao-gia')} variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
      </Button>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/bao-gia')}>Báo giá</span>
        <ChevronRight size={14} />
        <span className="font-semibold text-slate-800">{quotation.containerNumber}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <Card>
            <CardHeader><CardTitle>Thông tin Chung</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Số Container</Label>
                <Input value={quotation.containerNumber || ''} disabled />
              </div>
              <div>
                <Label>Loại Container</Label>
                <Input value={quotation.containerType || ''} disabled />
              </div>
              <div>
                <Label>Hãng tàu</Label>
                <Input value={quotation.owner || ''} disabled />
              </div>
               <div>
                <Label>Trạng thái</Label>
                <Select
                  value={quotation.status || QuotationStatus.DRAFT}
                  onChange={(e) => updateQuotationField('status', e.target.value)}
                >
                  {Object.values(QuotationStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
               <div className="col-span-full">
                 <Label>Ghi chú</Label>
                 <Input
                    value={quotation.notes || ''}
                    onChange={e => updateQuotationField('notes', e.target.value)}
                    placeholder="Ghi chú..."
                  />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-[350px]">
           <Card className="h-full sticky top-20 shadow-lg border-slate-200">
             <CardHeader className="bg-slate-50 pb-2 border-b">
               <CardTitle className="text-lg">Tổng chi phí</CardTitle>
             </CardHeader>
             <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center text-2xl font-bold text-blue-600 p-2 rounded">
                  <span>TỔNG CỘNG</span>
                  <span>{(quotation.totalCost || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
                <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {quotation.id ? 'Cập nhật báo giá' : 'Lưu báo giá'}
                </Button>
             </CardContent>
           </Card>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg text-slate-700">Chi tiết hạng mục</h3>
        <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800 text-white uppercase">
                <tr>
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3 min-w-[250px]">Mô tả</th>
                  <th className="p-3 w-24">Mã</th>
                  <th className="p-3 w-24 text-center">Số lượng</th>
                  <th className="p-3 w-40 text-right">Đơn giá ($)</th>
                  <th className="p-3 w-40 text-right bg-green-900/30 font-bold">Thành tiền ($)</th>
                  <th className="p-3 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(quotation.lineItems || []).map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="p-2 text-center text-slate-500">{index + 1}</td>
                    <td className="p-2">
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="h-8 bg-slate-50"
                        disabled
                      />
                    </td>
                    <td className="p-2">
                       <Select
                          value={item.code || ''}
                          onChange={(e) => handleItemChange(index, 'code', e.target.value)}
                          className="h-8"
                        >
                          <option value="" disabled>Chọn mã</option>
                          {MOCK_IICL_DATA.map(iicl => (
                            <option key={iicl.id} value={iicl.maIICL}>
                              {iicl.maIICL} - {iicl.moTa.substring(0, 50)}
                            </option>
                          ))}
                       </Select>
                    </td>
                    <td className="p-2">
                        <Input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))} className="h-8 text-center" />
                    </td>
                    <td className="p-2">
                        <Input type="number" value={item.cost} onChange={(e) => handleItemChange(index, 'cost', Number(e.target.value))} className="h-8 text-right" />
                    </td>
                    <td className="p-2 text-right font-bold text-green-700 bg-green-50/30">
                        {((item.cost || 0) * (item.quantity || 1)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 text-center">
                       <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(index)} title="Xóa dòng">
                         <Trash2 size={14} className="text-red-500" />
                       </Button>
                    </td>
                  </tr>
                ))}
                {(!quotation.lineItems || quotation.lineItems.length === 0) && (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">Chưa có hạng mục nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>
           <div className="p-3 bg-slate-50 border-t">
              <Button variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="mr-2 h-4 w-4" /> Thêm hạng mục
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationDetail;