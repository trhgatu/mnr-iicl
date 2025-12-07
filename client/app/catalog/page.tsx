import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, Button } from '../../components/ui-lib';
import { MOCK_IICL_DATA } from '../../lib/iicl-data';
import { IICLItem, CatalogItem } from '../../types';

const Catalog = () => {
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [filteredIICLData, setFilteredIICLData] = useState<IICLItem[]>([]);

  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filtered = MOCK_IICL_DATA.filter(item =>
      item.maIICL.toLowerCase().includes(lowercasedSearchTerm) ||
      item.moTa.toLowerCase().includes(lowercasedSearchTerm) ||
      (item.maNoiBo && item.maNoiBo.toLowerCase().includes(lowercasedSearchTerm))
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setFilteredIICLData(filtered.slice(startIndex, endIndex));
  }, [searchTerm, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(MOCK_IICL_DATA.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderTable = (title: string, data: IICLItem[]) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-slate-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-600 font-semibold">
              <tr>
                <th className="px-4 py-3 w-[150px]">Mã IICL</th>
                <th className="px-4 py-3">Mô tả</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-blue-600">{item.maIICL}</td>
                  <td className="px-4 py-3">{item.moTa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Danh mục mã IICL</h2>
        <p className="text-slate-500 mt-1">Tra cứu các mã hư hỏng và sửa chữa theo tiêu chuẩn IICL</p>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Tìm kiếm mã hoặc mô tả..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on new search
          }}
          className="flex-grow"
        />
      </div>

      {error && <p className="text-center text-red-500">Lỗi: {error}</p>}

      <div className="grid grid-cols-1 gap-6">
        {renderTable('Mã hư hỏng IICL (IICL Codes)', filteredIICLData)}
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outline"
        >
          Trước
        </Button>
        <span>Trang {currentPage} / {totalPages}</span>
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="outline"
        >
          Tiếp
        </Button>
      </div>
    </div>
  );
};

export default Catalog;