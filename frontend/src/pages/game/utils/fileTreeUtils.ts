import type { FileNode, QuestFile } from '../types/ideTypes';

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

  const extension = fileName.includes('.') ? fileName.split('.').at(-1)! : '';
  return extensionMap[extension] ?? 'plainText';
};

// 폴더/파일 계층 구조의 트리를 생성
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
  const folderCache = new Map<string, FileNode>();
  folderCache.set('/', root);

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

      // 값이 없다면 새로 생성하기
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

// 트리에서 filePath로 파일 id를 찾는 dfs 탐색
export function findFileIdByPath(
  node: FileNode,
  filePath: string,
): string | null {
  if (node.type === 'file' && node.path === filePath) return node.id;

  for (const child of node.children ?? []) {
    const found = findFileIdByPath(child, filePath);
    if (found) return found;
  }
  return null;
}
