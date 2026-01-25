import Explorer from './components/Explorer';
import { useIde } from './hooks/useIde';
import type { InitalCodeItem } from './types/ideTypes';
import { buildFileTree } from './utils/buildFileTree';

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

export default function Idepage() {
  const initialCode: InitalCodeItem[] = response.result.initialCode;
  const ideRoot = buildFileTree(initialCode);
  const ide = useIde(ideRoot);

  return (
    <div>
      <Explorer
        root={ideRoot}
        expanded={ide.expanded}
        onToggleFolder={ide.toggleFolder}
      />
      ;
    </div>
  );
}
