-- Supabase 연결 상태 테스트 스크립트
-- 이 스크립트를 Supabase Dashboard의 SQL Editor에서 실행하세요

-- 1. 기본 연결 테스트
SELECT 'Connection test successful!' as status, current_timestamp as test_time;

-- 2. 테이블 존재 확인
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('customers', 'products', 'appointments', 'purchases', 'finance', 'settings') 
    THEN '✅ Found' 
    ELSE '❌ Missing' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('customers', 'products', 'appointments', 'purchases', 'finance', 'settings')
ORDER BY table_name;

-- 3. RLS 상태 확인
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ Enabled' 
    ELSE '❌ Disabled' 
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('customers', 'products', 'appointments', 'purchases', 'finance', 'settings')
ORDER BY tablename;

-- 4. RLS 정책 확인
SELECT 
  tablename,
  policyname,
  permissive,
  cmd,
  CASE 
    WHEN qual = 'true' THEN '✅ Allow All'
    ELSE '🔒 Restricted'
  END as policy_type
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('customers', 'products', 'appointments', 'purchases', 'finance', 'settings')
ORDER BY tablename, policyname;

-- 5. 데이터 개수 확인
SELECT 'customers' as table_name, COUNT(*) as record_count FROM customers
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'purchases', COUNT(*) FROM purchases
UNION ALL
SELECT 'finance', COUNT(*) FROM finance
UNION ALL
SELECT 'settings', COUNT(*) FROM settings
ORDER BY table_name;

-- 6. 샘플 데이터 확인
SELECT 'Sample customers:' as info;
SELECT id, name, phone, skin_type, point, created_at 
FROM customers 
ORDER BY created_at DESC 
LIMIT 3;

SELECT 'Sample products:' as info;
SELECT id, name, price, type, status, created_at 
FROM products 
ORDER BY created_at DESC 
LIMIT 3;

SELECT 'Sample appointments:' as info;
SELECT id, customer_id, product_id, datetime, status, created_at 
FROM appointments 
ORDER BY datetime DESC 
LIMIT 3;

-- 7. 인덱스 확인
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('customers', 'products', 'appointments', 'purchases', 'finance', 'settings')
ORDER BY tablename, indexname;

-- 8. 뷰 확인
SELECT 
  viewname,
  definition
FROM pg_views 
WHERE schemaname = 'public' 
  AND viewname IN ('appointment_details', 'finance_summary')
ORDER BY viewname;

-- 9. 함수 확인
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND proname IN ('get_customer_appointments', 'get_monthly_finance_stats', 'update_updated_at_column')
ORDER BY proname; 