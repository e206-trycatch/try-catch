import type { FilePayload } from '../pages/game/types/apiTypes';
import type { FileNode } from '../pages/game/types/ideTypes';

type Props = {
  node: FileNode;
  fileCodes: Record<string, string>;
  role: 'FRONTEND' | 'BACKEND' | null;
};

export function buildFilesRequestData({ node, fileCodes, role }: Props) {
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
