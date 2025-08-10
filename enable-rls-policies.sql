-- Supabase RLS (Row Level Security) 정책 활성화 스크립트
-- 이 스크립트는 인증 시스템이 설정된 후에 실행하세요

-- 1. RLS 활성화
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 2. 고객 테이블 정책
CREATE POLICY IF NOT EXISTS "Users can view own customers" ON customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own customers" ON customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own customers" ON customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete own customers" ON customers FOR DELETE USING (auth.uid() = user_id);

-- 3. 상품 테이블 정책
CREATE POLICY IF NOT EXISTS "Users can view own products" ON products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own products" ON products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own products" ON products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete own products" ON products FOR DELETE USING (auth.uid() = user_id);

-- 4. 예약 테이블 정책
CREATE POLICY IF NOT EXISTS "Users can view own appointments" ON appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own appointments" ON appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own appointments" ON appointments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete own appointments" ON appointments FOR DELETE USING (auth.uid() = user_id);

-- 5. 구매 내역 테이블 정책
CREATE POLICY IF NOT EXISTS "Users can view own purchases" ON purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own purchases" ON purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own purchases" ON purchases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete own purchases" ON purchases FOR DELETE USING (auth.uid() = user_id);

-- 6. 재무 테이블 정책
CREATE POLICY IF NOT EXISTS "Users can view own finance" ON finance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own finance" ON finance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own finance" ON finance FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete own finance" ON finance FOR DELETE USING (auth.uid() = user_id);

-- 7. 설정 테이블 정책
CREATE POLICY IF NOT EXISTS "Users can view own settings" ON settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own settings" ON settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own settings" ON settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete own settings" ON settings FOR DELETE USING (auth.uid() = user_id);

-- 8. 확인
SELECT 'RLS policies enabled successfully!' as status; 