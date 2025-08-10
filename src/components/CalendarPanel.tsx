import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { Appointment, Product } from '../types';

interface CalendarPanelProps {
  appointments: Appointment[];
  products: Product[];
  onDateSelect: (date: Date) => void;
  onAppointmentSelect: (appointment: Appointment) => void;
}

const CalendarPanel: React.FC<CalendarPanelProps> = ({
  appointments,
  products,
  onDateSelect,
  onAppointmentSelect
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    onDateSelect(date);
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.datetime);
      return (
        appointmentDate.getDate() === date.getDate() &&
        appointmentDate.getMonth() === date.getMonth() &&
        appointmentDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const tileContent = ({ date }: { date: Date }) => {
    const dayAppointments = getAppointmentsForDate(date);
    
    if (dayAppointments.length === 0) return null;

    return (
      <div className="absolute bottom-1 right-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
      </div>
    );
  };

  const selectedDateAppointments = getAppointmentsForDate(selectedDate);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">📅 예약 캘린더</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            tileContent={tileContent}
            className="w-full"
          />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">
            {selectedDate.toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} 예약
          </h3>
          
          {selectedDateAppointments.length === 0 ? (
            <p className="text-gray-500">해당 날짜에 예약이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {selectedDateAppointments.map(appointment => {
                const product = products.find(p => p.id === appointment.productId);
                return (
                  <div
                    key={appointment.id}
                    className="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => onAppointmentSelect(appointment)}
                  >
                    <div className="font-medium text-blue-900">
                      {new Date(appointment.datetime).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="text-sm text-blue-700">
                      {product?.name || '상품명 없음'}
                    </div>
                    {appointment.memo && (
                      <div className="text-xs text-blue-600 mt-1">
                        {appointment.memo}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPanel; 