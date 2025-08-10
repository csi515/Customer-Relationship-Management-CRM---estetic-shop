import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // 로그인 페이지 비활성화 - 개발 모드에서만 적용
  const isDevelopment = import.meta.env.DEV;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 개발 모드에서는 로그인 없이 접근 허용
  if (isDevelopment) {
    return <>{children}</>;
  }

  // 프로덕션 모드에서는 기존 로직 유지
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 