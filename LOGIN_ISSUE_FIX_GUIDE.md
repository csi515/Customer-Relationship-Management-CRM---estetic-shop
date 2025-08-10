# 🔐 로그인 "Failed to fetch" 문제 해결 가이드

## ❌ 문제 상황

로그인 시 "Failed to fetch" 오류가 발생하여 인증이 실패하는 문제

## 🔍 문제 분석

### 1. 환경변수 문제
- `vite.config.ts`에서 하드코딩된 환경변수 제거
- 개발 환경에서 환경변수가 로드되지 않음

### 2. Supabase 클라이언트 초기화 문제
- `supabaseClient.ts`에서 환경변수 fallback 설정 필요
- AuthContext에서 잘못된 import 사용

### 3. 네트워크 연결 문제
- DNS 해석 실패
- 방화벽/프록시 설정 문제

## ✅ 해결된 내용

### 1. Supabase 클라이언트 수정
```typescript
// src/utils/supabaseClient.ts
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://wysihrzbnxhfnymtnvzj.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### 2. AuthContext import 수정
```typescript
// src/contexts/AuthContext.tsx
import { supabase } from '../utils/supabase';
```

### 3. 개발 환경 환경변수 설정
```bash
# .env 파일 생성 (개발 환경용)
VITE_SUPABASE_URL=https://wysihrzbnxhfnymtnvzj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚀 해결 방법

### 1단계: 환경변수 파일 생성

프로젝트 루트에 `.env` 파일을 생성하세요:

```bash
# .env
VITE_SUPABASE_URL=https://wysihrzbnxhfnymtnvzj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5c2locnpibnhoZm55bXRudnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTI3MjUsImV4cCI6MjA2NjA4ODcyNX0.u4UNIJikLf529VE3TSSTBzngOQ_H6OHKaUeEwYa41fY
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0
```

### 2단계: 개발 서버 재시작

```bash
# 개발 서버 중지 후 재시작
npm run dev
```

### 3단계: 디버깅 도구 사용

`debug-login.html` 파일을 브라우저에서 열어 다음 테스트를 실행하세요:

1. **Supabase 연결 확인**
2. **환경변수 확인**
3. **로그인 테스트**
4. **네트워크 연결 테스트**

### 4단계: 브라우저 캐시 삭제

1. **F12** 개발자 도구 열기
2. **Application** 탭 → **Storage** → **Clear storage**
3. **Network** 탭 → **Disable cache** 체크
4. 페이지 새로고침

## 🔧 추가 문제 해결

### 네트워크 문제 해결

#### DNS 서버 변경
1. **Windows 설정** → **네트워크 및 인터넷**
2. **네트워크 및 공유 센터** → **어댑터 설정 변경**
3. **네트워크 어댑터 우클릭** → **속성**
4. **IPv4 속성** → **다음 DNS 서버 사용**: `8.8.8.8`

#### 방화벽 설정
1. **Windows Defender 방화벽** → **고급 설정**
2. **인바운드 규칙** → **새 규칙**
3. **프로그램** → **Chrome/Firefox** 허용

### Supabase 설정 확인

#### 프로젝트 설정
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 → **Settings** → **API**
3. **Project URL**과 **anon public** 키 확인

#### 인증 설정
1. **Authentication** → **Settings**
2. **Site URL** 설정: `http://localhost:3000`
3. **Redirect URLs** 추가: `http://localhost:3000/**`

## 📋 테스트 체크리스트

### ✅ 기본 연결 테스트
- [ ] Supabase 라이브러리 로드
- [ ] 클라이언트 초기화
- [ ] 환경변수 설정 확인

### ✅ 인증 테스트
- [ ] 회원가입 기능
- [ ] 로그인 기능
- [ ] 세션 관리

### ✅ 네트워크 테스트
- [ ] DNS 해석
- [ ] API 연결
- [ ] 응답 시간

## 🎯 예상 결과

### 성공적인 로그인 후:
- ✅ **환경변수 로드**: Supabase URL과 키 정상 로드
- ✅ **클라이언트 초기화**: Supabase 클라이언트 생성 성공
- ✅ **인증 성공**: 로그인/회원가입 정상 작동
- ✅ **세션 관리**: 사용자 세션 유지

### 로그인 성공 메시지:
```
✅ 로그인 성공!
사용자 ID: [UUID]
이메일: mychltjddlf@naver.com
세션: 생성됨
```

## 🚨 주의사항

### 1. 환경변수 보안
- `.env` 파일은 `.gitignore`에 포함됨
- 프로덕션에서는 Vercel 환경변수 사용
- 개발 환경에서만 로컬 `.env` 파일 사용

### 2. 네트워크 설정
- 회사/기관 네트워크에서 차단될 수 있음
- VPN 사용 시 네트워크 정책 확인
- 모바일 핫스팟으로 테스트 가능

### 3. 브라우저 설정
- CORS 정책 확인
- 쿠키/로컬 스토리지 허용
- JavaScript 실행 허용

## 📞 문제 지속 시

1. **디버깅 도구 실행**: `debug-login.html` 사용
2. **브라우저 콘솔 확인**: F12 → Console 탭
3. **네트워크 탭 확인**: F12 → Network 탭
4. **GitHub Issues 생성**: 상세한 오류 메시지 포함

---

**🔧 위 단계를 따라도 문제가 지속되면 디버깅 도구의 결과를 공유해주세요!** 