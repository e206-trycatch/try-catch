import { Editor } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { Bounce, toast, ToastContainer } from 'react-toastify';

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
      <div className="w-full h-full text-[#88888} p-5 flex flex-col justify-center items-center blinking-text">
        파일을 선택해주세요
      </div>
    );
  }
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={800}
        hideProgressBar
        transition={Bounce}
        style={{ marginTop: '12px', zIndex: 99999 }}
        newestOnTop
        toastStyle={{
          backgroundColor: '#2d0a0a',
          border: '1px solid #dc2626',
          color: '#fca5a5',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 500,
          padding: '12px 12px',
          minHeight: 'auto',
        }}
      />
      <Editor
        key={activeFile.id}
        width="100%"
        height="100%"
        language={activeFile.language ?? 'javascript'}
        value={code}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 16,
          contextmenu: false,
        }}
        onChange={(f) => onChange(f ?? '')}
        onMount={(editor, monacoInstance) => {
          monacoInstance.editor.defineTheme('transparent-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
              'editor.background': '#1E1E1EB3',
            },
          });
          monacoInstance.editor.setTheme('transparent-dark');

          editor.onKeyDown((e) => {
            const isSave =
              (e.ctrlKey || e.metaKey) && e.keyCode === monaco.KeyCode.KeyS;

            if (isSave) {
              e.preventDefault();
              toast.error('저장 기능을 사용할 수 없습니다.');
            }
          });
        }}
      />
    </>
  );
}
