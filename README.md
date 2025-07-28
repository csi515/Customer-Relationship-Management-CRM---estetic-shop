# 피부관리샵 고객관리 시스템

1인 피부관리샵 체인점을 위한 고객관리 웹 애플리케이션입니다. 여러 지점에서 공통으로 사용하며, 로그인 기능을 통해 지점별 데이터를 분리해 관리할 수 있습니다.

## 기술 스택

- **프론트엔드**: React + Vite + TailwindCSS
- **백엔드**: Supabase (인증, 데이터베이스, 스토리지)
- **배포**: Vercel 또는 GitHub Pages
- **데이터 접근 제어**: Supabase Row Level Security (RLS)

## 주요 기능

### 🔐 로그인 기능
- 이메일/비밀번호 로그인
- 로그인한 사용자의 지점 ID 기준으로 데이터 분리
- Supabase Auth 사용

### 📊 주요 페이지
1. **고객 관리** - 고객 정보, 연락처, 생일, 피부타입, 메모, 포인트
2. **상품 관리** - 상품명, 가격, 유형(단일/바우처), 횟수, 상태, 설명
3. **예약 관리** - 고객과 상품 연결, 예약일시, 상태 관리
4. **구매 내역** - 고객의 상품 구매 기록, 수량, 총액
5. **재무 관리** - 수입/지출 내역, 날짜, 항목, 금액
6. **설정 페이지** - 사용자 정보, 로그아웃, 다크모드

## 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd skin-care-management
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env` 파일을 생성하고 Supabase 설정을 추가하세요:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. 개발 서버 실행
```bash
npm run dev
```

## Supabase 설정

### 1. Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에서 새 프로젝트를 생성합니다.
2. 프로젝트 설정에서 URL과 anon key를 복사하여 환경 변수에 설정합니다.

### 2. 데이터베이스 테이블 생성

다음 SQL을 Supabase SQL Editor에서 실행하세요:

```sql
-- Supabase CRM 시스템 테이블 구조 (사용자별 데이터 분리)
-- 기존 데이터 삭제 및 테이블 재생성

-- 기존 테이블 및 관련 객체 삭제 (CASCADE로 의존성 있는 객체도 함께 삭제)
DROP TABLE IF EXISTS finance CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- 기존 뷰 삭제
DROP VIEW IF EXISTS appointment_details CASCADE;
DROP VIEW IF EXISTS finance_summary CASCADE;

-- 기존 함수 삭제
DROP FUNCTION IF EXISTS get_customer_appointments(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_monthly_finance_stats(VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 1. 고객 테이블 (customers) - 사용자별 데이터 분리
CREATE TABLE customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- 2. 상품 테이블 (products) - 사용자별 데이터 분리
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    type VARCHAR(20) NOT NULL CHECK (type IN ('voucher', 'single')),
    count INTEGER CHECK (count > 0),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 예약 테이블 (appointments) - 사용자별 데이터 분리
CREATE TABLE appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    memo TEXT,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 구매 내역 테이블 (purchases) - 사용자별 데이터 분리
CREATE TABLE purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 재무 테이블 (finance) - 사용자별 데이터 분리
CREATE TABLE finance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    title VARCHAR(200) NOT NULL,
    amount INTEGER NOT NULL CHECK (amount >= 0),
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 설정 테이블 (settings) - 사용자별 데이터 분리
CREATE TABLE settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- 인덱스 생성 (사용자별 데이터 분리를 위한 인덱스 추가)
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_datetime ON appointments(datetime);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_customer_id ON purchases(customer_id);
CREATE INDEX idx_purchases_product_id ON purchases(product_id);
CREATE INDEX idx_purchases_purchase_date ON purchases(purchase_date);
CREATE INDEX idx_finance_user_id ON finance(user_id);
CREATE INDEX idx_finance_date ON finance(date);
CREATE INDEX idx_finance_type ON finance(type);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_settings_user_id ON settings(user_id);

-- RLS (Row Level Security) 활성화
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 사용자별 데이터 분리를 위한 RLS 정책
-- 고객 테이블 정책
CREATE POLICY "Users can view own customers" ON customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own customers" ON customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own customers" ON customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own customers" ON customers FOR DELETE USING (auth.uid() = user_id);

-- 상품 테이블 정책
CREATE POLICY "Users can view own products" ON products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own products" ON products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own products" ON products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own products" ON products FOR DELETE USING (auth.uid() = user_id);

-- 예약 테이블 정책
CREATE POLICY "Users can view own appointments" ON appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own appointments" ON appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own appointments" ON appointments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own appointments" ON appointments FOR DELETE USING (auth.uid() = user_id);

-- 구매 내역 테이블 정책
CREATE POLICY "Users can view own purchases" ON purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own purchases" ON purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own purchases" ON purchases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own purchases" ON purchases FOR DELETE USING (auth.uid() = user_id);

-- 재무 테이블 정책
CREATE POLICY "Users can view own finance" ON finance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own finance" ON finance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own finance" ON finance FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own finance" ON finance FOR DELETE USING (auth.uid() = user_id);

-- 설정 테이블 정책
CREATE POLICY "Users can view own settings" ON settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON settings FOR DELETE USING (auth.uid() = user_id);

-- updated_at 자동 업데이트를 위한 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_finance_updated_at BEFORE UPDATE ON finance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 뷰 생성 (사용자별 데이터 분리를 고려한 뷰)
CREATE VIEW appointment_details AS
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
JOIN customers c ON a.customer_id = c.id AND a.user_id = c.user_id
JOIN products p ON a.product_id = p.id AND a.user_id = p.user_id;

CREATE VIEW finance_summary AS
SELECT 
    user_id,
    date,
    type,
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount
FROM finance
GROUP BY user_id, date, type
ORDER BY date DESC;

-- 함수 생성 (사용자별 데이터 분리를 고려한 함수들)
CREATE OR REPLACE FUNCTION get_customer_appointments(customer_uuid UUID, current_user_id UUID)
RETURNS TABLE (
    appointment_id UUID,
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
        p.name,
        p.price
    FROM appointments a
    JOIN products p ON a.product_id = p.id AND a.user_id = p.user_id
    WHERE a.customer_id = customer_uuid AND a.user_id = current_user_id
    ORDER BY a.datetime DESC;
END;
$$ LANGUAGE plpgsql;

-- 월별 재무 통계 함수 (사용자별)
CREATE OR REPLACE FUNCTION get_monthly_finance_stats(month_year VARCHAR, current_user_id UUID)
RETURNS TABLE (
    date DATE,
    income_total BIGINT,
    expense_total BIGINT,
    net_amount BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.date,
        COALESCE(SUM(CASE WHEN f.type = 'income' THEN f.amount ELSE 0 END), 0) as income_total,
        COALESCE(SUM(CASE WHEN f.type = 'expense' THEN f.amount ELSE 0 END), 0) as expense_total,
        COALESCE(SUM(CASE WHEN f.type = 'income' THEN f.amount ELSE -f.amount END), 0) as net_amount
    FROM finance f
    WHERE f.user_id = current_user_id 
    AND TO_CHAR(f.date, 'YYYY-MM') = month_year
    GROUP BY f.date
    ORDER BY f.date;
END;
$$ LANGUAGE plpgsql;
```

### 3. 인증 설정
1. Supabase Dashboard에서 Authentication > Settings로 이동
2. 이메일 인증을 활성화
3. 필요에 따라 소셜 로그인 설정

## 배포

### Vercel 배포
1. [Vercel](https://vercel.com)에 GitHub 계정으로 로그인
2. 프로젝트를 import
3. 환경 변수 설정
4. 배포

### GitHub Pages 배포
```bash
npm run build
# dist 폴더를 GitHub Pages에 배포
```

## 프로젝트 구조

```
src/
├── components/          # 공통 컴포넌트
│   ├── Layout.jsx      # 레이아웃 컴포넌트
│   └── LoadingSpinner.jsx
├── contexts/           # React Context
│   └── AuthContext.jsx # 인증 상태 관리
├── lib/               # 유틸리티 및 설정
│   └── supabase.js    # Supabase 클라이언트
├── pages/             # 페이지 컴포넌트
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Customers.jsx
│   ├── Products.jsx
│   ├── Reservations.jsx
│   ├── Purchases.jsx
│   ├── Transactions.jsx
│   └── Settings.jsx
└── App.jsx            # 메인 앱 컴포넌트
```

## 데이터 분리 정책

- 모든 데이터 테이블은 `user_id`를 포함
- 로그인한 사용자의 UID만 접근 가능하도록 RLS 설정
- 지점별 데이터 분리는 사용자별로 자동 처리

## 주요 테이블 구조

### customers (고객)
- `id`: 고유 식별자
- `user_id`: 사용자 ID (RLS용)
- `name`: 고객명
- `phone`: 전화번호
- `birth_date`: 생일
- `skin_type`: 피부타입 (dry, oily, combination, sensitive, normal)
- `memo`: 메모
- `point`: 포인트
- `purchased_products`: 구매한 상품 목록

### products (상품)
- `id`: 고유 식별자
- `user_id`: 사용자 ID (RLS용)
- `name`: 상품명
- `price`: 가격
- `type`: 유형 (voucher, single)
- `count`: 횟수 (바우처용)
- `status`: 상태 (active, inactive)
- `description`: 설명

### appointments (예약)
- `id`: 고유 식별자
- `user_id`: 사용자 ID (RLS용)
- `customer_id`: 고객 ID
- `product_id`: 상품 ID
- `datetime`: 예약일시
- `memo`: 메모
- `status`: 상태 (scheduled, completed, cancelled, no-show)

### purchases (구매 내역)
- `id`: 고유 식별자
- `user_id`: 사용자 ID (RLS용)
- `customer_id`: 고객 ID
- `product_id`: 상품 ID
- `quantity`: 수량
- `purchase_date`: 구매일

### finance (재무)
- `id`: 고유 식별자
- `user_id`: 사용자 ID (RLS용)
- `date`: 날짜
- `type`: 유형 (income, expense)
- `title`: 항목
- `amount`: 금액
- `memo`: 메모

## 라이선스

MIT License

## 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request