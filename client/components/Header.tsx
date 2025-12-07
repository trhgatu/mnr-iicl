import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { History, BarChart3, BookOpen, CheckSquare, FileText, LogOut } from 'lucide-react';
import { logout } from '../lib/auth';
import { Button } from './ui-lib';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path) ? "bg-blue-600" : "hover:bg-blue-500/50";
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-[#4498ff] text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/images/ceh-logo.png"
            alt="CEH Logo"
            className="h-10 w-auto bg-white p-1 rounded-md"
          />
          <div>
            <h1 className="font-bold text-lg leading-tight">Giám định IICL</h1>
            <p className="text-xs opacity-90 text-blue-100">Container Inspection System</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${location.pathname === '/' ? "bg-blue-600" : "hover:bg-blue-500/50"}`}>
            <BarChart3 className="h-4 w-4" /> Thống kê
          </Link>
          <Link to="/giam-dinh" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${isActive('/giam-dinh')}`}>
            <CheckSquare className="h-4 w-4" /> Giám định
          </Link>
          <Link to="/bao-gia" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${isActive('/bao-gia')}`}>
            <FileText className="h-4 w-4" /> Báo giá
          </Link>
          <Link to="/lich-su" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${isActive('/lich-su')}`}>
            <History className="h-4 w-4" /> Lịch sử
          </Link>
          <Link to="/danh-muc-iicl" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${isActive('/danh-muc-iicl')}`}>
            <BookOpen className="h-4 w-4" /> Danh mục IICL
          </Link>
        </nav>

        <div>
          <Button onClick={handleLogout} variant="ghost" className="text-white hover:bg-blue-700 hover:text-white">
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;