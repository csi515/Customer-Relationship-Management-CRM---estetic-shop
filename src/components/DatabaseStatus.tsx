import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { getConnectionDiagnostics } from '../utils/connectionTest';

interface ConnectionStatus {
  isConnected: boolean;
  error: string | null;
  details: any;
}

const DatabaseStatus: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    error: null,
    details: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [diagnostics, setDiagnostics] = useState<any>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsLoading(true);
    const results: any[] = [];

    try {
      // 1. Supabase 클라이언트 존재 확인
      if (!supabase) {
        throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
      }
      results.push({ test: '클라이언트 초기화', status: '✅ 성공' });

      // 2. 기본 연결 테스트
      const { data, error } = await supabase.from('customers').select('count').limit(1);
      
      if (error) {
        throw new Error(`데이터베이스 연결 실패: ${error.message}`);
      }
      
      results.push({ test: '데이터베이스 연결', status: '✅ 성공' });
      results.push({ test: '테이블 접근', status: '✅ 성공' });

      setStatus({
        isConnected: true,
        error: null,
        details: { data }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      results.push({ test: '연결 테스트', status: '❌ 실패', error: errorMessage });
      
      setStatus({
        isConnected: false,
        error: errorMessage,
        details: null
      });
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const runDetailedTests = async () => {
    const detailedResults: any[] = [];
    
    try {
      // 1. 환경변수 확인
      const envInfo = {
        mode: import.meta.env.MODE,
        hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
        hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        nodeEnv: import.meta.env.NODE_ENV,
        origin: window.location.origin,
        hostname: window.location.hostname
      };
      detailedResults.push({ test: '환경변수 확인', status: '✅', details: envInfo });

      // 2. 네트워크 연결 테스트
      try {
        const response = await fetch('https://wysihrzbnxhfnymtnvzj.supabase.co/rest/v1/', {
          method: 'GET',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5c2locnpibnhoZm55bXRudnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTI3MjUsImV4cCI6MjA2NjA4ODcyNX0.u4UNIJikLf529VE3TSSTBzngOQ_H6OHKaUeEwYa41fY',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5c2locnpibnhoZm55bXRudnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTI3MjUsImV4cCI6MjA2NjA4ODcyNX0.u4UNIJikLf529VE3TSSTBzngOQ_H6OHKaUeEwYa41fY'
          }
        });
        detailedResults.push({ 
          test: '네트워크 연결', 
          status: response.ok ? '✅ 성공' : '❌ 실패',
          details: { status: response.status, statusText: response.statusText }
        });
      } catch (error) {
        detailedResults.push({ 
          test: '네트워크 연결', 
          status: '❌ 실패',
          details: { error: error instanceof Error ? error.message : '알 수 없는 오류' }
        });
      }

      // 3. 각 테이블 접근 테스트
      const tables = ['customers', 'products', 'appointments', 'finance'];
      for (const table of tables) {
        try {
          const { data, error } = await supabase.from(table).select('count').limit(1);
          detailedResults.push({ 
            test: `${table} 테이블 접근`, 
            status: error ? '❌ 실패' : '✅ 성공',
            details: error ? { error: error.message } : { count: data?.length || 0 }
          });
        } catch (error) {
          detailedResults.push({ 
            test: `${table} 테이블 접근`, 
            status: '❌ 실패',
            details: { error: error instanceof Error ? error.message : '알 수 없는 오류' }
          });
        }
      }

    } catch (error) {
      detailedResults.push({ 
        test: '상세 테스트', 
        status: '❌ 실패',
        details: { error: error instanceof Error ? error.message : '알 수 없는 오류' }
      });
    }

    setTestResults(detailedResults);
  };

  const runFullDiagnostics = async () => {
    setIsLoading(true);
    try {
      const diag = await getConnectionDiagnostics();
      setDiagnostics(diag);
    } catch (error) {
      console.error('진단 실행 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (isConnected: boolean) => {
    return isConnected ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (isConnected: boolean) => {
    return isConnected ? '🟢' : '🔴';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">🔌 데이터베이스 연결 상태</h2>
        <div className="flex gap-2">
          <button
            onClick={checkConnection}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm disabled:opacity-50"
          >
            {isLoading ? '확인 중...' : '연결 확인'}
          </button>
          <button
            onClick={runDetailedTests}
            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm"
          >
            상세 진단
          </button>
          <button
            onClick={runFullDiagnostics}
            className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-md text-sm"
          >
            전체 진단
          </button>
        </div>
      </div>

      {/* 연결 상태 표시 */}
      <div className="mb-4 p-4 border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{getStatusIcon(status.isConnected)}</span>
          <span className={`font-semibold ${getStatusColor(status.isConnected)}`}>
            {status.isConnected ? '연결됨' : '연결 안됨'}
          </span>
        </div>
        {status.error && (
          <p className="text-red-600 text-sm">{status.error}</p>
        )}
      </div>

      {/* 전체 진단 결과 */}
      {diagnostics && (
        <div className="mb-4 p-4 bg-purple-50 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-2">전체 진단 결과</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-purple-800">데이터베이스 연결</h4>
              <p className={diagnostics.database.success ? 'text-green-600' : 'text-red-600'}>
                {diagnostics.database.success ? '✅ 성공' : '❌ 실패'}
              </p>
              {diagnostics.database.error && (
                <p className="text-red-600 text-xs">{diagnostics.database.error}</p>
              )}
            </div>
            <div>
              <h4 className="font-medium text-purple-800">네트워크 연결</h4>
              <p className={diagnostics.network.success ? 'text-green-600' : 'text-red-600'}>
                {diagnostics.network.success ? '✅ 성공' : '❌ 실패'}
              </p>
              {diagnostics.network.error && (
                <p className="text-red-600 text-xs">{diagnostics.network.error}</p>
              )}
            </div>
            <div>
              <h4 className="font-medium text-purple-800">CORS 설정</h4>
              <p className={diagnostics.cors.success ? 'text-green-600' : 'text-red-600'}>
                {diagnostics.cors.success ? '✅ 성공' : '❌ 실패'}
              </p>
            </div>
          </div>
          <details className="mt-2">
            <summary className="text-xs text-purple-600 cursor-pointer">상세 정보</summary>
            <pre className="text-xs text-purple-700 mt-1 bg-white p-2 rounded border overflow-auto max-h-32">
              {JSON.stringify(diagnostics, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* 테스트 결과 */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900">진단 결과:</h3>
        {testResults.map((result, index) => (
          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <span className="text-sm font-medium">{result.test}:</span>
            <span className={`text-sm ${result.status.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
              {result.status}
            </span>
            {result.details && (
              <details className="ml-auto">
                <summary className="text-xs text-gray-500 cursor-pointer">상세</summary>
                <pre className="text-xs text-gray-600 mt-1 bg-white p-2 rounded border">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      {/* 해결 방법 안내 */}
      {!status.isConnected && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">🔧 Vercel 배포 문제 해결 방법:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Vercel 대시보드에서 환경변수 설정 확인</li>
            <li>• <code>VITE_SUPABASE_URL</code>과 <code>VITE_SUPABASE_ANON_KEY</code> 설정</li>
            <li>• Supabase 프로젝트의 CORS 설정 확인</li>
            <li>• 브라우저 개발자 도구에서 네트워크 오류 확인</li>
            <li>• Supabase 프로젝트가 활성 상태인지 확인</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DatabaseStatus; 