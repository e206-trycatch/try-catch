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
      <div style={{ color: '#888', padding: '20px' }}>파일을 선택해주세요.</div>
    );
  }
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={800}
        hideProgressBar
        transition={Bounce}
        style={{ marginTop: '12px' }}
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
        onMount={(editor) => {
          editor.onKeyDown((e) => {
            const isCopy =
              (e.ctrlKey || e.metaKey) && e.keyCode === monaco.KeyCode.KeyC;

            const isPaste =
              (e.ctrlKey || e.metaKey) && e.keyCode === monaco.KeyCode.KeyV;

            if (isCopy || isPaste) {
              e.preventDefault();
              toast.error('복사 및 붙여넣기를 할 수 없습니다.');
            }
          });

          // 클립보드(윈도우 + V) 클릭해서 붙여넣기 했을 때 막기 위해
          editor.onDidPaste(() => {
            toast.error('복사 및 붙여넣기를 할 수 없습니다.');
          });
        }}
      />
    </>
  );
}
