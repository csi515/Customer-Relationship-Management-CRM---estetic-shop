# 🚀 Vercel 배포 전 Supabase 연결 체크리스트

## 📋 **배포 전 필수 확인사항**

### 1. **Supabase 데이터베이스 설정**
- [ ] **데이터베이스 생성**: `create-database-manual-fixed.sql` 실행 완료
- [ ] **테스트 데이터 삽입**: `insert-test-data-fixed.sql` 실행 완료
- [ ] **RLS 정책 수정**: `fix-rls-policies.sql` 실행 완료
- [ ] **연결 테스트**: `test-supabase-connection.sql` 실행하여 모든 테이블 확인

### 2. **Supabase CORS 설정**
- [ ] Supabase 대시보드 → Settings → API → CORS 설정
- [ ] 다음 도메인 추가:
  ```
  http://localhost:3000
  http://localhost:3001
  http://localhost:5173
  https://*.vercel.app
  https://your-project-name.vercel.app
  ```

### 3. **Vercel 환경변수 설정**
- [ ] Vercel 대시보드 → Settings → Environment Variables
- [ ] 다음 변수 설정:
  ```
  VITE_SUPABASE_URL=https://wysihrzbnxhfnymtnvzj.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5c2locnpibnhoZm55bXRudnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTI3MjUsImV4cCI6MjA2NjA4ODcyNX0.u4UNIJikLf529VE3TSSTBzngOQ_H6OHKaUeEwYa41fY
  ```
- [ ] Environment: Production, Preview, Development 모두 선택
- [ ] Apply to: All 선택

### 4. **로컬 테스트**
- [ ] `npm run dev` 실행
- [ ] `http://localhost:3001` 접속
- [ ] `/debug` 페이지에서 연결 테스트
- [ ] 모든 기능 정상 작동 확인

### 5. **빌드 테스트**
- [ ] `npm run build` 실행
- [ ] 빌드 오류 없음 확인
- [ ] TypeScript 오류 없음 확인

## 🔧 **배포 후 확인사항**

### 1. **배포된 사이트 테스트**
- [ ] 배포된 URL 접속
- [ ] `/debug` 페이지 접속
- [ ] **전체 진단** 버튼 클릭
- [ ] 모든 연결 상태 확인

### 2. **브라우저 개발자 도구 확인**
- [ ] F12 클릭하여 개발자 도구 열기
- [ ] Console 탭에서 오류 메시지 확인
- [ ] Network 탭에서 Supabase 요청 상태 확인

### 3. **기능별 테스트**
- [ ] 고객 관리 기능 테스트
- [ ] 상품 관리 기능 테스트
- [ ] 예약 관리 기능 테스트
- [ ] 재무 관리 기능 테스트

## 🚨 **문제 발생 시 해결 방법**

### **문제 1: "데이터베이스에 연결할 수 없습니다"**
**해결 방법:**
1. Vercel 환경변수 재확인
2. Supabase CORS 설정 확인
3. `/debug` 페이지에서 상세 진단 실행

### **문제 2: "인증 오류"**
**해결 방법:**
1. `fix-rls-policies.sql` 실행
2. RLS 정책이 "Allow All"로 설정되었는지 확인

### **문제 3: "CORS 오류"**
**해결 방법:**
1. Supabase CORS 설정에 Vercel 도메인 추가
2. 브라우저 캐시 삭제 후 재시도

### **문제 4: "환경변수 누락"**
**해결 방법:**
1. Vercel 대시보드에서 환경변수 재설정
2. 빈 커밋으로 재배포 트리거:
   ```bash
   git commit --allow-empty -m "Trigger rebuild"
   git push origin main
   ```

## 📞 **긴급 지원**

### **Supabase 지원**
- [Supabase 문서](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)

### **Vercel 지원**
- [Vercel 문서](https://vercel.com/docs)
- [Vercel Discord](https://discord.gg/vercel)

### **프로젝트 GitHub**
- [GitHub Issues](https://github.com/csi515/yeouskin/issues)
- [GitHub Discussions](https://github.com/csi515/yeouskin/discussions)

## ✅ **성공 확인**

모든 체크리스트 항목이 완료되면:
- [ ] 배포된 사이트에서 모든 기능 정상 작동
- [ ] `/debug` 페이지에서 모든 연결 상태 ✅
- [ ] 브라우저 콘솔에 오류 없음
- [ ] 데이터 CRUD 작업 정상 수행

**🎉 배포 성공!** 