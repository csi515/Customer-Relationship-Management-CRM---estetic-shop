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
1. **고객 관리** - 고객 정보, 연락처, 생일, 피부타입, 메모, 방문횟수
2. **시술 내역** - 고객 연결, 날짜, 시술명, 사용 제품, 비용, 메모
3. **예약 관리** - 달력 기반 예약 일정 등록/수정/삭제
4. **수입/지출 관리** - 날짜, 항목, 금액, 분류(수입/지출)
5. **직원 관리** - 이름, 역할, 근무일수, 시급, 급여 계산
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
-- 고객 테이블
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  birthday DATE,
  skin_type TEXT,
  memo TEXT,
  visit_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 시술 내역 테이블
CREATE TABLE treatments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  treatment_date DATE NOT NULL,
  treatment_name TEXT NOT NULL,
  products_used TEXT,
  cost INTEGER,
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 예약 테이블
CREATE TABLE reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  treatment_name TEXT NOT NULL,
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 수입/지출 테이블
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount INTEGER NOT NULL,
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 직원 테이블
CREATE TABLE employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  hourly_wage INTEGER NOT NULL,
  work_days INTEGER DEFAULT 0,
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Row Level Security (RLS) 설정

```sql
-- RLS 활성화
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- 사용자별 데이터 접근 정책
CREATE POLICY "Users can view own customers" ON customers
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own treatments" ON treatments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reservations" ON reservations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own employees" ON employees
  FOR ALL USING (auth.uid() = user_id);
```

### 4. 인증 설정
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
│   ├── Treatments.jsx
│   ├── Reservations.jsx
│   ├── Transactions.jsx
│   ├── Employees.jsx
│   └── Settings.jsx
└── App.jsx            # 메인 앱 컴포넌트
```

## 데이터 분리 정책

- 모든 데이터 테이블은 `user_id`를 포함
- 로그인한 사용자의 UID만 접근 가능하도록 RLS 설정
- 지점별 데이터 분리는 사용자별로 자동 처리

## 라이선스

MIT License

## 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request