import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { tables, functions } from '../lib/supabase'
import { Users, Package, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    totalAppointments: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // 고객 수 조회
      const { count: customerCount } = await tables.customers()
        .select('*', { count: 'exact', head: true })

      // 상품 수 조회
      const { count: productCount } = await tables.products()
        .select('*', { count: 'exact', head: true })

      // 예약 수 조회
      const { count: appointmentCount } = await tables.appointments()
        .select('*', { count: 'exact', head: true })

      // 이번 달 재무 조회
      const currentDate = new Date()
      const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
      
      const { data: monthlyStats } = await functions.getMonthlyFinanceStats(monthYear)
      
      const monthlyIncome = monthlyStats?.reduce((sum, stat) => sum + (stat.income_total || 0), 0) || 0
      const monthlyExpenses = monthlyStats?.reduce((sum, stat) => sum + (stat.expense_total || 0), 0) || 0

      setStats({
        totalCustomers: customerCount || 0,
        totalProducts: productCount || 0,
        totalAppointments: appointmentCount || 0,
        monthlyIncome,
        monthlyExpenses
      })
    } catch (error) {
      console.error('대시보드 통계 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      name: '총 고객 수',
      value: stats.totalCustomers,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: '총 상품 수',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'increase'
    },
    {
      name: '예약 수',
      value: stats.totalAppointments,
      icon: Calendar,
      color: 'bg-purple-500',
      change: '+5%',
      changeType: 'increase'
    },
    {
      name: '이번 달 수익',
      value: `₩${stats.monthlyIncome.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '+15%',
      changeType: 'increase'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600">안녕하세요, {user?.email}님!</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="card p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.changeType === 'increase' ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`ml-2 text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="ml-2 text-sm text-gray-500">지난 달 대비</span>
            </div>
          </div>
        ))}
      </div>

      {/* 최근 활동 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">최근 고객</h3>
          <div className="space-y-3">
            <p className="text-gray-500 text-sm">고객 데이터가 없습니다.</p>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">최근 예약</h3>
          <div className="space-y-3">
            <p className="text-gray-500 text-sm">예약 데이터가 없습니다.</p>
          </div>
        </div>
      </div>

      {/* 수익/지출 요약 */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">이번 달 수익/지출</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="ml-2 text-sm font-medium text-green-600">수익</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-2">
              ₩{stats.monthlyIncome.toLocaleString()}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <span className="ml-2 text-sm font-medium text-red-600">지출</span>
            </div>
            <p className="text-2xl font-bold text-red-900 mt-2">
              ₩{stats.monthlyExpenses.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-lg font-semibold text-gray-900">
            순이익: ₩{(stats.monthlyIncome - stats.monthlyExpenses).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}