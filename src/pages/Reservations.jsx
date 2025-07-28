import { useState, useEffect } from 'react'
import { tables } from '../lib/supabase'
import { Plus, Calendar, Clock, User, Phone } from 'lucide-react'

export default function Reservations() {
  const [reservations, setReservations] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingReservation, setEditingReservation] = useState(null)
  const [formData, setFormData] = useState({
    customer_id: '',
    reservation_date: '',
    reservation_time: '',
    treatment_name: '',
    memo: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // 예약 조회
      const { data: reservationsData, error: reservationsError } = await tables.reservations()
        .select(`
          *,
          customers(name, phone)
        `)
        .order('reservation_date', { ascending: true })

      if (reservationsError) throw reservationsError

      // 고객 목록 조회
      const { data: customersData, error: customersError } = await tables.customers()
        .select('id, name, phone')
        .order('name')

      if (customersError) throw customersError

      setReservations(reservationsData || [])
      setCustomers(customersData || [])
    } catch (error) {
      console.error('데이터 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingReservation) {
        // 수정
        const { error } = await tables.reservations()
          .update(formData)
          .eq('id', editingReservation.id)
        
        if (error) throw error
      } else {
        // 추가
        const { error } = await tables.reservations()
          .insert([formData])
        
        if (error) throw error
      }
      
      setShowAddModal(false)
      setEditingReservation(null)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('예약 저장 오류:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('정말로 이 예약을 삭제하시겠습니까?')) return
    
    try {
      const { error } = await tables.reservations()
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('예약 삭제 오류:', error)
    }
  }

  const handleEdit = (reservation) => {
    setEditingReservation(reservation)
    setFormData({
      customer_id: reservation.customer_id || '',
      reservation_date: reservation.reservation_date || '',
      reservation_time: reservation.reservation_time || '',
      treatment_name: reservation.treatment_name || '',
      memo: reservation.memo || ''
    })
    setShowAddModal(true)
  }

  const resetForm = () => {
    setFormData({
      customer_id: '',
      reservation_date: '',
      reservation_time: '',
      treatment_name: '',
      memo: ''
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">예약 관리</h1>
        <button
          onClick={() => {
            setEditingReservation(null)
            resetForm()
            setShowAddModal(true)
          }}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          예약 추가
        </button>
      </div>

      {/* 예약 목록 */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  고객명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  예약일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  예약시간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  시술명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  메모
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {reservation.customers?.name}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {reservation.customers?.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {reservation.reservation_date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {reservation.reservation_time}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {reservation.treatment_name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {reservation.memo}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(reservation)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(reservation.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {reservations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">예약 데이터가 없습니다.</p>
          </div>
        )}
      </div>

      {/* 예약 추가/수정 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingReservation ? '예약 수정' : '새 예약 추가'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">고객 *</label>
                  <select
                    required
                    value={formData.customer_id}
                    onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                    className="input-field"
                  >
                    <option value="">고객을 선택하세요</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} ({customer.phone})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">예약일 *</label>
                  <input
                    type="date"
                    required
                    value={formData.reservation_date}
                    onChange={(e) => setFormData({...formData, reservation_date: e.target.value})}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">예약시간 *</label>
                  <input
                    type="time"
                    required
                    value={formData.reservation_time}
                    onChange={(e) => setFormData({...formData, reservation_time: e.target.value})}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">시술명 *</label>
                  <input
                    type="text"
                    required
                    value={formData.treatment_name}
                    onChange={(e) => setFormData({...formData, treatment_name: e.target.value})}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">메모</label>
                  <textarea
                    value={formData.memo}
                    onChange={(e) => setFormData({...formData, memo: e.target.value})}
                    rows={3}
                    className="input-field"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingReservation(null)
                      resetForm()
                    }}
                    className="btn-secondary"
                  >
                    취소
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingReservation ? '수정' : '추가'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}