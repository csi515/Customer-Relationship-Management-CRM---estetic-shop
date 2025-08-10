-- Vercel 배포 시 Supabase 연결 문제 해결을 위한 RLS 정책 수정
-- 이 스크립트를 Supabase Dashboard의 SQL Editor에서 실행하세요

-- 1. 기존 RLS 정책 삭제
DROP POLICY IF EXISTS "Users can view own customers" ON customers;
DROP POLICY IF EXISTS "Users can insert own customers" ON customers;
DROP POLICY IF EXISTS "Users can update own customers" ON customers;
DROP POLICY IF EXISTS "Users can delete own customers" ON customers;

DROP POLICY IF EXISTS "Users can view own products" ON products;
DROP POLICY IF EXISTS "Users can insert own products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;

DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can insert own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete own appointments" ON appointments;

DROP POLICY IF EXISTS "Users can view own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can insert own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can update own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can delete own purchases" ON purchases;

DROP POLICY IF EXISTS "Users can view own finance" ON finance;
DROP POLICY IF EXISTS "Users can insert own finance" ON finance;
DROP POLICY IF EXISTS "Users can update own finance" ON finance;
DROP POLICY IF EXISTS "Users can delete own finance" ON finance;

DROP POLICY IF EXISTS "Users can view own settings" ON settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON settings;
DROP POLICY IF EXISTS "Users can update own settings" ON settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON settings;

-- 2. 새로운 RLS 정책 생성 (인증 없이도 접근 가능하도록 수정)
-- 고객 테이블 정책
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true) WITH CHECK (true);

-- 상품 테이블 정책
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true) WITH CHECK (true);

-- 예약 테이블 정책
CREATE POLICY "Allow all operations on appointments" ON appointments FOR ALL USING (true) WITH CHECK (true);

-- 구매 내역 테이블 정책
CREATE POLICY "Allow all operations on purchases" ON purchases FOR ALL USING (true) WITH CHECK (true);

-- 재무 테이블 정책
CREATE POLICY "Allow all operations on finance" ON finance FOR ALL USING (true) WITH CHECK (true);

-- 설정 테이블 정책
CREATE POLICY "Allow all operations on settings" ON settings FOR ALL USING (true) WITH CHECK (true);

-- 3. 확인
SELECT 'RLS policies updated for Vercel deployment!' as status;

-- 4. 테이블별 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname; 