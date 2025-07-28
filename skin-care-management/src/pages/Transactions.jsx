import { useState, useEffect } from 'react'
import { tables, views } from '../lib/supabase'
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar, Filter, Edit, Trash2 } from 'lucide-react'

export default function Transactions() {
  const [finance, setFinance] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [formData, setFormData] = useState({
    date: '',
    type: 'income',
    title: '',
    amount: '',
    memo: ''
  })
  const [filters, setFilters] = useState({
    date: '',
    type: ''
  })

  useEffect(() => {
    fetchFinance()
  }, [])

  const fetchFinance = async () => {
    try {
      const { data, error } = await tables.finance()
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      setFinance(data || [])
    } catch (error) {
      console.error('재무 데이터 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const submitData = {
        ...formData,
        amount: parseInt(formData.amount)
      }

      if (editingTransaction) {
        // 수정
        const { error } = await tables.finance()
          .update(submitData)
          .eq('id', editingTransaction.id)
        
        if (error) throw error
      } else {
        // 추가
        const { error } = await tables.finance()
          .insert([submitData])
        
        if (error) throw error
      }
      
      setShowAddModal(false)
      setEditingTransaction(null)
      resetForm()
      fetchFinance()
    } catch (error) {
      console.error('재무 데이터 저장 오류:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('정말로 이 내역을 삭제하시겠습니까?')) return
    
    try {
      const { error } = await tables.finance()
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchFinance()
    } catch (error) {
      console.error('재무 데이터 삭제 오류:', error)
    }
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      date: transaction.date || '',
      type: transaction.type || 'income',
      title: transaction.title || '',
      amount: transaction.amount || '',
      memo: transaction.memo || ''
    })
    setShowAddModal(true)
  }

  const resetForm = () => {
    setFormData({
      date: '',
      type: 'income',
      title: '',
      amount: '',
      memo: ''
    })
  }

  const filteredFinance = finance.filter(transaction => {
    const matchesDate = !filters.date || transaction.date === filters.date
    const matchesType = !filters.type || transaction.type === filters.type
    return matchesDate && matchesType
  })

  const totalIncome = filteredFinance
    .filter(item => item.type === 'income')
    .reduce((sum, item) => sum + (item.amount || 0), 0)

  const totalExpense = filteredFinance
    .filter(item => item.type === 'expense')
    .reduce((sum, item) => sum + (item.amount || 0), 0)

  const netIncome = totalIncome - totalExpense

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
        <h1 className="text-2xl font-bold text-gray-900">재무 관리</h1>
        <button
          onClick={() => {
            setEditingTransaction(null)
            resetForm()
            setShowAddModal(true)
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          내역 추가
        </button>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">총 수익</p>
                <p className="text-2xl font-semibold text-green-600">₩{totalIncome.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">총 지출</p>
                <p className="text-2xl font-semibold text-red-600">₩{totalExpense.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">순이익</p>
                <p className={`text-2xl font-semibold ${netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ₩{netIncome.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
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
              <label className="block text-sm font-medium text-gray-700">유형</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">전체</option>
                <option value="income">수익</option>
                <option value="expense">지출</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 재무 내역 목록 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredFinance.map((transaction) => (
            <li key={transaction.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">{transaction.title}</p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type === 'income' ? '수익' : '지출'}
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500 ml-1">{transaction.date}</span>
                      </div>
                      {transaction.memo && (
                        <p className="text-sm text-gray-600 mt-1">{transaction.memo}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className={`text-lg font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ₩{transaction.amount?.toLocaleString()}
                    </p>
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
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
        
        {filteredFinance.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">재무 데이터가 없습니다.</p>
          </div>
        )}
      </div>

      {/* 재무 내역 추가/수정 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingTransaction ? '재무 내역 수정' : '새 재무 내역 추가'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">날짜 *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">유형 *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="income">수익</option>
                    <option value="expense">지출</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">항목 *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">금액 *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="0"
                  />
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
                      setEditingTransaction(null)
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
                    {editingTransaction ? '수정' : '추가'}
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