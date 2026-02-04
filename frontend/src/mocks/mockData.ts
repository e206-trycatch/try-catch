import projectAiMainImage from '../assets/images/project_ai/Project_ai_quest_main.png';
import graveyardOfTheDeepMainImage from '../assets/images/Graveyard_of_the_deep_quest_main.png';

export type GameMode = 'SINGLE' | 'MULTI';
export type RoomStatus = 'CREATED' | 'PLAYING' | 'ENDED';

export interface Theme {
  themeId: number;
  name: string;
  description: string;
  genre: string;
  level: number;
  themeImageUrl: string;
  quests: Quest[];
  isAvailable: boolean;
}

export interface Quest {
  questId: number;
  themeId: number;
  questOrder: number;
  name: string;
  description: string;
  stories: QuestStory[];
}

export interface QuestStory {
  id: number;
  questId: number;
  storyOrder: number;
  imageUrl: string;
  content: string;
}

export interface Room {
  roomId: string;
  themeId: number;

  mode: GameMode;
  roomName: string;

  // 싱글이면 둘 중 하나, 멀티면 둘 다 가능
  frontendId: number | null;
  backendId: number | null;

  life: number;
  remainingHintCount: number;

  status: RoomStatus;

  createdAt: string;
}

// 문제 선택 페이지에서 사용할 최소 단위
export interface ProblemSelectionContext {
  roomId: string;
  questId: number;
}

// 프레임워크 mock
export type CodeRole = 'FRONTEND' | 'BACKEND';

export interface FrameworkItem {
  id: number;
  name: string;
}

export const MOCK_FRAMEWORKS: Record<CodeRole, FrameworkItem[]> = {
  FRONTEND: [
    { id: 1, name: 'React' },
    { id: 2, name: 'Vue' },
  ],
  BACKEND: [
    { id: 1, name: 'SpringBoot' },
    { id: 2, name: 'Django' },
  ],
};

// Id generator mock
const makeStoryId = (questId: number, storyOrder: number) =>
  questId * 100 + storyOrder;

// Theme 1: 프로젝트 에이아
const PROJECT_EIA_THEME_ID = 1;

const eiaQuest1Id = 1;
const eiaQuest2Id = 2;
const eiaQuest3Id = 3;

const THEME_PROJECT_EIA: Theme = {
  themeId: PROJECT_EIA_THEME_ID,
  name: '프로젝트 에이아',
  description: `불법 뇌 실험이 진행되는 하이테크 비밀 시설에서 탈출하라! 본인의 뇌에는 실험칩이 심어져 있다. 시설을 통제하는 메인 AI '에이아'가 원인 불명의 오류를 일으키며 탈출자들을 막는다.`,
  genre: 'SF/스릴러',
  level: 1,
  themeImageUrl: projectAiMainImage,
  isAvailable: true, // DB에 있는 테마

  quests: [
    {
      questId: eiaQuest1Id,
      themeId: PROJECT_EIA_THEME_ID,
      questOrder: 1,
      name: '서버 접속 & 실험칩 비활성화',
      description:
        '노트북을 통해 서버에 접속하여 자신의 뇌에 심어진 실험칩을 꺼라!',
      stories: [
        {
          id: makeStoryId(eiaQuest1Id, 1),
          questId: eiaQuest1Id,
          storyOrder: 1,
          imageUrl: '',
          content:
            '정신을 차리고 보니, 붉은 비상등이 켜져있는 방에서 깨어났다. 관자놀이가 타들어 가는 고통이 느껴지고, 나의 머리에 씌워진 헬멧이 폭발하기 직전인 듯 하다.',
        },
        {
          id: makeStoryId(eiaQuest1Id, 2),
          questId: eiaQuest1Id,
          storyOrder: 2,
          imageUrl: '',
          content:
            '노트북에 뜬 화면을 보니, 어떤 오류가 발생한 것 같다. 이 곳에서 탈출하기 위해, 우선 이 에러를 해결해야 한다.',
        },
      ],
    },
    {
      questId: eiaQuest2Id,
      themeId: PROJECT_EIA_THEME_ID,
      questOrder: 2,
      name: '중앙 서버 권한 탈취',
      description:
        '지하출구로 가는 문은 높은 보안 권한이 필요하다. 중앙 서버 시스템을 조작하여 관리자 권한을 획득하라!',
      stories: [
        {
          id: makeStoryId(eiaQuest2Id, 1),
          questId: eiaQuest2Id,
          storyOrder: 1,
          imageUrl: '',
          content:
            '오류를 해결하자마자 옥죄던 헬멧을 바닥으로 내동댕이 쳤다. 방 밖으로 빠져나오니, 시설 전체가 비명을 지르는 듯한 모습이었다.',
        },
        {
          id: makeStoryId(eiaQuest2Id, 2),
          questId: eiaQuest2Id,
          storyOrder: 2,
          imageUrl: '',
          content:
            '길이 보이는 대로 뛰어갔고 중앙 서버실에 도착하였고, 모니터엔 접근 권한이 없단 메시지가 떠있다. 유일한 탈출구인 지하 문을 열기 위해선, 관리자 권한을 얻어야 한다.',
        },
      ],
    },
    {
      questId: eiaQuest3Id,
      themeId: PROJECT_EIA_THEME_ID,
      questOrder: 3,
      name: '비상 봉쇄 회로 해제',
      description:
        '최종 출구인 지하 출구에 왔지만, 비상 봉쇄 프로토콜로 인해 문이 굳게 잠겨있다. 옆의 회로를 조작하면 문을 열 수 있을 것 같다.',
      stories: [
        {
          id: makeStoryId(eiaQuest3Id, 1),
          questId: eiaQuest3Id,
          storyOrder: 1,
          imageUrl: '',
          content:
            '관리자 권한을 얻어 문을 열고, 지하 탈출구에 도달했고 문을 열어보려 했지만 열리지 않는다. 아무래도 시설 전체의 모든 문을 막아버린 것 같은데, 곧 있으면 감시자들이 나를 찾으러 올 것이다.',
        },
      ],
    },
  ],
};

// 다른 샘플 테마들
const makeTheme = (
  args: Omit<Theme, 'quests'> & { baseQuestId: number },
): Theme => {
  const { baseQuestId, ...t } = args;

  const q1 = baseQuestId;
  const q2 = baseQuestId + 1;
  const q3 = baseQuestId + 2;

  return {
    ...t,
    quests: [
      {
        questId: q1,
        themeId: t.themeId,
        questOrder: 1,
        name: `${t.name} - 퀘스트 1`,
        description: `${t.name} 테마 퀘스트 1에 대한 설명`,
        stories: [
          {
            id: makeStoryId(q1, 1),
            questId: q1,
            storyOrder: 1,
            imageUrl: '',
            content: '문제가 발생했다. 단서를 찾아 해결해야 한다.',
          },
        ],
      },
      {
        questId: q2,
        themeId: t.themeId,
        questOrder: 2,
        name: `${t.name} - 퀘스트 2`,
        description: `${t.name} 테마 퀘스트 2에 대한 설명`,
        stories: [
          {
            id: makeStoryId(q2, 1),
            questId: q2,
            storyOrder: 1,
            imageUrl: '',
            content: '새로운 단서를 발견했다. 이를 활용해 문제를 해결하라.',
          },
          {
            id: makeStoryId(q2, 2),
            questId: q2,
            storyOrder: 2,
            imageUrl: '',
            content: '모은 단서를 바탕으로 문제를 해결하라.',
          },
        ],
      },
      {
        questId: q3,
        themeId: t.themeId,
        questOrder: 3,
        name: `${t.name} - 퀘스트 3`,
        description: `${t.name} 테마 퀘스트 3에 대한 설명`,
        stories: [
          {
            id: makeStoryId(q3, 1),
            questId: q3,
            storyOrder: 1,
            imageUrl: '',
            content: '탈출 직전, 마지막 장치가 잠겨있다.',
          },
          {
            id: makeStoryId(q3, 2),
            questId: q3,
            storyOrder: 2,
            imageUrl: '',
            content: '회로를 바로 잡으면 문이 열릴 것 같다.',
          },
        ],
      },
    ],
  };
};

const THEME_BOMB = makeTheme({
  themeId: 2,
  name: '심해의 무덤',
  description: '빌드 서버의 CI 폭탄을 제한 시간 내에 해제하라.',
  genre: '공포',
  level: 1,
  themeImageUrl: graveyardOfTheDeepMainImage,
  baseQuestId: 100,
  isAvailable: false,
});

const THEME_LEAK = makeTheme({
  themeId: 3,
  name: '물 누수',
  description: '서버실에 물이 새고 있다! 코드를 수정해 배수 시스템을 가동하라.',
  genre: '공포',
  level: 2,
  themeImageUrl:
    'https://images.unsplash.com/photo-1555617766-c94804975da3?w=800',
  baseQuestId: 200,
  isAvailable: false,
});

const THEME_OOM = makeTheme({
  themeId: 4,
  name: '메모리 부족',
  description: '누수되는 메모리를 찾아 프로세스를 살려내세요.',
  genre: '스릴러',
  level: 3,
  themeImageUrl:
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
  baseQuestId: 300,
  isAvailable: false,
});

const THEME_DEADLOCK = makeTheme({
  themeId: 5,
  name: '데드락',
  description: '서로를 기다리는 자원들 사이의 연결 고리를 끊으세요.',
  genre: '전략',
  level: 5,
  themeImageUrl:
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800',
  baseQuestId: 400,
  isAvailable: false,
});

// public exports (테마, 퀘스트, 퀘스트 스토리)
export const MOCK_THEMES: Theme[] = [
  THEME_PROJECT_EIA,
  THEME_BOMB,
  THEME_LEAK,
  THEME_OOM,
  THEME_DEADLOCK,
];

export const MOCK_QUESTS: Quest[] = MOCK_THEMES.flatMap(
  (theme) => theme.quests,
);
export const MOCK_QUEST_STORIES: QuestStory[] = MOCK_QUESTS.flatMap(
  (quest) => quest.stories,
);

// 쿼리 헬퍼 (테마, 퀘스트, 퀘스트 스토리 - ID로 조회)
export const getThemes = (): Theme[] => MOCK_THEMES;

export const getThemeById = (themeId: number): Theme | undefined =>
  MOCK_THEMES.find((t) => t.themeId === themeId);

export const getQuestsByThemeId = (themeId: number): Quest[] =>
  getThemeById(themeId)?.quests ?? [];

export const getQuestById = (questId: number): Quest | undefined =>
  MOCK_QUESTS.find((q) => q.questId === questId);

export const getQuestStories = (questId: number): QuestStory[] =>
  getQuestById(questId)?.stories ?? [];

// Room mock (방 생성 -> roomId 반환)
const rooms = new Map<string, Room>();

export const createMockRoom = (params: {
  themeId: number;
  mode: GameMode;
  roomName?: string;

  frontendId?: number | null;
  backendId?: number | null;

  life?: number;
  remainingHintCount?: number;
}): Room => {
  const roomId = crypto.randomUUID();

  const room: Room = {
    roomId,
    themeId: params.themeId,
    mode: params.mode,
    roomName: params.roomName ?? `Room-${roomId.slice(0, 8)}`,

    frontendId: params.frontendId ?? null,
    backendId: params.backendId ?? null,

    life: params.life ?? 3,
    remainingHintCount: params.remainingHintCount ?? 3,

    status: 'CREATED',
    createdAt: new Date().toISOString(),
  };

  rooms.set(roomId, room);
  return room;
};

export const getRoomById = (roomId: string): Room | undefined =>
  rooms.get(roomId);

export const buildProblemSelectionContext = (
  roomId: string,
  questId: number,
): ProblemSelectionContext => ({
  roomId,
  questId,
});

// 문제 Types (ERD 참고)
export type FileType = 'SOURCE' | 'CONFIG' | 'TEST' | 'DOC' | 'ASSET';

export interface Problem {
  problemId: number;
  questId: number;
  name: string;
  description: string;
  files: ProblemFile[];
}

export interface ProblemFile {
  fileId: number;
  problemId: number;
  fileName: string;
  filePath: string;
  fileType: FileType;
  content: string;
}
