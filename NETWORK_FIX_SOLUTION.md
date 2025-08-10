# 🌐 네트워크 "Failed to fetch" 문제 해결 방법

## ❌ 현재 문제 상황

```
❌ DNS 해석 실패: Non-existent domain
❌ 네트워크 연결 실패: Failed to fetch
❌ Supabase API 호출 불가
```

## 🔍 문제 분석

### 1. DNS 해석 문제
- 로컬 DNS 서버에서 Supabase 프로젝트 도메인 해석 실패
- ISP DNS 서버 문제 또는 도메인 차단

### 2. 네트워크 환경 문제
- 회사/기관 네트워크에서 외부 API 차단
- 방화벽/프록시 설정 문제

### 3. Supabase 프로젝트 문제
- 프로젝트 참조가 잘못되었을 가능성
- 프로젝트가 삭제되었거나 비활성화된 가능성

## 🚀 해결 방법

### 방법 1: DNS 서버 변경 (가장 효과적)

#### Windows DNS 설정 변경:
1. **Windows 설정** 열기
2. **네트워크 및 인터넷** → **네트워크 및 공유 센터**
3. **어댑터 설정 변경**
4. **네트워크 어댑터 우클릭** → **속성**
5. **IPv4 속성** → **다음 DNS 서버 사용**
6. **8.8.8.8** (Google DNS) 입력
7. **확인** 후 네트워크 재시작

#### 명령어로 DNS 변경:
```bash
# 관리자 권한으로 실행
netsh interface ip set dns "Wi-Fi" static 8.8.8.8
netsh interface ip add dns "Wi-Fi" 8.8.8.8 index=2
```

### 방법 2: hosts 파일 수정

#### 관리자 권한으로 hosts 파일 편집:
1. **C:\Windows\System32\drivers\etc\hosts** 파일 열기
2. 다음 줄 추가:
```
76.76.21.21 wysihrzbnxhfnymtnvzj.supabase.co
```

### 방법 3: VPN 사용

#### 무료 VPN 서비스 사용:
- **ProtonVPN** (무료)
- **Windscribe** (무료)
- **TunnelBear** (무료)

### 방법 4: 모바일 핫스팟 사용

#### 휴대폰 데이터로 테스트:
1. 휴대폰에서 핫스팟 활성화
2. 컴퓨터를 핫스팟에 연결
3. 다른 ISP 네트워크로 테스트

### 방법 5: 다른 브라우저 사용

#### 브라우저별 테스트:
- **Chrome**
- **Firefox**
- **Edge**
- **Safari**

## 🔧 즉시 테스트 방법

### 1. DNS 변경 후 테스트
```bash
# DNS 변경 후
ipconfig /flushdns
ipconfig /release
ipconfig /renew

# 테스트
nslookup wysihrzbnxhfnymtnvzj.supabase.co
ping wysihrzbnxhfnymtnvzj.supabase.co
```

### 2. 브라우저 캐시 삭제
1. **F12** 개발자 도구 열기
2. **Application** 탭 → **Storage** → **Clear storage**
3. **Network** 탭 → **Disable cache** 체크
4. 페이지 새로고침

### 3. 프록시 설정 확인
1. **Windows 설정** → **네트워크 및 인터넷** → **프록시**
2. **자동 감지** 또는 **수동 설정** 확인
3. 필요시 프록시 비활성화

## 📋 우선순위별 해결 순서

### 1순위: DNS 서버 변경
- 가장 효과적인 방법
- 8.8.8.8 (Google DNS) 사용

### 2순위: 모바일 핫스팟
- 다른 ISP 네트워크 사용
- 네트워크 정책 우회

### 3순위: VPN 사용
- 네트워크 제한 우회
- 무료 VPN 서비스 활용

### 4순위: 브라우저 변경
- 브라우저별 네트워크 설정 차이
- 다른 브라우저로 테스트

## 🎯 예상 결과

### DNS 변경 후:
```
✅ nslookup wysihrzbnxhfnymtnvzj.supabase.co
서버:  dns.google
Address:  8.8.8.8

권한 없는 응답:
이름:    wysihrzbnxhfnymtnvzj.supabase.co
Address:  76.76.21.21
```

### 네트워크 연결 후:
```
✅ ping wysihrzbnxhfnymtnvzj.supabase.co
✅ 브라우저에서 Supabase API 호출 성공
✅ 로그인/회원가입 정상 작동
```

## 🚨 주의사항

### 1. 회사/기관 네트워크
- IT 부서에 문의하여 Supabase 도메인 허용 요청
- 프록시 서버 설정 확인
- 네트워크 정책 확인

### 2. 보안 설정
- 방화벽에서 브라우저 허용
- Windows Defender 설정 확인
- 안티바이러스 프로그램 설정 확인

### 3. ISP 문제
- ISP에 문의하여 DNS 서버 문제 확인
- 다른 ISP 사용 고려

## 📞 추가 지원

### 문제 지속 시:
1. **네트워크 관리자에게 문의**
2. **ISP 고객센터에 문의**
3. **다른 네트워크 환경에서 테스트**
4. **Supabase 지원팀에 문의**

---

**🔧 DNS 서버를 8.8.8.8로 변경한 후 다시 테스트해보세요!** 