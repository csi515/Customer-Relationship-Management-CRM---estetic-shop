import { supabase } from './supabase';

export interface ConnectionTestResult {
  success: boolean;
  error?: string;
  details?: any;
}

export const testDatabaseConnection = async (): Promise<ConnectionTestResult> => {
  try {
    // 1. Supabase 클라이언트 확인
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase 클라이언트가 초기화되지 않았습니다.'
      };
    }

    // 2. 간단한 쿼리 테스트
    const { data, error } = await supabase
      .from('customers')
      .select('count')
      .limit(1);

    if (error) {
      return {
        success: false,
        error: `데이터베이스 연결 오류: ${error.message}`,
        details: {
          code: error.code,
          details: error.details,
          hint: error.hint,
          message: error.message
        }
      };
    }

    return {
      success: true,
      details: {
        message: '데이터베이스 연결 성공',
        data: data
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      details: {
        type: 'exception',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
};

export const testNetworkConnection = async (): Promise<ConnectionTestResult> => {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL || 
                import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
                'https://wysihrzbnxhfnymtnvzj.supabase.co';
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                   import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5c2locnpibnhoZm55bXRudnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTI3MjUsImV4cCI6MjA2NjA4ODcyNX0.u4UNIJikLf529VE3TSSTBzngOQ_H6OHKaUeEwYa41fY';

    if (!url || !anonKey) {
      return {
        success: false,
        error: '환경변수 누락: VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY',
        details: { 
          hasUrl: !!url, 
          hasKey: !!anonKey,
          envVars: {
            VITE_SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
            VITE_SUPABASE_ANON_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
            NEXT_PUBLIC_SUPABASE_URL: !!import.meta.env.NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: !!import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          }
        }
      };
    }

    // CORS 테스트를 위한 간단한 요청
    const response = await fetch(`${url}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          headers: Object.fromEntries(response.headers.entries())
        }
      };
    }

    return {
      success: true,
      details: {
        message: '네트워크 연결 성공',
        status: response.status,
        url: response.url
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '네트워크 연결 실패',
      details: {
        type: 'network_error',
        message: error instanceof Error ? error.message : 'Unknown network error',
        stack: error instanceof Error ? error.stack : undefined
      }
    };
  }
};

export const testCorsConnection = async (): Promise<ConnectionTestResult> => {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL || 
                import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
                'https://wysihrzbnxhfnymtnvzj.supabase.co';

    // CORS preflight 테스트
    const response = await fetch(`${url}/rest/v1/customers?select=count&limit=1`, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'apikey,authorization,content-type'
      }
    });

    return {
      success: response.ok,
      details: {
        status: response.status,
        corsHeaders: {
          'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
          'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
          'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        }
      }
    };

  } catch (error) {
    return {
      success: false,
      error: 'CORS 테스트 실패',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
};

export const getConnectionDiagnostics = async () => {
  const results = {
    database: await testDatabaseConnection(),
    network: await testNetworkConnection(),
    cors: await testCorsConnection(),
    environment: {
      mode: import.meta.env.MODE,
      hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
      hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      nodeEnv: import.meta.env.NODE_ENV,
      userAgent: navigator.userAgent,
      origin: window.location.origin,
      hostname: window.location.hostname
    }
  };

  return results;
}; 