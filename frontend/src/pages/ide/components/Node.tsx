import type { FileNode } from '../types/ideTypes';

// 파일 트리에서 노드 하나(폴더/파일)를 렌더링하는 컴포넌트
export default function Node({
  node,
  depth, // 트리 깊이
  expanded,
  onToggleFolder,
}: {
  node: FileNode;
  depth: number;
  expanded: Set<string>;
  onToggleFolder: (id: string) => void;
}) {
  const indent = 10 + depth * 14; // 왼쪽 여백 설정

  // 1. 폴더인 경우
  if (node.type === 'folder') {
    // expanded에 노드의 id 값이 있다 = 그 폴더는 현재 열려있다.
    const isOpen = expanded.has(node.id);

    return (
      <div>
        {/* 폴더 한 개 렌더링 */}
        <div
          className="flex items-center gap-1.5 h-7 cursor-pointer select-none"
          style={{ paddingLeft: indent }}
          onClick={() => onToggleFolder(node.id)}
        >
          <span style={{ width: 14 }}>{isOpen ? '▾' : '▸'}</span>
          <span>{isOpen ? '📂' : '📁'}</span>
          <span>{node.name}</span>
        </div>

        {/* 폴더가 열려 있다면 자식 노드(폴더/파일) 렌더링 */}
        {isOpen &&
          node.children?.map((child) => (
            <Node
              key={child.id} // React가 리스트 렌더링 식별을 위해 필요한 값
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggleFolder={onToggleFolder}
            />
          ))}
      </div>
    );
  }

  // 2. 파일인 경우
  else {
    return (
      <div
        className="flex items-center gap-1.5 h-7 cursor-pointer select-none "
        style={{ paddingLeft: indent }}
      >
        <span className="text-xs tracking-widest">{'</>'}</span>
        <span>{node.name}</span>
      </div>
    );
  }
}
