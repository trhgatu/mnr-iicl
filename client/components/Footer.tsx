import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#4498ff] text-white pt-10 pb-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Column 1: Brand Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">Hệ thống M&R Container</h3>
            <p className="text-blue-50 text-sm leading-relaxed max-w-sm">
              Giải pháp quản lý và đánh giá hiệu suất container toàn diện, giúp doanh nghiệp theo dõi và phát triển hoạt động một cách hiệu quả.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm text-blue-50">
              <li><Link to="/" className="hover:text-white transition-colors">Tổng quan</Link></li>
              <li><Link to="/lich-su" className="hover:text-white transition-colors">Báo cáo</Link></li>
              <li><Link to="/danh-muc-iicl" className="hover:text-white transition-colors">Tra cứu</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Cài đặt tiêu chí</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Liên hệ</h3>
            <ul className="space-y-3 text-sm text-blue-50">
              <li className="flex items-start gap-2">
                <span className="font-medium min-w-[70px]">Email:</span> 
                <span>support@cehsoft.com</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium min-w-[70px]">Điện thoại:</span> 
                <span>(84) 123-456-789</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium min-w-[70px]">Địa chỉ:</span> 
                <span>CEH Building, 107 Bến Vân Đồn, Phường Khánh Hội, TP Hồ Chí Minh.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-white/20 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-blue-100">
          <p>© 2025 Hệ thống M&R Container. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="#" className="hover:text-white transition-colors">Chính sách bảo mật</Link>
            <Link to="#" className="hover:text-white transition-colors">Điều khoản sử dụng</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;