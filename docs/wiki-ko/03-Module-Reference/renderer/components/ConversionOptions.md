# ConversionOptions Component

## 요약
- 책임: 문서 변환 옵션 설정 UI 제공 (폰트, 마진, 참고문헌 스타일 등)
- 주요 사용자/호출자: [`App.tsx`](../../src/renderer/App.tsx:1)
- 핵심 엔트리포인트: [`ConversionOptions`](../../src/renderer/components/ConversionOptions.tsx:11) 컴포넌트

## 아키텍처 내 위치
- 레이어: Renderer Layer (UI Component)
- 상위/하위 의존:
  - 상위: [`App.tsx`](../../src/renderer/App.tsx:1)
  - 하위: [`types/index.ts`](../../src/renderer/types/index.ts:1) (`ConversionOptions` 타입)
- 런타임 플로우에서의 역할: 사용자에게 변환 옵션을 제공하고 상위 컴포넌트에 전달

## 퍼블릭 인터페이스

### ConversionOptionsProps
```typescript
interface ConversionOptionsProps {
  options: ConversionOptionsType
  onOptionsChange: (options: ConversionOptionsType) => void
}
```

#### options
- 시그니처: `ConversionOptionsType`
- 설명: 현재 변환 옵션 값
- ConversionOptionsType 구조:
```typescript
interface ConversionOptionsType {
  fontFamily?: string
  fontSize?: number
  lineHeight?: number
  marginTop?: number
  marginBottom?: number
  marginLeft?: number
  marginRight?: number
  orientation?: 'portrait' | 'landscape'
  generateToc?: boolean
  referenceStyle?: 'apa' | 'mla' | 'chicago' | 'harvard'
  imageHandling?: 'embed' | 'link'
  codeBlockStyle?: 'fenced' | 'indented'
}
```

#### onOptionsChange
- 시그니처: `(options: ConversionOptionsType) => void`
- 설명: 옵션 변경 시 호출되는 콜백

## 내부 동작

### 주요 플로우
1. **초기화**: `useEffect`로 기본값 설정 (라인 33-53)
2. **옵션 업데이트**: `updateOption()` 함수로 개별 옵션 업데이트
3. **상위 컴포넌트 전달**: `onOptionsChange()`로 변경된 옵션 전달
4. **UI 갱신**: 변경된 옵션에 따라 UI 다시 렌더링

### 핵심 규칙/알고리즘
- **기본값 설정**:
  - `fontFamily`: 'Georgia'
  - `fontSize`: 14pt
  - `lineHeight`: 1.5
  - `marginTop`/`marginBottom`: 2.54cm
  - `marginLeft`/`marginRight`: 3.18cm
  - `orientation`: 'portrait'
  - `generateToc`: `true`
  - `referenceStyle`: 'chicago'
- **마진 단위**: UI는 센티미터(cm)로 표시, Python에서 인치(inch)로 변환
- **제약사항**:
  - `fontSize`: 8pt ~ 72pt
  - `lineHeight`: 0.5 ~ 3.0
  - 마진: 0 ~ 10cm

### 엣지케이스
- **부분 옵션만 전달**: 기본값이 없는 옵션은 `useEffect`에서 초기화
- **undefined 값 처리**: `||` 연산자로 기본값 설정

## 데이터/모델
- 모델/DTO: `ConversionOptionsType` ([`types/index.ts`](../../src/renderer/types/index.ts:1))
- 스키마/테이블: 없음
- 직렬화 포맷: 없음 (메모리 상태만 관리)

## 설정/환경변수
- **기본 옵션값**: 하드코딩된 기본값 사용 (라인 41-50)
- **참고문헌 스타일**: APA, MLA, Chicago, Harvard 지원

## 의존성
- 내부 모듈: [`src/renderer/types/index.ts`](../../src/renderer/types/index.ts:1) (`ConversionOptionsType` 타입)
- 외부 라이브러리/서비스: 
  - React
  - `react-i18next`
  - `lucide-react` (아이콘)

## 테스트
- 관련 테스트: 불명 (추가 확인 필요)
- 커버리지/갑: 옵션 값 범위 검증, 기본값 설정 테스트 부재

## 운영/관찰가능성
- 로그: 없음
- 메트릭/트레이싱: 없음
- 알람 포인트: 없음

## 관련 문서
- [Python Converter](../../main-process/python-converter.md) (마진 단위 변환 로직)
- [Data Models](../../05-Data-Models.md) (ConversionOptions 스키마)