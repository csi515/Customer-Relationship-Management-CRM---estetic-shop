import { useState, useEffect } from 'react'
import { tables } from '../lib/supabase'
import { Plus, Search, Edit, Trash2, User, Package, DollarSign, Calendar, Filter, Phone } from 'lucide-react'

export default function Purchases() {
  const [purchases, setPurchases] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState(null)
  const [formData, setFormData] = useState({
    customer_id: '',
    product_id: '',
    quantity: 1
  })
  const [filters, setFilters] = useState({
    date: '',
    customer_id: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // 구매 내역 조회
      const { data: purchasesData, error: purchasesError } = await tables.purchases()
        .select(`
          *,
          customers(name, phone),
          products(name, price, type)
        `)
        .order('purchase_date', { ascending: false })

      if (purchasesError) throw purchasesError

      // 고객 목록 조회
      const { data: customersData, error: customersError } = await tables.customers()
        .select('id, name, phone')
        .order('name')

      if (customersError) throw customersError

      // 상품 목록 조회
      const { data: productsData, error: productsError } = await tables.products()
        .select('id, name, price, type, status')
        .eq('status', 'active')
        .order('name')

      if (productsError) throw productsError

      setPurchases(purchasesData || [])
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
      const submitData = {
        ...formData,
        quantity: parseInt(formData.quantity)
      }

      if (editingPurchase) {
        // 수정
        const { error } = await tables.purchases()
          .update(submitData)
          .eq('id', editingPurchase.id)
        
        if (error) throw error
      } else {
        // 추가
        const { error } = await tables.purchases()
          .insert([submitData])
        
        if (error) throw error
      }
      
      setShowAddModal(false)
      setEditingPurchase(null)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('구매 내역 저장 오류:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('정말로 이 구매 내역을 삭제하시겠습니까?')) return
    
    try {
      const { error } = await tables.purchases()
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('구매 내역 삭제 오류:', error)
    }
  }

  const handleEdit = (purchase) => {
    setEditingPurchase(purchase)
    setFormData({
      customer_id: purchase.customer_id || '',
      product_id: purchase.product_id || '',
      quantity: purchase.quantity || 1
    })
    setShowAddModal(true)
  }

  const resetForm = () => {
    setFormData({
      customer_id: '',
      product_id: '',
      quantity: 1
    })
  }

  const calculateTotal = (purchase) => {
    return (purchase.products?.price || 0) * (purchase.quantity || 1)
  }

  const filteredPurchases = purchases.filter(purchase => {
    const matchesDate = !filters.date || purchase.purchase_date?.includes(filters.date)
    const matchesCustomer = !filters.customer_id || purchase.customer_id === filters.customer_id
    return matchesDate && matchesCustomer
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
        <h1 className="text-2xl font-bold text-gray-900">구매 내역</h1>
        <button
          onClick={() => {
            setEditingPurchase(null)
            resetForm()
            setShowAddModal(true)
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          구매 추가
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
              <label className="block text-sm font-medium text-gray-700">고객</label>
              <select
                value={filters.customer_id}
                onChange={(e) => setFilters({...filters, customer_id: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">전체 고객</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 구매 내역 목록 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredPurchases.map((purchase) => (
            <li key={purchase.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {purchase.customers?.name}
                        </p>
                        <div className="ml-2 flex items-center">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500 ml-1">
                            {purchase.customers?.phone}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center mt-1">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500 ml-1">
                          {purchase.products?.name}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({purchase.quantity}개)
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-900 ml-1">
                          ₩{calculateTotal(purchase).toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          (단가: ₩{purchase.products?.price?.toLocaleString()})
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500 ml-1">
                          {new Date(purchase.purchase_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(purchase)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(purchase.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        {filteredPurchases.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">구매 내역이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 구매 내역 추가/수정 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingPurchase ? '구매 내역 수정' : '새 구매 내역 추가'}
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
                  <label className="block text-sm font-medium text-gray-700">수량 *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="1"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingPurchase(null)
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
                    {editingPurchase ? '수정' : '추가'}
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