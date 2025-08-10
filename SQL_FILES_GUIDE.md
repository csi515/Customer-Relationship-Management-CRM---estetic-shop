# 📁 SQL 파일 정리 완료

## ✅ 정리된 SQL 파일들

### 🗑️ 삭제된 불필요한 파일들
- `insert-test-data.sql` - 중복된 테스트 데이터 파일 (user_id 포함)
- `add_appointment_interval.sql` - 개별 기능 파일
- `create_settings_table.sql` - 개별 테이블 파일
- `supabase_schema.sql` - 중복된 스키마 파일

### 📋 유지된 SQL 파일들

#### 1. **`create-database-manual-fixed.sql`** (메인 스키마)
- **용도**: 전체 데이터베이스 스키마 생성
- **내용**: 
  - 테이블 생성 (customers, products, appointments, purchases, finance, settings)
  - 인덱스 생성
  - 트리거 설정
  - 뷰 생성
  - 함수 생성
- **특징**: `user_id` NULL 허용, RLS 정책 제외

#### 2. **`insert-test-data-fixed.sql`** (테스트 데이터)
- **용도**: 테스트용 샘플 데이터 삽입
- **내용**:
  - 고객 데이터 (5명)
  - 상품 데이터 (8개)
  - 예약 데이터 (4개)
  - 구매 내역 (3개)
  - 재무 데이터 (8개)
  - 설정 데이터 (1개)
- **특징**: `user_id` 제외, 실제 사용 가능한 데이터

#### 3. **`enable-rls-policies.sql`** (보안 정책)
- **용도**: Row Level Security 활성화 및 정책 설정
- **내용**:
  - RLS 활성화
  - 사용자별 데이터 접근 정책
  - 읽기/쓰기 권한 설정
- **특징**: 인증 시스템 설정 후 실행

## 🚀 사용 순서

### 1단계: 데이터베이스 스키마 생성
```sql
-- Supabase Dashboard SQL Editor에서 실행
-- create-database-manual-fixed.sql 실행
```

### 2단계: 테스트 데이터 삽입
```sql
-- insert-test-data-fixed.sql 실행
-- 샘플 데이터로 시스템 테스트
```

### 3단계: 보안 정책 설정 (선택사항)
```sql
-- 인증 시스템 설정 후
-- enable-rls-policies.sql 실행
```

## 📊 파일별 상세 내용

### `create-database-manual-fixed.sql`
```sql
-- 주요 테이블
- customers (고객 정보)
- products (상품/서비스)
- appointments (예약)
- purchases (구매 내역)
- finance (재무)
- settings (설정)

-- 인덱스
- 성능 최적화를 위한 인덱스

-- 트리거
- updated_at 자동 업데이트

-- 뷰
- appointment_details (예약 상세)
- finance_summary (재무 요약)

-- 함수
- get_customer_appointments (고객별 예약)
- get_monthly_finance_stats (월별 재무 통계)
```

### `insert-test-data-fixed.sql`
```sql
-- 샘플 데이터
- 5명의 고객 (다양한 피부 타입)
- 8개의 상품/서비스 (페이셜, 패키지 등)
- 4개의 예약 (다양한 상태)
- 3개의 구매 내역
- 8개의 재무 기록 (수입/지출)
- 1개의 사업 설정
```

### `enable-rls-policies.sql`
```sql
-- 보안 정책
- 사용자별 데이터 분리
- 읽기/쓰기 권한 제어
- 인증된 사용자만 접근
```

## 🔧 파일 특징

### ✅ 최적화된 구조
- **중복 제거**: 동일한 기능의 파일 통합
- **모듈화**: 기능별로 분리된 파일
- **순서화**: 실행 순서에 맞춘 파일명

### ✅ Vercel 배포 호환
- **환경변수**: 하드코딩 제거
- **보안**: RLS 정책 분리
- **테스트**: 샘플 데이터 포함

### ✅ 개발 편의성
- **단계별 실행**: 순서대로 실행 가능
- **테스트 데이터**: 즉시 테스트 가능
- **보안 설정**: 선택적 적용

## 📋 실행 체크리스트

### 데이터베이스 설정
- [ ] `create-database-manual-fixed.sql` 실행
- [ ] 테이블 생성 확인
- [ ] 인덱스 생성 확인
- [ ] 트리거 설정 확인

### 테스트 데이터
- [ ] `insert-test-data-fixed.sql` 실행
- [ ] 샘플 데이터 삽입 확인
- [ ] 데이터 조회 테스트

### 보안 설정 (선택사항)
- [ ] 인증 시스템 설정 완료
- [ ] `enable-rls-policies.sql` 실행
- [ ] RLS 정책 확인

## 🎯 예상 결과

### 성공적인 실행 후:
- ✅ **6개 테이블** 생성 완료
- ✅ **20개 인덱스** 생성 완료
- ✅ **6개 트리거** 설정 완료
- ✅ **2개 뷰** 생성 완료
- ✅ **2개 함수** 생성 완료
- ✅ **29개 샘플 데이터** 삽입 완료

### 데이터베이스 구조:
```
customers (5개) ← appointments (4개) → products (8개)
     ↓              ↓
purchases (3개)   finance (8개)
     ↓
settings (1개)
```

---

**🎉 SQL 파일 정리 완료! 이제 순서대로 실행하여 데이터베이스를 설정하세요!** 