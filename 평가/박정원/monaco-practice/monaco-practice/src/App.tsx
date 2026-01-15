import Editor from "@monaco-editor/react";
import type * as monaco from "monaco-editor";
import { useState } from "react"; // 상태 관리를 위한 useState 훅

function App() {
  // 에디터에 입력된 코드 내용을 저장할 state
  const [code, setCode] = useState<string>("");

  // 에디터 내용이 바뀔 때 마다 실행되는 함수
  function handleEditorChange(
    value: string | undefined, // 현재 에디터 전채 내용(문자열)
    event: monaco.editor.IModelContentChangedEvent // 변경 이벤트 정보(변화 관련 상세 정보)
  ) {
    setCode(value ?? ""); // undefined라면 빈 문자열로 저장
  }

  // 현재 저장되어 있는 code를 alert로 띄우는 함수
  function showInput() {
    alert(code);
  }

  return (
    <div style={{ height: "500px", width: "500px" }}>
      <Editor
        height="100%"
        defaultLanguage="javascript" // 언어 모드 설정 (문법 하이라이팅 + 자동완성 적용)
        defaultValue="// some comment" // 에디터 기본 코드
        theme="vs-dark" // 테마 설정
        options={{ minimap: { enabled: false } }} // 옵션(미니맵 끄기)
        onChange={handleEditorChange} // 에디터 내용이 변경될 때마다 호출되는 함수
      />

      {/* ✅ submit 버튼 클릭하면 showInput 실행 */}
      <button type="submit" onClick={showInput}>Submit</button>
    </div>
  );
}

export default App;
