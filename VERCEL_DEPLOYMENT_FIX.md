# 🚀 Vercel 배포 시 Supabase 연결 문제 해결 가이드

## 🔍 문제 진단

Vercel 배포 후 Supabase 연결이 실패하는 주요 원인들:

1. **환경변수 미설정**
2. **CORS 설정 문제**
3. **Supabase 프로젝트 설정 문제**
4. **네트워크 연결 문제**

## 🛠️ 해결 방법

### 1. Vercel 환경변수 설정

#### 1.1 Vercel 대시보드에서 환경변수 설정

1. [Vercel 대시보드](https://vercel.com/dashboard)에 로그인
2. 프로젝트 선택
3. **Settings** → **Environment Variables** 클릭
4. 다음 환경변수들을 추가:

```bash
# 필수 환경변수
VITE_SUPABASE_URL=https://wysihrzbnxhfnymtnvzj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5c2locnpibnhoZm55bXRudnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTI3MjUsImV4cCI6MjA2NjA4ODcyNX0.u4UNIJikLf529VE3TSSTBzngOQ_H6OHKaUeEwYa41fY

# 선택적 환경변수 (Next.js 호환성)
NEXT_PUBLIC_SUPABASE_URL=https://wysihrzbnxhfnymtnvzj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5c2locnpibnhoZm55bXRudnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTI3MjUsImV4cCI6MjA2NjA4ODcyNX0.u4UNIJikLf529VE3TSSTBzngOQ_H6OHKaUeEwYa41fY
```

#### 1.2 환경변수 설정 확인

- **Environment**: `Production`, `Preview`, `Development` 모두 선택
- **Apply to**: `All` 선택
- **Save** 클릭

### 2. Supabase CORS 설정

#### 2.1 Supabase 대시보드에서 CORS 설정

1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. **Settings** → **API** 클릭
4. **CORS (Cross-Origin Resource Sharing)** 섹션에서:

```bash
# Vercel 도메인 추가
https://your-project-name.vercel.app
https://*.vercel.app

# 개발 환경
http://localhost:3000
http://localhost:3001
http://localhost:5173
```

#### 2.2 CORS 설정 예시

```json
[
  "http://localhost:3000",
  "http://localhost:3001", 
  "http://localhost:5173",
  "https://your-project-name.vercel.app",
  "https://*.vercel.app"
]
```

### 3. Supabase 프로젝트 상태 확인

#### 3.1 프로젝트 활성화 상태

1. Supabase 대시보드에서 프로젝트가 **Active** 상태인지 확인
2. **Settings** → **General**에서 프로젝트 상태 확인

#### 3.2 API 키 확인

1. **Settings** → **API**에서 API 키 확인
2. **anon public** 키가 올바른지 확인
3. **service_role** 키는 클라이언트에서 사용하지 않음

### 4. 배포 후 테스트

#### 4.1 브라우저 개발자 도구 확인

1. 배포된 사이트에서 **F12** 클릭
2. **Console** 탭에서 오류 메시지 확인
3. **Network** 탭에서 Supabase 요청 상태 확인

#### 4.2 디버그 페이지 사용

배포된 사이트에서 `/debug` 페이지 접속하여:
- 데이터베이스 연결 상태 확인
- 네트워크 연결 테스트
- CORS 설정 확인

## 🔧 추가 문제 해결

### 1. 환경변수 캐시 문제

```bash
# Vercel에서 환경변수 변경 후 재배포
git commit --allow-empty -m "Trigger rebuild"
git push origin main
```

### 2. Supabase 연결 테스트

```javascript
// 브라우저 콘솔에서 테스트
const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
const supabase = createClient(
  'https://wysihrzbnxhfnymtnvzj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5c2locnpibnhoZm55bXRudnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTI3MjUsImV4cCI6MjA2NjA4ODcyNX0.u4UNIJikLf529VE3TSSTBzngOQ_H6OHKaUeEwYa41fY'
);

const { data, error } = await supabase.from('customers').select('count');
console.log('Test result:', { data, error });
```

### 3. 네트워크 연결 문제

```bash
# 터미널에서 Supabase 연결 테스트
curl -X GET "https://wysihrzbnxhfnymtnvzj.supabase.co/rest/v1/" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5c2locnpibnhoZm55bXRudnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTI3MjUsImV4cCI6MjA2NjA4ODcyNX0.u4UNIJikLf529VE3TSSTBzngOQ_H6OHKaUeEwYa41fY" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5c2locnpibnhoZm55bXRudnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTI3MjUsImV4cCI6MjA2NjA4ODcyNX0.u4UNIJikLf529VE3TSSTBzngOQ_H6OHKaUeEwYa41fY"
```

## 📋 체크리스트

- [ ] Vercel 환경변수 설정 완료
- [ ] Supabase CORS 설정 완료
- [ ] Supabase 프로젝트 활성 상태 확인
- [ ] API 키 올바르게 설정
- [ ] 배포 후 브라우저 콘솔 확인
- [ ] 디버그 페이지에서 연결 테스트
- [ ] 네트워크 요청 상태 확인

## 🆘 문제가 지속되는 경우

1. **Supabase 지원팀**에 문의
2. **Vercel 지원팀**에 문의
3. **GitHub Issues**에 상세한 오류 로그와 함께 보고

## 📞 추가 도움

- **Supabase 문서**: https://supabase.com/docs
- **Vercel 문서**: https://vercel.com/docs
- **프로젝트 GitHub**: https://github.com/csi515/yeouskin 