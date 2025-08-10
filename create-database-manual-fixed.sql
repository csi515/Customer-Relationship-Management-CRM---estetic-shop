-- Supabase CRM 시스템 데이터베이스 생성 스크립트 (수정된 버전)
-- 이 스크립트를 Supabase Dashboard의 SQL Editor에서 실행하세요

-- 1. 현재 시간 조회 테스트
SELECT current_timestamp as test_time;

-- 2. 테이블 목록 조회
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 3. 기존 테이블 삭제 (필요시)
-- DROP TABLE IF EXISTS finance CASCADE;
-- DROP TABLE IF EXISTS appointments CASCADE;
-- DROP TABLE IF EXISTS purchases CASCADE;
-- DROP TABLE IF EXISTS customers CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS settings CASCADE;

-- 4. 고객 테이블 생성
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- NULL 허용으로 변경
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    birth_date DATE,
    skin_type VARCHAR(20) CHECK (skin_type IN ('dry', 'oily', 'combination', 'sensitive', 'normal')),
    memo TEXT,
    point INTEGER DEFAULT 0,
    purchased_products TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 상품 테이블 생성
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- NULL 허용으로 변경
    name VARCHAR(200) NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    type VARCHAR(20) NOT NULL CHECK (type IN ('voucher', 'single')),
    count INTEGER CHECK (count > 0),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 예약 테이블 생성
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- NULL 허용으로 변경
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    memo TEXT,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 구매 내역 테이블 생성
CREATE TABLE IF NOT EXISTS purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- NULL 허용으로 변경
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 재무 테이블 생성
CREATE TABLE IF NOT EXISTS finance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- NULL 허용으로 변경
    date DATE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    title VARCHAR(200) NOT NULL,
    amount INTEGER NOT NULL CHECK (amount >= 0),
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 설정 테이블 생성
CREATE TABLE IF NOT EXISTS settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- NULL 허용으로 변경
    business_name VARCHAR(200),
    business_phone VARCHAR(20),
    business_address TEXT,
    business_hours TEXT,
    default_appointment_duration INTEGER DEFAULT 60 CHECK (default_appointment_duration > 0),
    auto_backup BOOLEAN DEFAULT true,
    backup_interval INTEGER DEFAULT 7 CHECK (backup_interval > 0),
    language VARCHAR(10) DEFAULT 'ko' CHECK (language IN ('ko', 'en')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON appointments(datetime);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_customer_id ON purchases(customer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_product_id ON purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_purchase_date ON purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_finance_user_id ON finance(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_date ON finance(date);
CREATE INDEX IF NOT EXISTS idx_finance_type ON finance(type);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings(user_id);

-- 11. RLS (Row Level Security) 활성화 (선택사항)
-- 인증 시스템이 설정된 후에 활성화하세요
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE finance ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 12. RLS 정책 생성 (인증 시스템 설정 후 사용)
-- 고객 테이블 정책
-- CREATE POLICY IF NOT EXISTS "Users can view own customers" ON customers FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY IF NOT EXISTS "Users can insert own customers" ON customers FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY IF NOT EXISTS "Users can update own customers" ON customers FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY IF NOT EXISTS "Users can delete own customers" ON customers FOR DELETE USING (auth.uid() = user_id);

-- 상품 테이블 정책
-- CREATE POLICY IF NOT EXISTS "Users can view own products" ON products FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY IF NOT EXISTS "Users can insert own products" ON products FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY IF NOT EXISTS "Users can update own products" ON products FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY IF NOT EXISTS "Users can delete own products" ON products FOR DELETE USING (auth.uid() = user_id);

-- 예약 테이블 정책
-- CREATE POLICY IF NOT EXISTS "Users can view own appointments" ON appointments FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY IF NOT EXISTS "Users can insert own appointments" ON appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY IF NOT EXISTS "Users can update own appointments" ON appointments FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY IF NOT EXISTS "Users can delete own appointments" ON appointments FOR DELETE USING (auth.uid() = user_id);

-- 구매 내역 테이블 정책
-- CREATE POLICY IF NOT EXISTS "Users can view own purchases" ON purchases FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY IF NOT EXISTS "Users can insert own purchases" ON purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY IF NOT EXISTS "Users can update own purchases" ON purchases FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY IF NOT EXISTS "Users can delete own purchases" ON purchases FOR DELETE USING (auth.uid() = user_id);

-- 재무 테이블 정책
-- CREATE POLICY IF NOT EXISTS "Users can view own finance" ON finance FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY IF NOT EXISTS "Users can insert own finance" ON finance FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY IF NOT EXISTS "Users can update own finance" ON finance FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY IF NOT EXISTS "Users can delete own finance" ON finance FOR DELETE USING (auth.uid() = user_id);

-- 설정 테이블 정책
-- CREATE POLICY IF NOT EXISTS "Users can view own settings" ON settings FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY IF NOT EXISTS "Users can insert own settings" ON settings FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY IF NOT EXISTS "Users can update own settings" ON settings FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY IF NOT EXISTS "Users can delete own settings" ON settings FOR DELETE USING (auth.uid() = user_id);

-- 13. updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 14. 트리거 생성
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_finance_updated_at BEFORE UPDATE ON finance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. 뷰 생성
CREATE OR REPLACE VIEW appointment_details AS
SELECT 
    a.id,
    a.user_id,
    a.datetime,
    a.status,
    a.memo as appointment_memo,
    c.name as customer_name,
    c.phone as customer_phone,
    p.name as product_name,
    p.price as product_price,
    p.type as product_type
FROM appointments a
JOIN customers c ON a.customer_id = c.id
JOIN products p ON a.product_id = p.id;

CREATE OR REPLACE VIEW finance_summary AS
SELECT 
    user_id,
    date,
    type,
    SUM(amount) as total_amount,
    COUNT(*) as transaction_count
FROM finance
GROUP BY user_id, date, type
ORDER BY date DESC;

-- 16. 유틸리티 함수 생성
CREATE OR REPLACE FUNCTION get_customer_appointments(customer_uuid UUID, current_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    datetime TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20),
    product_name VARCHAR(200),
    product_price INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.datetime,
        a.status,
        p.name as product_name,
        p.price as product_price
    FROM appointments a
    JOIN products p ON a.product_id = p.id
    WHERE a.customer_id = customer_uuid 
    AND (current_user_id IS NULL OR a.user_id = current_user_id)
    ORDER BY a.datetime DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_monthly_finance_stats(month_year VARCHAR, current_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    total_income INTEGER,
    total_expense INTEGER,
    net_amount INTEGER,
    transaction_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as net_amount,
        COUNT(*) as transaction_count
    FROM finance
    WHERE (current_user_id IS NULL OR user_id = current_user_id)
    AND TO_CHAR(date, 'YYYY-MM') = month_year;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. 테스트 데이터 삽입 (선택사항)
-- INSERT INTO customers (name, phone, skin_type, memo) VALUES 
-- ('김미영', '010-1234-5678', 'combination', '첫 번째 고객'),
-- ('이수진', '010-2345-6789', 'dry', '건성 피부 고객');

-- INSERT INTO products (name, price, type, count, description) VALUES 
-- ('기본 페이셜', 50000, 'single', NULL, '기본적인 얼굴 관리'),
-- ('프리미엄 패키지', 200000, 'voucher', 5, '5회 이용 가능한 프리미엄 패키지');

-- 18. 최종 확인
SELECT 'Database setup completed successfully!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name; 