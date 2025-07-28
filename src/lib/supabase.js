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
  
  // 시술 내역 테이블
  treatments: () => supabase.from('treatments'),
  
  // 예약 테이블
  reservations: () => supabase.from('reservations'),
  
  // 수입/지출 테이블
  transactions: () => supabase.from('transactions'),
  
  // 직원 테이블
  employees: () => supabase.from('employees'),
  
  // 지점 테이블
  branches: () => supabase.from('branches')
}