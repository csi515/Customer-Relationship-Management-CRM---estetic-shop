import { useState, useEffect } from 'react'
import { tables } from '../lib/supabase'
import { Plus, Calendar, Clock, User, Phone, Package, Filter, Edit, Trash2 } from 'lucide-react'

export default function Reservations() {
  const [appointments, setAppointments] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [formData, setFormData] = useState({
    customer_id: '',
    product_id: '',
    datetime: '',
    memo: '',
    status: 'scheduled'
  })
  const [filters, setFilters] = useState({
    date: '',
    status: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // 예약 목록 조회 (고객, 상품 정보 포함)
      const { data: appointmentsData, error: appointmentsError } = await tables.appointments()
        .select(`
          *,
          customers(name, phone),
          products(name, price, type)
        `)
        .order('datetime', { ascending: false })

      if (appointmentsError) throw appointmentsError

      // 고객 목록 조회
      const { data: customersData, error: customersError } = await tables.customers()
        .select('id, name, phone')
        .order('name')

      if (customersError) throw customersError

      // 상품 목록 조회 (활성 상태만)
      const { data: productsData, error: productsError } = await tables.products()
        .select('id, name, price, type, status')
        .eq('status', 'active')
        .order('name')

      if (productsError) throw productsError

      setAppointments(appointmentsData || [])
      setCustomers(customersData || [])
      setProducts(productsData || [])
    } catch (error) {
      console.error('데이터 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingAppointment) {
        // 수정
        const { error } = await tables.appointments()
          .update(formData)
          .eq('id', editingAppointment.id)
        
        if (error) throw error
      } else {
        // 추가
        const { error } = await tables.appointments()
          .insert([formData])
        
        if (error) throw error
      }
      
      setShowAddModal(false)
      setEditingAppointment(null)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('예약 저장 오류:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('정말로 이 예약을 삭제하시겠습니까?')) return
    
    try {
      const { error } = await tables.appointments()
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('예약 삭제 오류:', error)
    }
  }

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment)
    setFormData({
      customer_id: appointment.customer_id || '',
      product_id: appointment.product_id || '',
      datetime: appointment.datetime ? new Date(appointment.datetime).toISOString().slice(0, 16) : '',
      memo: appointment.memo || '',
      status: appointment.status || 'scheduled'
    })
    setShowAddModal(true)
  }

  const resetForm = () => {
    setFormData({
      customer_id: '',
      product_id: '',
      datetime: '',
      memo: '',
      status: 'scheduled'
    })
  }

  const statusOptions = [
    { value: 'scheduled', label: '예약됨', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: '완료', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: '취소', color: 'bg-red-100 text-red-800' },
    { value: 'no-show', label: '미방문', color: 'bg-yellow-100 text-yellow-800' }
  ]

  const filteredAppointments = appointments.filter(appointment => {
    const matchesDate = !filters.date || appointment.datetime?.includes(filters.date)
    const matchesStatus = !filters.status || appointment.status === filters.status
    return matchesDate && matchesStatus
  })

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
            setEditingAppointment(null)
            resetForm()
            setShowAddModal(true)
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          예약 추가
        </button>
      </div>

      {/* 필터 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">날짜</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({...filters, date: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">상태</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">전체</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 예약 목록 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredAppointments.map((appointment) => (
            <li key={appointment.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.customers?.name}
                        </p>
                        <div className="ml-2 flex items-center">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500 ml-1">
                            {appointment.customers?.phone}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center mt-1">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500 ml-1">
                          {appointment.products?.name}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          (₩{appointment.products?.price?.toLocaleString()})
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500 ml-1">
                          {new Date(appointment.datetime).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusOptions.find(option => option.value === appointment.status)?.color
                    }`}>
                      {statusOptions.find(option => option.value === appointment.status)?.label}
                    </span>
                    <button
                      onClick={() => handleEdit(appointment)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(appointment.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {appointment.memo && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">{appointment.memo}</p>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
        
        {filteredAppointments.length === 0 && (
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
                {editingAppointment ? '예약 수정' : '새 예약 추가'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">고객 *</label>
                  <select
                    required
                    value={formData.customer_id}
                    onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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
                  <label className="block text-sm font-medium text-gray-700">상품 *</label>
                  <select
                    required
                    value={formData.product_id}
                    onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="">상품을 선택하세요</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ₩{product.price?.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">예약일시 *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.datetime}
                    onChange={(e) => setFormData({...formData, datetime: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">상태</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">메모</label>
                  <textarea
                    value={formData.memo}
                    onChange={(e) => setFormData({...formData, memo: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingAppointment(null)
                      resetForm()
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {editingAppointment ? '수정' : '추가'}
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