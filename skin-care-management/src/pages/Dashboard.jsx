import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { tables, functions } from '../lib/supabase'
import { Users, Package, Calendar, DollarSign, TrendingUp, TrendingDown, Clock, ShoppingCart, Eye, CheckCircle, XCircle } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    totalAppointments: 0,
    totalPurchases: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    todayAppointments: 0,
    upcomingAppointments: 0
  })
  const [recentAppointments, setRecentAppointments] = useState([])
  const [recentPurchases, setRecentPurchases] = useState([])
  const [recentCustomers, setRecentCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // 기본 통계 조회
      const [
        { count: customerCount },
        { count: productCount },
        { count: appointmentCount },
        { count: purchaseCount }
      ] = await Promise.all([
        tables.customers().select('*', { count: 'exact', head: true }),
        tables.products().select('*', { count: 'exact', head: true }),
        tables.appointments().select('*', { count: 'exact', head: true }),
        tables.purchases().select('*', { count: 'exact', head: true })
      ])

      // 이번 달 재무 조회
      const currentDate = new Date()
      const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
      
      const { data: monthlyStats } = await functions.getMonthlyFinanceStats(monthYear)
      
      const monthlyIncome = monthlyStats?.reduce((sum, stat) => sum + (stat.income_total || 0), 0) || 0
      const monthlyExpenses = monthlyStats?.reduce((sum, stat) => sum + (stat.expense_total || 0), 0) || 0

      // 오늘 예약 조회
      const today = new Date().toISOString().split('T')[0]
      const { data: todayAppointments } = await tables.appointments()
        .select('*')
        .gte('datetime', `${today}T00:00:00`)
        .lte('datetime', `${today}T23:59:59`)
        .eq('status', 'scheduled')

      // 다가오는 예약 조회 (다음 7일)
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      const { data: upcomingAppointments } = await tables.appointments()
        .select('*')
        .gte('datetime', new Date().toISOString())
        .lte('datetime', nextWeek.toISOString())
        .eq('status', 'scheduled')
        .order('datetime', { ascending: true })
        .limit(5)

      // 최근 활동 조회
      const [
        { data: recentAppointmentsData },
        { data: recentPurchasesData },
        { data: recentCustomersData }
      ] = await Promise.all([
        tables.appointments()
          .select(`
            *,
            customers(name, phone),
            products(name, price)
          `)
          .order('created_at', { ascending: false })
          .limit(5),
        tables.purchases()
          .select(`
            *,
            customers(name, phone),
            products(name, price)
          `)
          .order('created_at', { ascending: false })
          .limit(5),
        tables.customers()
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)
      ])

      setStats({
        totalCustomers: customerCount || 0,
        totalProducts: productCount || 0,
        totalAppointments: appointmentCount || 0,
        totalPurchases: purchaseCount || 0,
        monthlyIncome,
        monthlyExpenses,
        todayAppointments: todayAppointments?.length || 0,
        upcomingAppointments: upcomingAppointments?.length || 0
      })

      setRecentAppointments(recentAppointmentsData || [])
      setRecentPurchases(recentPurchasesData || [])
      setRecentCustomers(recentCustomersData || [])
    } catch (error) {
      console.error('대시보드 데이터 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-'
    return new Date(dateTimeString).toLocaleString('ko-KR')
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'no-show': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'scheduled': return '예약됨'
      case 'completed': return '완료'
      case 'cancelled': return '취소'
      case 'no-show': return '미방문'
      default: return status
    }
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-1 text-sm text-gray-500">
          안녕하세요! 오늘도 좋은 하루 되세요.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">총 고객</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalCustomers}명</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">총 상품</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalProducts}개</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">총 예약</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalAppointments}건</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">총 구매</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalPurchases}건</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 재무 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">이번 달 수입</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.monthlyIncome.toLocaleString()}원</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">이번 달 지출</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.monthlyExpenses.toLocaleString()}원</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">이번 달 순이익</dt>
                  <dd className={`text-lg font-medium ${stats.monthlyIncome - stats.monthlyExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(stats.monthlyIncome - stats.monthlyExpenses).toLocaleString()}원
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 오늘의 예약 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              오늘의 예약 ({stats.todayAppointments}건)
            </h3>
          </div>
          {stats.todayAppointments > 0 ? (
            <div className="space-y-3">
              {recentAppointments
                .filter(appointment => {
                  const today = new Date().toISOString().split('T')[0]
                  return appointment.datetime?.includes(today) && appointment.status === 'scheduled'
                })
                .slice(0, 3)
                .map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDateTime(appointment.datetime)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {appointment.customers?.name} - {appointment.products?.name}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      예약됨
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">오늘 예약된 시술이 없습니다.</p>
          )}
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 예약 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">최근 예약</h3>
            <div className="space-y-3">
              {recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {appointment.customers?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.products?.name} - {formatDateTime(appointment.datetime)}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                    {getStatusLabel(appointment.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 최근 구매 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">최근 구매</h3>
            <div className="space-y-3">
              {recentPurchases.map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {purchase.customers?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {purchase.products?.name} x {purchase.quantity}개
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {(purchase.products?.price * purchase.quantity)?.toLocaleString()}원
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(purchase.purchase_date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 최근 고객 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">최근 등록 고객</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentCustomers.map((customer) => (
              <div key={customer.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-medium">
                    {customer.name?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {customer.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {customer.phone}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(customer.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}