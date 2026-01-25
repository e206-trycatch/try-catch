import Explorer from './components/Explorer';
import { useFile } from './hooks/useFile';
import { useIde } from './hooks/useIde';
import type { FileNode } from './types/ideTypes';

export default function Idepage() {
  const files = useFile();

  const rootNode: FileNode = {
    id: 'root',
    name: 'root',
    type: 'folder' as const, // 값을 리터럴 타입으로 고정해서 타입이 넓어지는 걸 막는 문법
    path: '/',
    children: files,
  };

  const ide = useIde(rootNode);

  return (
    <div>
      <Explorer
        root={rootNode}
        expanded={ide.expanded}
        onToggleFolder={ide.toggleFolder}
      />
      ;
    </div>
  );
}
