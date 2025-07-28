import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 인증 관련 함수들
export const auth = {
  // 로그인
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // 로그아웃
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // 현재 사용자 가져오기
  getCurrentUser: () => {
    return supabase.auth.getUser()
  },

  // 인증 상태 변경 감지
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// 데이터베이스 테이블들
export const tables = {
  // 고객 테이블
  customers: () => supabase.from('customers'),
  
  // 상품 테이블
  products: () => supabase.from('products'),
  
  // 예약 테이블
  appointments: () => supabase.from('appointments'),
  
  // 구매 내역 테이블
  purchases: () => supabase.from('purchases'),
  
  // 재무 테이블
  finance: () => supabase.from('finance'),
  
  // 설정 테이블
  settings: () => supabase.from('settings')
}

// 뷰들
export const views = {
  // 예약 상세 정보 뷰
  appointmentDetails: () => supabase.from('appointment_details'),
  
  // 재무 요약 뷰
  financeSummary: () => supabase.from('finance_summary')
}

// 함수들
export const functions = {
  // 고객별 예약 조회
  getCustomerAppointments: async (customerId) => {
    const { data, error } = await supabase.rpc('get_customer_appointments', {
      customer_uuid: customerId,
      current_user_id: (await supabase.auth.getUser()).data.user?.id
    })
    return { data, error }
  },

  // 월별 재무 통계
  getMonthlyFinanceStats: async (monthYear) => {
    const { data, error } = await supabase.rpc('get_monthly_finance_stats', {
      month_year: monthYear,
      current_user_id: (await supabase.auth.getUser()).data.user?.id
    })
    return { data, error }
  }
}