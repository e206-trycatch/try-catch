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
      <div style={{ color: '#888', padding: '20px' }}>파일을 선택해주세요.</div>
    );
  }
  return (
    // div에 연결 -> 화면에 렌더링 될 때 자동으로 요소를 넣어준다.
    <Editor
      key={activeFile.id}
      width="100%"
      height="100%"
      language={activeFile.language ?? 'javascript'} // 활성화 된 파일이 있고, 언어가 있다면 그 값 쓰기
      value={code} // 에디터에 표시되는 텍스트
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 16,
        contextmenu: false, // 우클릭 메뉴 제거
      }}
      onChange={(f) => onChange(f ?? '')}
      // 복사 + 붙여넣기 방지
      onMount={(editor) => {
        editor.onKeyDown((e) => {
          // 윈도우 ctrl, 맥 command
          // e.code = 내가 어떤 키를 눌렀는지 나타내는 값
          if ((e.ctrlKey || e.metaKey) && ['KeyC', 'KeyV'].includes(e.code)) {
            e.preventDefault();
          }
        });
      }}
    />
  );
}
