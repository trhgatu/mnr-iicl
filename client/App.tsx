import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './app/dashboard/page';
import Inspection from './app/inspection/page';
import History from './app/history/page';
import Catalog from './app/catalog/page';
import QuotationList from './app/quotation/page';
import QuotationDetail from './app/quotation/detail';
import LoginPage from './app/login/page';
import { setupInterceptors, getToken } from './lib/auth';

// Setup axios interceptor on app start
setupInterceptors();

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute />}>
          <Route index element={<Dashboard />} />
          <Route path="giam-dinh" element={<Inspection />} />
          <Route path="lich-su" element={<History />} />
          <Route path="danh-muc-iicl" element={<Catalog />} />
          <Route path="bao-gia" element={<QuotationList />} />
          <Route path="bao-gia/chi-tiet" element={<QuotationDetail />} />
        </Route>
        
        {/* Catch-all route */}
        <Route 
          path="*" 
          element={<Navigate to={getToken() ? "/" : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
};

export default App;