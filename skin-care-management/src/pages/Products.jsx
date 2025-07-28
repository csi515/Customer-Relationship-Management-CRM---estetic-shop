import { useState, useEffect } from 'react'
import { tables } from '../lib/supabase'
import { Plus, Search, Edit, Trash2, Package, DollarSign, Tag, ToggleLeft, ToggleRight, Eye, Calendar, ShoppingCart, TrendingUp } from 'lucide-react'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productAppointments, setProductAppointments] = useState([])
  const [productPurchases, setProductPurchases] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    type: 'single',
    count: '',
    status: 'active',
    description: ''
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await tables.products()
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('상품 목록 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const submitData = {
        ...formData,
        price: parseInt(formData.price),
        count: formData.type === 'voucher' ? parseInt(formData.count) : null
      }

      if (editingProduct) {
        // 수정
        const { error } = await tables.products()
          .update(submitData)
          .eq('id', editingProduct.id)
        
        if (error) throw error
      } else {
        // 추가
        const { error } = await tables.products()
          .insert([submitData])
        
        if (error) throw error
      }
      
      setShowAddModal(false)
      setEditingProduct(null)
      resetForm()
      fetchProducts()
    } catch (error) {
      console.error('상품 저장 오류:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('정말로 이 상품을 삭제하시겠습니까?')) return
    
    try {
      const { error } = await tables.products()
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchProducts()
    } catch (error) {
      console.error('상품 삭제 오류:', error)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name || '',
      price: product.price || '',
      type: product.type || 'single',
      count: product.count || '',
      status: product.status || 'active',
      description: product.description || ''
    })
    setShowAddModal(true)
  }

  const handleViewDetails = async (product) => {
    setSelectedProduct(product)
    setShowDetailModal(true)
    
    try {
      // 상품별 예약 내역 조회
      const { data: appointmentsData, error: appointmentsError } = await tables.appointments()
        .select(`
          *,
          customers(name, phone)
        `)
        .eq('product_id', product.id)
        .order('datetime', { ascending: false })

      if (!appointmentsError) {
        setProductAppointments(appointmentsData || [])
      }

      // 상품별 구매 내역 조회
      const { data: purchasesData, error: purchasesError } = await tables.purchases()
        .select(`
          *,
          customers(name, phone)
        `)
        .eq('product_id', product.id)
        .order('purchase_date', { ascending: false })

      if (!purchasesError) {
        setProductPurchases(purchasesData || [])
      }
    } catch (error) {
      console.error('상품 상세 정보 조회 오류:', error)
    }
  }

  const handleToggleStatus = async (product) => {
    try {
      const newStatus = product.status === 'active' ? 'inactive' : 'active'
      const { error } = await tables.products()
        .update({ status: newStatus })
        .eq('id', product.id)
      
      if (error) throw error
      fetchProducts()
    } catch (error) {
      console.error('상품 상태 변경 오류:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      type: 'single',
      count: '',
      status: 'active',
      description: ''
    })
  }

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const typeOptions = [
    { value: 'single', label: '단일 시술' },
    { value: 'voucher', label: '바우처' }
  ]

  const statusOptions = [
    { value: 'active', label: '활성' },
    { value: 'inactive', label: '비활성' }
  ]

  const getTypeLabel = (type) => {
    const option = typeOptions.find(opt => opt.value === type)
    return option ? option.label : type
  }

  const getStatusLabel = (status) => {
    const option = statusOptions.find(opt => opt.value === status)
    return option ? option.label : status
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-'
    return new Date(dateTimeString).toLocaleString('ko-KR')
  }

  const calculateTotalRevenue = () => {
    return products.reduce((total, product) => {
      return total + (product.price || 0)
    }, 0)
  }

  const getActiveProductsCount = () => {
    return products.filter(product => product.status === 'active').length
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
          <h1 className="text-2xl font-bold text-gray-900">상품 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            총 {products.length}개의 상품이 등록되어 있습니다.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          상품 추가
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">전체 상품</dt>
                  <dd className="text-lg font-medium text-gray-900">{products.length}개</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">활성 상품</dt>
                  <dd className="text-lg font-medium text-gray-900">{getActiveProductsCount()}개</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">총 상품 가치</dt>
                  <dd className="text-lg font-medium text-gray-900">{calculateTotalRevenue().toLocaleString()}원</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="상품명 또는 설명으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* 상품 목록 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredProducts.map((product) => (
            <li key={product.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {getStatusLabel(product.status)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {product.price?.toLocaleString()}원
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Tag className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {getTypeLabel(product.type)}
                        </span>
                      </div>
                      {product.type === 'voucher' && product.count && (
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-gray-500">
                            {product.count}회
                          </span>
                        </div>
                      )}
                    </div>
                    {product.description && (
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {product.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewDetails(product)}
                    className="text-gray-400 hover:text-gray-600"
                    title="상세보기"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-gray-400 hover:text-blue-600"
                    title="수정"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(product)}
                    className="text-gray-400 hover:text-yellow-600"
                    title={product.status === 'active' ? '비활성화' : '활성화'}
                  >
                    {product.status === 'active' ? (
                      <ToggleLeft className="h-5 w-5" />
                    ) : (
                      <ToggleRight className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
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

      {/* 상품 추가/수정 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingProduct ? '상품 정보 수정' : '새 상품 추가'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">상품명</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">가격</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">상품 타입</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-field"
                  >
                    {typeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {formData.type === 'voucher' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">횟수</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.count}
                      onChange={(e) => setFormData({ ...formData, count: e.target.value })}
                      className="input-field"
                    />
                  </div>
                )}
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
                  <label className="block text-sm font-medium text-gray-700">설명</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="input-field"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingProduct(null)
                      resetForm()
                    }}
                    className="btn-secondary"
                  >
                    취소
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingProduct ? '수정' : '추가'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 상품 상세보기 모달 */}
      {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedProduct.name} 상품 상세정보
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

              {/* 상품 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">기본 정보</h4>
                  <div className="space-y-2">
                    <div><span className="font-medium">상품명:</span> {selectedProduct.name}</div>
                    <div><span className="font-medium">가격:</span> {selectedProduct.price?.toLocaleString()}원</div>
                    <div><span className="font-medium">타입:</span> {getTypeLabel(selectedProduct.type)}</div>
                    {selectedProduct.type === 'voucher' && selectedProduct.count && (
                      <div><span className="font-medium">횟수:</span> {selectedProduct.count}회</div>
                    )}
                    <div><span className="font-medium">상태:</span> {getStatusLabel(selectedProduct.status)}</div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">통계</h4>
                  <div className="space-y-2">
                    <div><span className="font-medium">예약 횟수:</span> {productAppointments.length}회</div>
                    <div><span className="font-medium">구매 횟수:</span> {productPurchases.length}회</div>
                    <div><span className="font-medium">총 매출:</span> {
                      (selectedProduct.price * (productAppointments.length + productPurchases.length))?.toLocaleString()
                    }원</div>
                    {selectedProduct.description && (
                      <div>
                        <span className="font-medium">설명:</span>
                        <p className="text-sm text-gray-600 mt-1">{selectedProduct.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 예약 내역 */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  예약 내역 ({productAppointments.length}건)
                </h4>
                <div className="bg-white border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">고객</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전화번호</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {productAppointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDateTime(appointment.datetime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {appointment.customers?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {appointment.customers?.phone}
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
                  구매 내역 ({productPurchases.length}건)
                </h4>
                <div className="bg-white border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">구매일</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">고객</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전화번호</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수량</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총액</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {productPurchases.map((purchase) => (
                        <tr key={purchase.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(purchase.purchase_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {purchase.customers?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {purchase.customers?.phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {purchase.quantity}개
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(selectedProduct.price * purchase.quantity)?.toLocaleString()}원
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