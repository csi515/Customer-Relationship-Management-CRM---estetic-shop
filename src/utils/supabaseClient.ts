import { createClient } from '@supabase/supabase-js';

// Supabase 연결 정보 - 환경변수 우선, 기본값은 개발용
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 
                    import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
                    'https://wysihrzbnxhfnymtnvzj.supabase.co';

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                         import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                         'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5c2locnpibnhoZm55bXRudnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTI3MjUsImV4cCI6MjA2NjA4ODcyNX0.u4UNIJikLf529VE3TSSTBzngOQ_H6OHKaUeEwYa41fY';

// 안전한 Supabase 클라이언트 생성
export const createSafeSupabaseClient = () => {
  // 브라우저 환경 확인
  if (typeof window === 'undefined') {
    console.log('서버 환경에서 Supabase 클라이언트 초기화 건너뜀');
    return null;
  }

  // 환경변수 디버깅 (프로덕션에서도 로그 출력)
  console.log('Supabase 연결 정보 확인:', {
    url: SUPABASE_URL,
    hasAnonKey: !!SUPABASE_ANON_KEY,
    envMode: import.meta.env.MODE,
    isDev: import.meta.env.DEV,
    hasEnvUrl: !!import.meta.env.VITE_SUPABASE_URL,
    hasEnvKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
  });

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Supabase URL 또는 Anon Key가 설정되지 않았습니다.');
    console.error('환경변수 상태:', {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SUPABASE_URL: import.meta.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });
    return null;
  }

  try {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        storage: window.localStorage
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-js/2.50.2'
        },
        fetch: window.fetch.bind(window)
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
    
    console.log('Supabase 클라이언트 생성 성공');
    return client;
  } catch (error) {
    console.error('Supabase 클라이언트 생성 실패:', error);
    return null;
  }
};

// 단일 인스턴스 생성
export const supabaseClient = createSafeSupabaseClient(); 