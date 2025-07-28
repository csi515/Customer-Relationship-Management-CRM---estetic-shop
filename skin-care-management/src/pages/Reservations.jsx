import { useState, useEffect } from 'react'
import { tables } from '../lib/supabase'
import { Plus, Calendar, Clock, User, Phone, Package, Filter, Edit, Trash2, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

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

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const { error } = await tables.appointments()
        .update({ status: newStatus })
        .eq('id', appointmentId)
      
      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('예약 상태 변경 오류:', error)
    }
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
    { value: 'scheduled', label: '예약됨', color: 'bg-blue-100 text-blue-800', icon: Clock },
    { value: 'completed', label: '완료', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'cancelled', label: '취소', color: 'bg-red-100 text-red-800', icon: XCircle },
    { value: 'no-show', label: '미방문', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle }
  ]

  const filteredAppointments = appointments.filter(appointment => {
    const matchesDate = !filters.date || appointment.datetime?.includes(filters.date)
    const matchesStatus = !filters.status || appointment.status === filters.status
    return matchesDate && matchesStatus
  })

  const getStatusInfo = (status) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0]
  }

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-'
    return new Date(dateTimeString).toLocaleString('ko-KR')
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const getUpcomingAppointments = () => {
    const now = new Date()
    return appointments.filter(appointment => 
      new Date(appointment.datetime) > now && appointment.status === 'scheduled'
    ).slice(0, 5)
  }

  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.filter(appointment => 
      appointment.datetime?.includes(today) && appointment.status === 'scheduled'
    )
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
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">예약 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            총 {appointments.length}개의 예약이 등록되어 있습니다.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          예약 추가
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">전체 예약</dt>
                  <dd className="text-lg font-medium text-gray-900">{appointments.length}건</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">예약됨</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {appointments.filter(a => a.status === 'scheduled').length}건
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">완료</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {appointments.filter(a => a.status === 'completed').length}건
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">오늘 예약</dt>
                  <dd className="text-lg font-medium text-gray-900">{getTodayAppointments().length}건</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">날짜 필터</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">상태 필터</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input-field"
            >
              <option value="">전체</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ date: '', status: '' })}
              className="btn-secondary"
            >
              필터 초기화
            </button>
          </div>
        </div>
      </div>

      {/* 예약 목록 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredAppointments.map((appointment) => {
            const statusInfo = getStatusInfo(appointment.status)
            const StatusIcon = statusInfo.icon
            
            return (
              <li key={appointment.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {formatDateTime(appointment.datetime)}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {appointment.customers?.name}
                          </span>
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {appointment.customers?.phone}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {appointment.products?.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({appointment.products?.price?.toLocaleString()}원)
                          </span>
                        </div>
                      </div>
                      {appointment.memo && (
                        <p className="text-sm text-gray-600 mt-1">
                          메모: {appointment.memo}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {appointment.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                          className="text-green-400 hover:text-green-600"
                          title="완료"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                          className="text-red-400 hover:text-red-600"
                          title="취소"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'no-show')}
                          className="text-yellow-400 hover:text-yellow-600"
                          title="미방문"
                        >
                          <AlertCircle className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleEdit(appointment)}
                      className="text-gray-400 hover:text-blue-600"
                      title="수정"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(appointment.id)}
                      className="text-gray-400 hover:text-red-600"
                      title="삭제"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
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
                  <label className="block text-sm font-medium text-gray-700">고객</label>
                  <select
                    required
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700">상품</label>
                  <select
                    required
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    className="input-field"
                  >
                    <option value="">상품을 선택하세요</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.price?.toLocaleString()}원)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">예약 날짜/시간</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.datetime}
                    onChange={(e) => setFormData({ ...formData, datetime: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">상태</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-field"
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
                    onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                    rows="3"
                    className="input-field"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingAppointment(null)
                      resetForm()
                    }}
                    className="btn-secondary"
                  >
                    취소
                  </button>
                  <button type="submit" className="btn-primary">
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