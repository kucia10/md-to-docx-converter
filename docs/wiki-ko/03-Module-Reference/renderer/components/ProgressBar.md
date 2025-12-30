# ProgressBar

## 요약
- **책임**: 변환 진행률 표시 UI 컴포넌트
- **주요 사용자/호출자**: [`App.tsx`](../../../../../src/renderer/App.tsx), 변환 컨테이너
- **핵심 엔트리포인트**: [`ProgressBar`](../../../../../src/renderer/components/ProgressBar.tsx:39)

## 아키텍처 내 위치
- **레이어**: Renderer Process - Presentation Layer (UI Components)
- **상위/하위 의존**:
  - 의존: `types` ([`ConversionProgress`](../../../../../src/renderer/types/index.ts)), `i18next`
  - 사용: 변환 화면, 배치/병합 변환 화면
- **런타임 플로우에서의 역할**: IPC 이벤트 수신 → 진행률 업데이트 → UI 렌더링

## 퍼블릭 인터페이스

### Props
```typescript
interface ProgressBarProps {
  progress: ConversionProgress   // 진행률 데이터
  onCancel: () => void          // 취소 핸들러
}
```

### ConversionProgress 타입
```typescript
{
  currentFile: number,       // 현재 처리 중인 파일 인덱스
  totalFiles: number,        // 전체 파일 수
  currentFileName: string,    // 현재 파일명
  percentage: number,        // 진행률 백분율 (0-100)
  stage: 'preparing' | 'converting' | 'finalizing' | 'completed' | 'error'
}
```

## 내부 동작

### 주요 플로우
1. **스테이지 텍스트 결정**: [`getStageText()`](../../../../../src/renderer/components/ProgressBar.tsx:11)
   - `preparing`: 준비 중
   - `converting`: 변환 중
   - `finalizing`: 완료 중
   - `completed`: 완료
   - `error`: 오류 발생

2. **스테이지 아이콘 결정**: [`getStageIcon()`](../../../../../src/renderer/components/ProgressBar.tsx:26)
   - 진행 중: 시계 아이콘 (`Clock`) + 회전 애니메이션
   - 완료: 체크 아이콘 (`CheckCircle`, 녹색)
   - 오류: 경고 아이콘 (`AlertCircle`, 빨간색)

3. **UI 렌더링**:
   - **헤더**: 스테이지 텍스트 + 아이콘 + 취소 버튼
   - **진행 바**: 백분율 기반 너비 + 색상 (진행/완료/오류)
   - **현재 파일 정보**: 파일명 표시
   - **상세 상태**: 스테이지, 파일 진행률, 전체 진행률
   - **예상 시간**: 진행 중일 때만 표시
   - **완료/오류 메시지**: 상태별 다른 배경색

### 핵심 규칙/알고리즘
- **진행 바 색상**:
  - 진행 중: `bg-primary-500` (파란색)
  - 완료: `bg-green-500` (녹색)
  - 오류: `bg-red-500` (빨간색)
- **취소 버튼**: 완료/오류 상태에서는 숨김
- **예상 시간**: `(100 - percentage) * 0.5` 초로 추정 (단순 선형 추정)
- **다중 파일**: `totalFiles > 1`일 때 파일 진행률 표시

### 엣지케이스
- `percentage = 0`: 진행 바 너비 0%
- `percentage = 100`: 완료 상태 처리
- `currentFileName` 비어있음: 파일 정보 섹션 숨김
- 단일 파일(`totalFiles = 1`): 파일 진행률 표시 생략

## 데이터/모델

### Stage 값 및 의미
| 스테이지 | 아이콘 | 색상 | 텍스트 |
|----------|--------|------|--------|
| `preparing` | 시계 + 회전 | 기본 | 준비 중 |
| `converting` | 시계 + 회전 | 기본 | 변환 중 |
| `finalizing` | 시계 + 회전 | 기본 | 완료 중 |
| `completed` | 체크 | 녹색 | 완료 |
| `error` | 경고 | 빨간색 | 오류 발생 |

## 설정/환경변수
- 사용하지 않음 (props로만 전달)

## 의존성

### 내부 모듈
- [`types/index.ts`](../../../../../src/renderer/types/index.ts): `ConversionProgress`

### 외부 라이브러리/서비스
- React: `React.FC`
- i18next: `useTranslation()`
- lucide-react: `X`, `Clock`, `CheckCircle`, `AlertCircle` (아이콘)
- Tailwind CSS: 스타일링

## 테스트
- 관련 테스트: `vitest` 단위 테스트 (필요 시 추가)
- 커버리지/갭: 현재 테스트 없음, 컴포넌트 테스트 필요
- 테스트 시나리오:
  - 모든 스테이지 상태 렌더링
  - 진행률 0%, 50%, 100% 렌더링
  - 다중 파일 vs 단일 파일 렌더링 차이
  - 취소 버튼 클릭
  - 예상 시간 계산
  - 빈 파일명 처리

## 운영/관찰가능성

### 로그
- 없음 (순수 UI 컴포넌트)

### 메트릭/트레이싱
- 없음

### 알람 포인트
- `stage === 'error'`: 빨간색 배경 + 경고 메시지 표시
- `stage === 'completed'`: 녹색 배경 + 성공 메시지 표시
- `percentage` 변경에 따라 부드러운 애니메이션 (`transition-all duration-300`)

## 스타일링 (Tailwind CSS)

### 공통 클래스
- 컨테이너: `space-y-4`
- 텍스트: 다크 모드 지원 (`dark:text-gray-XXX`)
- 버튼: 호버 효과 (`hover:text-red-500`)

### 진행 바
- 배경: `bg-gray-200 dark:bg-gray-700 rounded-full h-2`
- 채우기: `h-2 rounded-full transition-all duration-300`
- 색상 변화: `bg-primary-500` → `bg-green-500` / `bg-red-500`

### 상태 메시지
- 성공: `bg-green-50 dark:bg-green-900/30 border-green-200`
- 오류: `bg-red-50 dark:bg-red-900/30 border-red-200`

## 관련 컴포넌트
- [`ResultDisplay`](./ResultDisplay.md): 완료 후 결과 표시
- [`ConversionOptions`](./ConversionOptions.md): 변환 옵션 설정

## 변경 이력(선택)
- v1.0: 초기 구현