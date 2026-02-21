import type { CodeRole } from '@/pages/game/types/ideTypes';

import type { FilePayload, RolePayload } from '../types/apiTypes';
import type { FileNode } from '../types/ideTypes';

type BuildFileRequestParams = {
  node: FileNode;
  fileCodes: Record<string, string>;
  role: CodeRole;
};

// 파일 트리에서 파일을 제출용 배열로 수집
export function buildFilesRequest({
  node,
  fileCodes,
  role,
}: BuildFileRequestParams) {
  const result: FilePayload[] = [];

  const dfs = (n: FileNode) => {
    if (n.type === 'file' && n.role === role) {
      result.push({
        filePath: n.path,
        fileType: n.fileType ?? '',
        code: fileCodes[n.id] ?? '코드 없음',
      });
    }
    n.children?.forEach(dfs);
  };

  dfs(node);
  return result;
}

// 전체 코드 스냅샷 생성
export function snapshotFileCodes(
  fileCodes: Record<string, string>,
  activeFileId: string | null,
  currentCode: string,
  openTabs: { id: string; code?: string }[] = [],
): Record<string, string> {
  const snapshot = { ...fileCodes };

  if (activeFileId) {
    snapshot[activeFileId] = currentCode;
  }

  openTabs.forEach((f) => {
    snapshot[f.id] ??= f.code ?? '';
  });

  return snapshot;
}

// 프론트엔드/백엔드 제출 데이터 생성
export function buildSubmissionPayload(
  rootNode: FileNode,
  fileCodes: Record<string, string>,
): { frontend: RolePayload; backend: RolePayload } {
  return {
    frontend: {
      files: buildFilesRequest({
        node: rootNode,
        fileCodes,
        role: 'FRONTEND',
      }),
    },
    backend: {
      files: buildFilesRequest({
        node: rootNode,
        fileCodes,
        role: 'BACKEND',
      }),
    },
  };
}
