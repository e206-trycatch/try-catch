import type { FileNode } from '../types/ideTypes';
import Node from './Node';

type Props = {
  root: FileNode; // 프로젝트 최상단 폴더
  expanded: Set<string>; // 현재 열려있는 폴더 id 목록
  onToggleFolder: (id: string) => void; // 폴더를 클릭했을 때 실행할 함수
  onOpenFile: (file: FileNode) => void; // 파일을 클릭했을 때 실행할 함수
};

export default function Explorer({
  root,
  expanded,
  onToggleFolder,
  onOpenFile,
}: Props) {
  return (
    <div>
      <div className="p-3">EXPLORER</div>

      <Node
        node={root}
        depth={0}
        expanded={expanded}
        onToggleFolder={onToggleFolder}
        onOpenFile={onOpenFile}
      />
    </div>
  );
}
