// import axios from 'axios';

export const getQuestFile = async (questId: number) => {
  // const response = await axios.get(
  //   `/api/v1/rooms/single/quest/${questId}/file-content`,
  // );
  // return response.data.result.initialCode;

  const response = {
    status: 200,
    message: '문제 조회 성공',
    result: {
      themeId: 2,
      themeName: '폭탄 해제',
      questTitle: '빌드 서버 폭주',
      fFrameName: 'Vue.js',
      bFrameName: 'Spring Boot',
      initialCode: [
        {
          fileId: 10,
          filePath: '/src/main.js',
          fileType: 'SOURCE',
          code: 'public static ....',
        },
        {
          fileId: 11,
          filePath: '/src/temp/utils.js',
          fileType: 'SOURCE',
          code: `export const sum = (a,b)=>a+b;`,
        },
      ],
    },
  };

  return response.result.initialCode;
};
