import { useState, useEffect } from 'react'
import { tables, functions } from '../lib/supabase'
import { Plus, Search, Edit, Trash2, Phone, Calendar, Gift, Eye, Clock, ShoppingCart } from 'lucide-react'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerAppointments, setCustomerAppointments] = useState([])
  const [customerPurchases, setCustomerPurchases] = useState([])
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birth_date: '',
    skin_type: '',
    memo: '',
    point: 0
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const { data, error } = await tables.customers()
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('고객 목록 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingCustomer) {
        // 수정
        const { error } = await tables.customers()
          .update(formData)
          .eq('id', editingCustomer.id)
        
        if (error) throw error
      } else {
        // 추가
        const { error } = await tables.customers()
          .insert([formData])
        
        if (error) throw error
      }
      
      setShowAddModal(false)
      setEditingCustomer(null)
      resetForm()
      fetchCustomers()
    } catch (error) {
      console.error('고객 저장 오류:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('정말로 이 고객을 삭제하시겠습니까?')) return
    
    try {
      const { error } = await tables.customers()
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchCustomers()
    } catch (error) {
      console.error('고객 삭제 오류:', error)
    }
  }

  const handleEdit = (customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name || '',
      phone: customer.phone || '',
      birth_date: customer.birth_date || '',
      skin_type: customer.skin_type || '',
      memo: customer.memo || '',
      point: customer.point || 0
    })
    setShowAddModal(true)
  }

  const handleViewDetails = async (customer) => {
    setSelectedCustomer(customer)
    setShowDetailModal(true)
    
    try {
      // 고객별 예약 내역 조회
      const { data: appointmentsData } = await functions.getCustomerAppointments(customer.id)
      setCustomerAppointments(appointmentsData || [])

      // 고객별 구매 내역 조회
      const { data: purchasesData, error: purchasesError } = await tables.purchases()
        .select(`
          *,
          products(name, price, type)
        `)
        .eq('customer_id', customer.id)
        .order('purchase_date', { ascending: false })

      if (!purchasesError) {
        setCustomerPurchases(purchasesData || [])
      }
    } catch (error) {
      console.error('고객 상세 정보 조회 오류:', error)
    }
  }

  const handlePointUpdate = async (customerId, newPoint) => {
    try {
      const { error } = await tables.customers()
        .update({ point: newPoint })
        .eq('id', customerId)
      
      if (error) throw error
      fetchCustomers()
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer({ ...selectedCustomer, point: newPoint })
      }
    } catch (error) {
      console.error('포인트 업데이트 오류:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      birth_date: '',
      skin_type: '',
      memo: '',
      point: 0
    })
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  )

  const skinTypeOptions = [
    { value: 'dry', label: '건성' },
    { value: 'oily', label: '지성' },
    { value: 'combination', label: '복합성' },
    { value: 'sensitive', label: '민감성' },
    { value: 'normal', label: '중성' }
  ]

  const getSkinTypeLabel = (type) => {
    const option = skinTypeOptions.find(opt => opt.value === type)
    return option ? option.label : type
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-'
    return new Date(dateTimeString).toLocaleString('ko-KR')
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
          <h1 className="text-2xl font-bold text-gray-900">고객 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            총 {customers.length}명의 고객이 등록되어 있습니다.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          고객 추가
        </button>
      </div>

      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="고객 이름 또는 전화번호로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* 고객 목록 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredCustomers.map((customer) => (
            <li key={customer.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-medium">
                        {customer.name?.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {customer.name}
                      </p>
                      <div className="flex items-center space-x-1">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{customer.phone}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {customer.birth_date ? formatDate(customer.birth_date) : '생일 미등록'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-500">
                          피부타입: {getSkinTypeLabel(customer.skin_type)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Gift className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          포인트: {customer.point || 0}P
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewDetails(customer)}
                    className="text-gray-400 hover:text-gray-600"
                    title="상세보기"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleEdit(customer)}
                    className="text-gray-400 hover:text-blue-600"
                    title="수정"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="text-gray-400 hover:text-red-600"
                    title="삭제"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 고객 추가/수정 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCustomer ? '고객 정보 수정' : '새 고객 추가'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">이름</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">전화번호</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">생일</label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">피부타입</label>
                  <select
                    value={formData.skin_type}
                    onChange={(e) => setFormData({ ...formData, skin_type: e.target.value })}
                    className="input-field"
                  >
                    <option value="">선택하세요</option>
                    {skinTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">포인트</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.point}
                    onChange={(e) => setFormData({ ...formData, point: parseInt(e.target.value) || 0 })}
                    className="input-field"
                  />
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
                      setEditingCustomer(null)
                      resetForm()
                    }}
                    className="btn-secondary"
                  >
                    취소
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingCustomer ? '수정' : '추가'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 고객 상세보기 모달 */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedCustomer.name} 고객 상세정보
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">닫기</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 고객 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">기본 정보</h4>
                  <div className="space-y-2">
                    <div><span className="font-medium">이름:</span> {selectedCustomer.name}</div>
                    <div><span className="font-medium">전화번호:</span> {selectedCustomer.phone}</div>
                    <div><span className="font-medium">생일:</span> {formatDate(selectedCustomer.birth_date)}</div>
                    <div><span className="font-medium">피부타입:</span> {getSkinTypeLabel(selectedCustomer.skin_type)}</div>
                    <div><span className="font-medium">포인트:</span> {selectedCustomer.point || 0}P</div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">포인트 관리</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        value={selectedCustomer.point || 0}
                        onChange={(e) => {
                          const newPoint = parseInt(e.target.value) || 0
                          setSelectedCustomer({ ...selectedCustomer, point: newPoint })
                        }}
                        className="input-field w-24"
                      />
                      <button
                        onClick={() => handlePointUpdate(selectedCustomer.id, selectedCustomer.point)}
                        className="btn-primary text-sm"
                      >
                        포인트 수정
                      </button>
                    </div>
                    {selectedCustomer.memo && (
                      <div>
                        <span className="font-medium">메모:</span>
                        <p className="text-sm text-gray-600 mt-1">{selectedCustomer.memo}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 예약 내역 */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  예약 내역 ({customerAppointments.length}건)
                </h4>
                <div className="bg-white border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가격</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customerAppointments.map((appointment) => (
                        <tr key={appointment.appointment_id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDateTime(appointment.datetime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {appointment.product_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {appointment.product_price?.toLocaleString()}원
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              appointment.status === 'no-show' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {appointment.status === 'scheduled' ? '예약됨' :
                               appointment.status === 'completed' ? '완료' :
                               appointment.status === 'cancelled' ? '취소' :
                               appointment.status === 'no-show' ? '미방문' : appointment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 구매 내역 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  구매 내역 ({customerPurchases.length}건)
                </h4>
                <div className="bg-white border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">구매일</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수량</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총액</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customerPurchases.map((purchase) => (
                        <tr key={purchase.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(purchase.purchase_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {purchase.products?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {purchase.quantity}개
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(purchase.products?.price * purchase.quantity)?.toLocaleString()}원
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}