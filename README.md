# 🌸 CRM 시스템 - 에스테틱 샵

> 에스테틱 샵을 위한 현대적이고 사용자 친화적인 고객 관리 시스템

> 이제 Vercel 배포에 최적화되었습니다. Vercel 프로젝트 환경변수에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`를 설정하고, 기본 빌드/출력(`npm run build`, `dist/`)으로 작동합니다. SPA 라우팅은 `vercel.json`의 rewrites로 처리됩니다.

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/csi515/yeouskin)
[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://yeouskin-crm.vercel.app/)

## 🚀 라이브 데모

**👉 [CRM 시스템 체험하기](https://yeouskin-crm.vercel.app/)**

## 📋 프로젝트 소개

에스테틱 샵 운영에 필요한 모든 기능을 통합한 웹 기반 CRM(고객 관계 관리) 시스템입니다. 
고객 정보 관리, 예약 스케줄링, 상품 관리, 재무 관리를 하나의 플랫폼에서 효율적으로 처리할 수 있습니다.

## ✨ 주요 기능

### 👥 고객 관리
- **고객 정보 등록/수정/삭제**
- **상세 고객 프로필** (연락처, 생년월일, 피부타입, 메모)
- **포인트 시스템** 관리
- **고객 검색** 및 필터링

### 📅 예약 관리
- **실시간 예약 스케줄링**
- **캘린더 뷰** 지원
- **예약 상태 관리** (예약됨, 완료, 취소, 노쇼)
- **고객별 예약 이력** 조회

### 🛍️ 상품 관리
- **서비스/상품 등록/관리**
- **가격 정책** 설정
- **바우처/일회성** 상품 구분
- **상품 활성화/비활성화** 관리

### 💰 재무 관리
- **수입/지출 기록**
- **월별 재무 현황**
- **카테고리별 분석**
- **수익성 리포트**

### 🎨 사용자 경험
- **반응형 디자인** - 데스크톱/태블릿/모바일 지원
- **다크/라이트 테마**
- **직관적인 UI/UX**
- **실시간 데이터 동기화**

## 🛠️ 기술 스택

### Frontend
- **React 18** - 사용자 인터페이스
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **React Router v6** - 라우팅

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL 데이터베이스
  - 실시간 구독
  - 인증 및 권한 관리
  - RESTful API

### 배포 & CI/CD
- **Vercel** - 정적 사이트 호스팅 및 자동 배포
- **GitHub Actions** - CI/CD 파이프라인
- **GitHub Pages** - 대안 배포 플랫폼

### 개발 도구
- **ESLint** - 코드 품질
- **Prettier** - 코드 포맷팅
- **PostCSS** - CSS 후처리

## 🚦 시작하기

### 사전 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn

### 환경변수 설정

프로젝트를 실행하기 전에 Supabase 연결을 위한 환경변수를 설정해야 합니다.

1. **`.env` 파일 생성**
프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Development Configuration
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0
```

2. **Supabase 프로젝트 설정에서 값 가져오기**
   - [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
   - 프로젝트 선택 또는 새 프로젝트 생성
   - Settings > API에서 다음 정보를 복사:
     - `Project URL` → `VITE_SUPABASE_URL`
     - `anon public` → `VITE_SUPABASE_ANON_KEY`

### 설치 및 실행

1. **저장소 복제**
```bash
git clone https://github.com/csi515/yeouskin.git
cd yeouskin
```

2. **의존성 설치**
```bash
npm install
```

3. **환경변수 설정**
위의 "환경변수 설정" 섹션을 참고하여 `.env` 파일을 생성하세요.

4. **개발 서버 시작**
```bash
npm run dev
```

5. **브라우저에서 확인**
```
http://localhost:3000
```

### 빌드

**프로덕션 빌드:**
```bash
npm run build
```

## 🌐 배포

### Vercel 자동 배포 (권장)

이 프로젝트는 **Vercel**을 통해 자동으로 배포됩니다:

1. **Vercel에 프로젝트 연결**
   - [Vercel Dashboard](https://vercel.com/dashboard)에서 새 프로젝트 생성
   - GitHub 저장소 연결
   - 환경변수 설정:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

2. **자동 배포**
   - `main` 브랜치에 코드 push
   - Vercel이 자동으로 빌드 및 배포
   - **https://your-project.vercel.app/** 에서 확인

### 수동 배포

```bash
# 프로덕션 빌드
npm run build

# Vercel CLI를 통한 배포
npm i -g vercel
vercel
```

## 🔧 설정

### Vercel 환경변수 설정

Vercel 대시보드에서 다음 환경변수를 설정하세요:

1. **Project Settings** → **Environment Variables**
2. 다음 변수 추가:
   - `VITE_SUPABASE_URL`: `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your_supabase_anon_key`

### Supabase 연결

이 프로젝트는 Supabase를 백엔드로 사용합니다. 환경변수를 통해 연결 정보를 설정합니다.

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── CustomerForm.tsx
│   ├── AppointmentForm.tsx
│   ├── ProductForm.tsx
│   └── ...
├── pages/              # 페이지 컴포넌트
│   ├── Dashboard.tsx
│   ├── CustomerManagement.tsx
│   └── ...
├── contexts/           # React Context
│   ├── AuthContext.tsx
│   └── SettingsContext.tsx
├── utils/              # 유틸리티 함수
│   ├── supabaseClient.ts
│   └── ...
├── types/              # TypeScript 타입 정의
└── ...
```

## 🐛 해결된 주요 이슈

### Vercel 배포 최적화
- ✅ **ES 모듈 형식** 적용 (Vercel 권장)
- ✅ **환경변수** Vercel 설정으로 분리
- ✅ **SPA 라우팅** vercel.json rewrites로 처리
- ✅ **빌드 최적화** ES2020 타겟으로 성능 향상

### 성능 최적화
- ✅ **번들 크기** 최적화
- ✅ **코드 스플리팅** 적용
- ✅ **프로덕션 최적화** (console.log 제거 등)

## 🤝 기여하기

1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

---

**Made with ❤️ for Esthetic Shops** 
