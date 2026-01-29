import type { FileNode, QuestFile } from '../types/ideTypes';

// Record<K, V>는 {[key: K]: V> 형태의 객체 타입을 의미한다.
// cf) Map은 실제 키-값 저장소이다.
const extensionMap: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  vue: 'html',
  py: 'python',
  json: 'json',
  html: 'html',
  css: 'css',
  java: 'java',
  yml: 'yaml',
  yaml: 'yaml',
  md: 'markdown',
  properties: 'ini',
};

const getFileLanguage = (filePath: string): string => {
  const fileName = filePath.split('/').filter(Boolean).at(-1) ?? '';

  // ! : Non-null assertion operator
  // 해당 값이 undefined가 아님을 단언하여 타입을 확정시켜준다.
  // !가 없으면 string | undefined가 되어 에러가 발생한다..
  // ts 입장에서는 밑줄을 긋는다.
  const extension = fileName.includes('.') ? fileName.split('.').at(-1)! : '';
  return extensionMap[extension] ?? 'plainText';
};

// 폴더/파일 계층 구조의 트리를 생성한다.
// 최상위 루트 노드(자식들 포함한 채)를 반환한다.
export function buildFileTree(questFile: QuestFile[]): FileNode {
  // 최상위 로트 노드
  const root: FileNode = {
    id: 'root',
    name: 'root',
    type: 'folder',
    path: '/',
    children: [],
    role: null,
  };

  // 폴더 중복 방지
  // new Map() : 키-값 저장소 객체 (이때, Map은 생성자라서 new로 인스턴스를 만들어야 한다.)
  // <string, FileNode> = <경로 문자열, 그 경로에 해당하는 폴더 노드>
  const folderCache = new Map<string, FileNode>();
  folderCache.set('/', root); // root 폴더 등록

  // 파일 객체들이 들어 있는 initialCode 배열 순회
  for (const file of questFile) {
    // 경로를 분해한 결과
    // filter(Boolean) : falsy 값 제거
    const role = file.codeRole;
    const parts = file.filePath.split('/').filter(Boolean);
    const fileName = parts.at(-1)!;
    const folderParts = parts.slice(0, -1);

    let currentFolderPath = '/';
    let currentFolderNode = root;

    // 폴더 경로를 내려가면서 필요한 폴더 노드 생성
    for (const folderName of folderParts) {
      currentFolderPath =
        currentFolderPath === '/'
          ? `/${folderName}`
          : `${currentFolderPath}/${folderName}`;

      // 이미 생성된 폴더인지 확인하기
      let folderNode = folderCache.get(currentFolderPath);

      // 값이 없다면 = 아직 생성되지 않은 폴더
      // 새로 생성을 해야한다.
      if (!folderNode) {
        folderNode = {
          id: `folder:${currentFolderPath}`,
          name: folderName,
          type: 'folder',
          path: currentFolderPath,
          role: role,

          children: [], // 하위 파일/폴더가 들어갈 배열
        };

        currentFolderNode.children!.push(folderNode);
        folderCache.set(currentFolderPath, folderNode);
      }
      currentFolderNode = folderNode;
    }

    // 파일 노드 생성
    const fileNode: FileNode = {
      id: `file:${file.fileId}`,
      name: fileName,
      type: 'file',
      path: file.filePath,
      role: role,

      fileId: file.fileId,
      fileType: file.fileType,
      language: getFileLanguage(file.filePath),
      code: file.code,
    };

    // 폴더 children에 파일 넣기
    currentFolderNode.children!.push(fileNode);
  }
  return root;
}
