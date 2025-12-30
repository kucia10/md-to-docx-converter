# LanguageToggle Component

## 요약
- 책임: 애플리케이션 언어 변경 UI 제공 (드롭다운)
- 주요 사용자/호출자: [`App.tsx`](../../../src/renderer/App.tsx:1)
- 핵심 엔트리포인트: [`LanguageToggle`](../../../src/renderer/components/LanguageToggle.tsx:21) 컴포넌트

## 아키텍처 내 위치
- 레이어: Renderer Layer (UI Component)
- 상위/하위 의존:
  - 상위: [`App.tsx`](../../../src/renderer/App.tsx:1)
  - 하위: [`i18n.ts`](../../../src/renderer/i18n.ts:1) (`SUPPORTED_LANGUAGES`), `react-i18next`
- 런타임 플로우에서의 역할: 사용자 언어 선택 및 i18n 언어 변경

## 퍼블릭 인터페이스

### LanguageToggle
- 시그니처: `() => JSX.Element`
- 설명: 언어 변경 드롭다운 버튼 컴포넌트

## 내부 동작

### 주요 플로우
1. **드롭다운 토글**: 버튼 클릭으로 `isOpen` 상태 변경
2. **언어 변경**: `changeLanguage()`로 `i18n.changeLanguage()` 호출 및 `localStorage` 저장 (라인 38-42)
3. **외부 클릭 감지**: `useEffect`로 드롭다운 외부 클릭 시 닫기 (라인 27-36)
4. **현재 언어 표시**: `getCurrentLabel()`로 현재 언어 라벨 표시

### 핵심 규칙/알고리즘
- **지원 언어**:
  - 한국어 (ko), English (en), 日本語 (ja)
  - 简体中文 (zh-CN), 繁體中文 (zh-TW)
  - Español (es), Français (fr), Deutsch (de)
  - Italiano (it), Português (pt-BR), Русский (ru)
  - العربية (ar)
- **LocalStorage 키**: `'language'` (라인 40)
- **아랍어 RTL**: `dir={lang === 'ar' ? 'rtl' : 'ltr'}`로 오른쪽에서 왼쪽 쓰기 방향 지원 (라인 70)
- **현재 언어 강조**: `i18n.language === lang` 체크로 하이라이트 (라인 66-67)

### 엣지케이스
- **알 수 없는 언어**: `LANGUAGE_LABELS[i18n.language] || i18n.language`로 폴백 (라인 45)
- **드롭다운 열림 상태**: 외부 클릭 시 자동 닫기

## 데이터/모델
- 모델/DTO: 없음
- 스키마/테이블: 없음
- 직렬화 포맷: 없음 (LocalStorage에 문자열로 저장)

## 설정/환경변수
- **LocalStorage 키**: `'language'`
- **지원 언어**: [`SUPPORTED_LANGUAGES`](../../../src/renderer/i18n.ts:1) 상수

## 의존성
- 내부 모듈: [`src/renderer/i18n.ts`](../../../src/renderer/i18n.ts:1) (`SUPPORTED_LANGUAGES`)
- 외부 라이브러리/서비스: 
  - React
  - `react-i18next`
  - `lucide-react` (아이콘)

## 테스트
- 관련 테스트: 불명 (추가 확인 필요)
- 커버리지/갑: 드롭다운 열기/닫기, 언어 변경 테스트 부재

## 운영/관찰가능성
- 로그: 없음
- 메트릭/트레이싱: 없음
- 알람 포인트: 없음

## 관련 문서
- [i18n Configuration](../i18n.md)