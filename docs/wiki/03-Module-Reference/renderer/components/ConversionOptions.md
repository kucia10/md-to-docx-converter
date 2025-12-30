# ConversionOptions Component

## Summary
- **Responsibility**: Provide document conversion options settings UI (font, margins, bibliography styles, etc.)
- **Main Users/Callers**: [`App.tsx`](../../../src/renderer/App.tsx:1)
- **Key Entry Point**: [`ConversionOptions`](../../../src/renderer/components/ConversionOptions.tsx:11) component

## Location in Architecture
- **Layer**: Renderer Process - UI Component
- **Upstream/Downstream Dependencies**:
  - **Dependency**: [`App.tsx`](../../../src/renderer/App.tsx:1)
  - **Downstream**: `types/index.ts` (`ConversionOptions` type)
  - **Used by**: None (props only)
  - **Role in Runtime Flow**: Provide conversion options to user → pass to upper component

## Public Interface

### ConversionOptionsProps
```typescript
interface ConversionOptionsProps {
  options: ConversionOptionsType
  onOptionsChange: (options: ConversionOptionsType) => void
}
```

#### options
- **Type**: `ConversionOptionsType`
- **Description**: Current conversion options value

#### onOptionsChange
- **Type**: `(options: ConversionOptionsType) => void`
- **Description**: Callback invoked when options change

### ConversionOptionsType
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

## Internal Behavior

### Major Flows
1. **Initialization**: `useEffect` to set default values (line 33-53)
2. **Option Update**: `updateOption()` function to update individual options (line 55)
3. **Parent Component Delivery**: Pass changed options via `onOptionsChange()` (line 56)
4. **UI Rerender**: Re-render UI based on changed options

### Key Rules/Algorithms
- **Default Values Setting**:
  - `fontFamily`: 'Georgia'
  - `fontSize`: 14pt
  - `lineHeight`: 1.5
  - `marginTop`/`marginBottom`: 2.54cm
  - `marginLeft`/`marginRight`: 3.18cm
  - `orientation`: 'portrait'
  - `generateToc`: `true`
  - `referenceStyle`: 'chicago'
- **Margin Unit**: UI displays in **cm** (centimeter)
- **Python Conversion**: Convert to **inches** (÷2.54) before passing to Python
- **Option Constraints**:
  - `fontSize`: 8pt ~ 72pt
  - `lineHeight`: 0.5 ~ 3.0
  - `margins`: 0 ~ 10cm

### Edge Cases
- Missing option values: Use `||` operator to set defaults
- Invalid option ranges: Not currently validated (add validation if needed)

## Data/Models

### ConversionOptionsType
[See details in Data Models](../../05-Data-Models.md#conversionoptions)

## Configuration/Environment Variables
- **Default Option Values**: Hardcoded default values used (line 41-50)
- **Bibliography Styles**: APA, MLA, Chicago, Harvard supported

## Dependencies

### Internal Modules
- [`types/index.ts`](../../../src/renderer/types/index.ts): `ConversionOptionsType` type

### External Libraries/Services
- React: `useState`, `useEffect`
- i18next: `useTranslation()`
- lucide-react: Icons (font size, etc.)

## Testing
- **Related Tests**: `vitest` unit tests (add if needed)
- **Coverage/Gaps**: No tests currently, component testing needed
- **Test Scenarios**:
  - Initial rendering
  - Option value change
  - Default value setting
  - Margin unit conversion verification

## Operations/Observability

### Logging
- None (pure UI component)

### Metrics/Tracing
- None

### Alert Points
- None

## Related Documents
- [Python Converter](../../main-process/python-converter.md): Margin unit conversion (cm → inches)
- [Data Models](../../05-Data-Models.md): ConversionOptions schema

## Changelog (Optional)
- v1.0: Initial implementation