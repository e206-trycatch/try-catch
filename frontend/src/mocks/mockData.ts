export interface Theme {
  themeId: number;
  name: string;
  description: string;
  genre: string;
  level: number;
  themeImageUrl: string;
}

export const MOCK_THEMES: Theme[] = [
  {
    themeId: 1,
    name: '폭탄 해제',
    description: '빌드 서버의 CI 폭탄을 제한 시간 내에 해제하라.',
    genre: '공포',
    level: 1,
    themeImageUrl:
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800',
  },
  {
    themeId: 2,
    name: '물 누수',
    description:
      '서버실에 물이 새고 있다! 코드를 수정해 배수 시스템을 가동하라.',
    genre: '공포',
    level: 2,
    themeImageUrl:
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800',
  },
  {
    themeId: 3,
    name: '메모리 부족',
    description: '누수되는 메모리를 찾아 프로세스를 살려내세요.',
    genre: '스릴러',
    level: 3,
    themeImageUrl:
      'https://images.unsplash.com/photo-1555617766-c94804975da3?w=800',
  },
  {
    themeId: 4,
    name: '무한 루프',
    description: '끝나지 않는 재귀 함수의 굴레에서 벗어나야 합니다.',
    genre: '미스터리',
    level: 4,
    themeImageUrl:
      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800',
  },
  {
    themeId: 5,
    name: '데드락',
    description: '서로를 기다리는 자원들 사이의 연결 고리를 끊으세요.',
    genre: '전략',
    level: 5,
    themeImageUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
  },
];
