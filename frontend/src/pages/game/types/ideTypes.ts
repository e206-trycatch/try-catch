export type NodeType = 'folder' | 'file';
export type CodeRole = 'FRONTEND' | 'BACKEND' | null;
export type TimerStatus = 'RUNNING' | 'EXPIRED' | null;

export interface QuestFile {
  fileId: number; // 파일 고유 id
  filePath: string; // 파일 경로
  codeRole: CodeRole; // 역할
  fileType: string; // 파일 타입
  code: string; // 파일 코드
}

export interface QuestInfo {
  problemFrameworkId: number;
  frontendErrorLog: string;
  backendErrorLog: string;
  myPosition?: CodeRole;

  files: QuestFile[];
}

// 파일/폴더 트리 구조 타입 정의
export interface FileNode {
  // 트리를 관리하기 위한 id
  // 예시) file:6
  id: string;
  name: string; // 화면에 보여줄 이름
  type: NodeType; // 노드 타입
  path: string; // 전체 경로
  role: CodeRole;

  // node가 file일 때만 존재하는 값들
  fileId?: number;
  language?: string; // Monaco editor에서 language로 쓰기 위한 값
  fileType?: string;
  code?: string;

  // node가 folder일 때만 존재하는 값들
  // 자식 노드 목록
  // 폴더 안에 폴더나 파일이 중첩될 수 있으므로 FileNode를 재귀적으로 사용한다.
  children?: FileNode[];
}
