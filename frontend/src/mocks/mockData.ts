export interface Theme {
  id: number;
  name: string;
  description: string;
  genre: string;
  level: number;
  themeImageUrl: string;
}

export interface Quest {
  id: number;
  themeId: number;
  questOrder: number;
  name: string;
  description: string;
}

export interface QuestStory {
  id: number;
  questId: number;
  storyOrder: number;
  imageUrl: string;
  content: string;
}

export const MOCK_THEMES: Theme[] = [
  {
    id: 1,
    name: '프로젝트 에이아',
    description:
      "불법 뇌 실험이 자행되는 하이테크 비밀 시설에서 탈출해라! 본인의 뇌에는 실험칩이 심어져 있다. 시설을 통제하는 메인 AI '에이아'가 원인 불명의 오류를 일으킨 틈을 타 탈출하라!",
    genre: 'SF/스릴러',
    level: 1,
    themeImageUrl:
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800',
  },
  {
    id: 2,
    name: '테마명 2',
    description: '테마명 2 상세 설명. 테마명 2 상세 설명.',
    genre: '공포',
    level: 2,
    themeImageUrl:
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800',
  },
  {
    id: 3,
    name: '테마명 3',
    description: '테마명 3 상세 설명. 테마명 3 상세 설명.',
    genre: '스릴러',
    level: 1,
    themeImageUrl:
      'https://images.unsplash.com/photo-1555617766-c94804975da3?w=800',
  },
  {
    id: 4,
    name: '테마명 4',
    description: '테마명 4 상세 설명. 테마명 4 상세 설명.',
    genre: '미스터리',
    level: 2,
    themeImageUrl:
      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800',
  },
  {
    id: 5,
    name: '테마명 5',
    description: '테마명 5 상세 설명. 테마명 5 상세 설명.',
    genre: '전략',
    level: 1,
    themeImageUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
  },
];
export const MOCK_QUESTS: Quest[] = [
  {
    id: 1,
    themeId: 1,
    questOrder: 1,
    name: '서버 접속 & 실험칩 비활성화',
    description:
      '노트북을 통해 서버에 접속하여 자신의 뇌에 심어진 실험칩을 꺼라!',
  },
  {
    id: 2,
    themeId: 1,
    questOrder: 2,
    name: '중앙 서버 권한 탈취',
    description:
      '지하출구로 가는 문은 높은 보안 권한이 필요하다. 중앙 서버 시스템을 조작하여 관리자 권한을 획득하라!',
  },
  {
    id: 3,
    themeId: 1,
    questOrder: 3,
    name: '비상 봉쇄 회로 해제',
    description:
      '최종 출구인 지하 출구에 왔지만, 비상 봉쇄 프로토콜로 인해 문이 굳게 잠겨있다. 옆의 회로를 조작하면 문을 열 수 있을 것 같다.',
  },
];

export const MOCK_QUEST_STORIES: QuestStory[] = [
  // Quest 1 스토리
  {
    id: 1,
    questId: 1,
    storyOrder: 1,
    imageUrl: 'https://your-cdn.com/themes/1/quests/1/story_01.png',
    content:
      '정신을 차리고 보니, 붉은 비상등이 켜져있는 방에서 깨어났다. 관자놀이가 타들어 가는 고통이 느껴지고, 나의 머리에 씌워진 헬멧이 폭발하기 직전인 듯 하다.',
  },
  {
    id: 2,
    questId: 1,
    storyOrder: 2,
    imageUrl: 'https://your-cdn.com/themes/1/quests/1/story_02.png',
    content:
      '노트북에 뜬 화면을 보니, 어떤 오류가 발생한 것 같다. 이 곳에서 탈출하기 위해, 우선 이 에러를 해결해야 한다.',
  },
  // Quest 2 스토리
  {
    id: 3,
    questId: 2,
    storyOrder: 1,
    imageUrl: 'https://your-cdn.com/themes/1/quests/2/story_01.png',
    content:
      '오류를 해결하자마자 옥죄던 헬멧을 바닥으로 내동댕이 쳤다. 방 밖으로 빠져나오니, 시설 전체가 비명을 지르는 듯한 모습이었다.',
  },
  {
    id: 4,
    questId: 2,
    storyOrder: 2,
    imageUrl: 'https://your-cdn.com/themes/1/quests/2/story_02.png',
    content:
      '길이 보이는 대로 뛰어갔고 중앙 서버실에 도착하였고, 모니터엔 접근 권한이 없단 메시지가 떠있다. 유일한 탈출구인 지하 문을 열기 위해선, 관리자 권한을 얻어야 한다.',
  },
  // Quest 3 스토리
  {
    id: 5,
    questId: 3,
    storyOrder: 1,
    imageUrl: 'https://your-cdn.com/themes/1/quests/3/story_01.png',
    content:
      '관리자 권한을 얻어 문을 열고, 지하 탈출구에 도달했고 문을 열어보려 했지만 열리지 않는다. 아무래도 시설 전체의 모든 문을 막아버린 것 같은데, 곧 있으면 감시자들이 나를 찾으러 올 것이다.',
  },
  {
    id: 6,
    questId: 3,
    storyOrder: 2,
    imageUrl: 'https://your-cdn.com/themes/1/quests/3/story_02.png',
    content:
      '방법을 찾기 위해 살펴보니, 문의 오른쪽에 복잡하게 얽힌 회로가 보인다. 감시자들이 오기 전에 어서 이 회로를 조작해야 한다.',
  },
];
