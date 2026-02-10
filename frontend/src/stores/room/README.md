# ✨ Room Store Refactoring

## 구조

```
stores/
├── room/
│   ├── types.ts                  # 공통 타입 정의
│   ├── useRoomDraftStore.ts      # Draft 상태 관리 (511줄 → 270줄)
│   ├── useRoomMetaStore.ts       # 메타 정보 관리 (테마, 프레임워크)
│   ├── useQuestCacheStore.ts     # 퀘스트 캐싱
│   ├── roomUtils.ts              # 순수 함수 (validation, payload 생성)
│   └── index.ts                  # Export 집합
└── useRoomStore.ts               # Facade (기존 API 100% 호환)
```

## 사용법

### 1. 기존 코드 (변경 불필요)

```typescript
// 기존 useRoomStore 그대로 사용
import { useRoomStore } from '@/stores/useRoomStore';

function GamePage() {
  const { draft } = useRoomStore.getState();
  const setMode = useRoomStore((s) => s.setMode);
  
  // 모든 기존 API 동작
}
```

### 2. 새 코드 (분리된 stores 사용)

```typescript
// 작은 단위로 필요한 것만 import
import { useRoomDraftStore } from '@/stores/room';
import { useRoomMetaStore } from '@/stores/room';
import { validateDraft, buildCreatePayload } from '@/stores/room';

function NewRoomSettingPage() {
  // 필요한 store만 구독
  const draft = useRoomDraftStore((s) => s.draft);
  const setPosition = useRoomDraftStore((s) => s.setPosition);
  
  const availableFrameworks = useRoomMetaStore((s) => s.availableFrameworks);
  
  // 순수 함수로 validation
  const validation = validateDraft(draft);
  
  // 순수 함수로 payload 생성
  const payload = buildCreatePayload(draft);
}
```

## 이점

### ✅ 팀원 코드 영향 제로
- `useRoomStore` Facade가 기존 API 100% 유지
- GamePage 등 기존 코드는 수정 불필요

### ✅ 관심사 분리
- Draft 상태: `useRoomDraftStore`
- 메타 정보: `useRoomMetaStore`
- 캐싱: `useQuestCacheStore`
- 로직: `roomUtils` 순수 함수

### ✅ 테스트 가능
```typescript
import { validateDraft, buildCreatePayload } from '@/stores/room/roomUtils';

test('FULLSTACK validation', () => {
  const draft = {
    mode: 'SINGLE',
    position: 'FULLSTACK',
    frontendId: 1,
    backendId: 2,
    // ...
  };
  
  const result = validateDraft(draft);
  expect(result.ok).toBe(true);
});
```

### ✅ 성능 최적화
```typescript
// 기존: 전체 store 구독 (불필요한 리렌더링)
const { draft, themeName, questList } = useRoomStore();

// 개선: 필요한 부분만 구독
const draft = useRoomDraftStore((s) => s.draft); // draft 변경시만 리렌더
const themeName = useRoomMetaStore((s) => s.themeName); // theme 변경시만 리렌더
```

### ✅ 점진적 마이그레이션
1. 기존 코드: `useRoomStore` 계속 사용
2. 새 기능: 분리된 stores 직접 사용
3. 나중에 천천히 기존 코드도 마이그레이션 (선택사항)

## 마이그레이션 가이드

기존 코드를 새 방식으로 바꾸고 싶다면:

```typescript
// Before
import { useRoomStore } from '@/stores/useRoomStore';

const { draft, setPosition, themeName, setThemeName } = useRoomStore();

// After
import { useRoomDraftStore, useRoomMetaStore } from '@/stores/room';

const { draft, setPosition } = useRoomDraftStore();
const { themeName, setThemeName } = useRoomMetaStore();
```

## 주의사항

- **기존 useRoomStore는 그대로 유지**: 팀원들이 사용 중
- **새 작업할 때만** 분리된 stores 사용 고려
- **강제 마이그레이션 불필요**: Facade가 호환성 보장
