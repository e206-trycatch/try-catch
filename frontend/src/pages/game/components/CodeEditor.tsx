import { Editor } from '@monaco-editor/react';

import type { FileNode } from '../types/ideTypes';

interface CodeEditorProps {
  activeFile: FileNode | null;
  code: string;
  onChange: (value: string) => void;
}

export default function CodeEditor({
  activeFile,
  code,
  onChange,
}: CodeEditorProps) {
  if (!activeFile) {
    return (
      <div style={{ color: '#888', padding: '20px' }}>파일을 선택해주세요</div>
    );
  }
  return (
    <Editor
      key={activeFile.id}
      width="100%"
      height="calc(100vh - 36px)"
      language={activeFile.language ?? 'javascript'} // 활성화 된 파일이 있고, 언어가 있다면 그 값 쓰기
      value={code} // 에디터에 표시되는 텍스트
      theme="vs-dark"
      options={{ minimap: { enabled: false } }}
      onChange={(v) => onChange(v ?? '')} // 사용자가 에디터에 입력할 때마다 실행된다. 현재 active 파일의 코드를 state에 저장 -> onChange말고 저장버튼 클릭 시로 변경 예정
    />
  );
}
