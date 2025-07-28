import { useState, useEffect } from 'react'
import { tables } from '../lib/supabase'
import { Plus, Search, Edit, Trash2, Calendar, DollarSign } from 'lucide-react'

export default function Treatments() {
  const [treatments, setTreatments] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTreatment, setEditingTreatment] = useState(null)
  const [formData, setFormData] = useState({
    customer_id: '',
    treatment_date: '',
    treatment_name: '',
    products_used: '',
    cost: '',
    memo: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // 시술 내역 조회
      const { data: treatmentsData, error: treatmentsError } = await tables.treatments()
        .select(`
          *,
          customers(name, phone)
        `)
        .order('treatment_date', { ascending: false })

      if (treatmentsError) throw treatmentsError

      // 고객 목록 조회
      const { data: customersData, error: customersError } = await tables.customers()
        .select('id, name, phone')
        .order('name')

      if (customersError) throw customersError

      setTreatments(treatmentsData || [])
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
      if (editingTreatment) {
        // 수정
        const { error } = await tables.treatments()
          .update(formData)
          .eq('id', editingTreatment.id)
        
        if (error) throw error
      } else {
        // 추가
        const { error } = await tables.treatments()
          .insert([formData])
        
        if (error) throw error
      }
      
      setShowAddModal(false)
      setEditingTreatment(null)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('시술 내역 저장 오류:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('정말로 이 시술 내역을 삭제하시겠습니까?')) return
    
    try {
      const { error } = await tables.treatments()
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('시술 내역 삭제 오류:', error)
    }
  }

  const handleEdit = (treatment) => {
    setEditingTreatment(treatment)
    setFormData({
      customer_id: treatment.customer_id || '',
      treatment_date: treatment.treatment_date || '',
      treatment_name: treatment.treatment_name || '',
      products_used: treatment.products_used || '',
      cost: treatment.cost || '',
      memo: treatment.memo || ''
    })
    setShowAddModal(true)
  }

  const resetForm = () => {
    setFormData({
      customer_id: '',
      treatment_date: '',
      treatment_name: '',
      products_used: '',
      cost: '',
      memo: ''
    })
  }

  const filteredTreatments = treatments.filter(treatment =>
    treatment.treatment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    treatment.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    treatment.products_used?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <h1 className="text-2xl font-bold text-gray-900">시술 내역</h1>
        <button
          onClick={() => {
            setEditingTreatment(null)
            resetForm()
            setShowAddModal(true)
          }}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          시술 추가
        </button>
      </div>

      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="시술명, 고객명, 사용 제품으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* 시술 내역 목록 */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  고객명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  시술일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  시술명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  사용 제품
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  비용
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
              {filteredTreatments.map((treatment) => (
                <tr key={treatment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {treatment.customers?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {treatment.customers?.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {treatment.treatment_date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {treatment.treatment_name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {treatment.products_used}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" />
                      ₩{treatment.cost?.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {treatment.memo}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(treatment)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(treatment.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTreatments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">시술 내역이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 시술 추가/수정 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingTreatment ? '시술 내역 수정' : '새 시술 추가'}
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
                  <label className="block text-sm font-medium text-gray-700">시술일 *</label>
                  <input
                    type="date"
                    required
                    value={formData.treatment_date}
                    onChange={(e) => setFormData({...formData, treatment_date: e.target.value})}
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
                  <label className="block text-sm font-medium text-gray-700">사용 제품</label>
                  <input
                    type="text"
                    value={formData.products_used}
                    onChange={(e) => setFormData({...formData, products_used: e.target.value})}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">비용</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    className="input-field"
                    placeholder="0"
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
                      setEditingTreatment(null)
                      resetForm()
                    }}
                    className="btn-secondary"
                  >
                    취소
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingTreatment ? '수정' : '추가'}
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