import React from 'react';

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
}

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  isOpen,
  onClose,
  appointmentId
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">예약 상세 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              예약 ID
            </label>
            <p className="text-gray-900">{appointmentId}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              예약 상태
            </label>
            <p className="text-gray-900">상세 정보 로딩 중...</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              예약 시간
            </label>
            <p className="text-gray-900">상세 정보 로딩 중...</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메모
            </label>
            <p className="text-gray-900">상세 정보 로딩 중...</p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal; 