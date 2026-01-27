import { Editor } from '@monaco-editor/react';
import { useEffect, useRef } from 'react';

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
  // DOM을 직접 조작하기 위해 ref 사용
  // div를 직접 조작할 수 있도록 참조를 하나 만들겠다는 의미
  const editorWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 컴포넌트 처음 나타날 때
    const wrapper = editorWrapperRef.current;
    if (!wrapper) return;

    // 키보드 복붙 막기
    const keyboardInput = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'C', 'V'].includes(e.key)) {
        e.preventDefault();
      }
    };

    // 마우스/브라우저 복붙 막기 (모든 기본 동작 막기)
    const prevent = (e: Event) => e.preventDefault();

    wrapper.addEventListener('keydown', keyboardInput);
    wrapper.addEventListener('copy', prevent);
    wrapper.addEventListener('paste', prevent);

    // 	컴포넌트 사라질 때 = 다른 페이지로 이동
    return () => {
      wrapper.removeEventListener('keydown', keyboardInput);
      wrapper.removeEventListener('copy', prevent);
      wrapper.removeEventListener('paste', prevent);
    };
  }, []);

  if (!activeFile) {
    return (
      <div style={{ color: '#888', padding: '20px' }}>파일을 선택해주세요.</div>
    );
  }
  return (
    // div에 연결 -> 화면에 렌더링 될 때 자동으로 요소를 넣어준다.
    <div ref={editorWrapperRef}>
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
    </div>
  );
}
