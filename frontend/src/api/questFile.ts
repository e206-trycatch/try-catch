// import axios from 'axios';

import type { QuestInfo } from '../pages/game/types/ideTypes';

// 로그 데이터 + 문제 파일 목록
export const getQuest = async (questId: number): Promise<QuestInfo> => {
  // const response = await axios.get(
  //   `/api/v1/rooms/{roomId}/quest/{questId}/files`,
  // );
  // return response.data.result as QuestInfo;;

  const response = {
    message: '문제 파일 목록을 불러왔습니다.',
    result: {
      problemFrameworkId: 1,
      frontendErrorLog: 'Expected syntax error in line 10',
      backendErrorLog: 'NullPointerException in Service layer',
      files: [
        {
          fileId: 1,
          filePath: 'frontend_react/src/App.js',
          codeRole: 'FRONTEND',
          code: "import React from 'react';\nimport './App.css';\n\nfunction App() {\n  return (\n    <div className=\"App\">\n      Hello World\n    \n  );\n}\n\nexport default App;",
          fileType: 'SOURCE',
        },
        {
          fileId: 2,
          filePath: 'frontend_react/package.json',
          codeRole: 'FRONTEND',
          code: '{\n  "name": "frontend-app",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.2.0"\n  }\n}',
          fileType: 'CONFIG',
        },
        {
          fileId: 3,
          filePath: 'backend_springboot/src/main/java/Application.java',
          codeRole: 'BACKEND',
          code: 'package com.example;\n\npublic class Application {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}',
          fileType: 'SOURCE',
        },
        {
          fileId: 4,
          filePath: 'backend_springboot/pom.xml',
          codeRole: 'BACKEND',
          code: '<?xml version="1.0"?>\n\n  4.0.0\n  com.example\n  backend\n',
          fileType: 'CONFIG',
        },
      ],
    },
  };

  return response.result as QuestInfo;
};
