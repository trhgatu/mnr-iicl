import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getToken } from '../lib/auth';
import Header from './Header';
import Footer from './Footer';

const ProtectedLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Header />
      <main className="animate-fade-in flex-1">
        <Outlet /> 
      </main>
      <Footer />
    </div>
  );
};


const ProtectedRoute: React.FC = () => {
  const isAuthenticated = !!getToken();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <ProtectedLayout />;
};

export default ProtectedRoute;
