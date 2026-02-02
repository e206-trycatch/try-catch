import { useEffect, useMemo, useState } from 'react';

import type { FileNode } from '../types/ideTypes';

function collectFileCodes(root: FileNode): Record<string, string> {
  const result: Record<string, string> = {};

  const dfs = (node: FileNode) => {
    if (node.type === 'file') {
      result[node.id] = node.code ?? '';
      return;
    }
    node.children?.forEach(dfs);
  };
  dfs(root);
  return result;
}

function collectFolderIds(root: FileNode): Set<string> {
  const ids = new Set<string>();

  const dfs = (node: FileNode) => {
    if (node.type === 'folder') {
      ids.add(node.id);
      node.children?.forEach(dfs);
    }
  };
  dfs(root);
  return ids;
}

export function useIde(root: FileNode) {
  // 상단 탭 영역에 열려 있는 파일 목록
  const [openTabs, setOpenTabs] = useState<FileNode[]>([]);
  // 파일 탐색기에서 현재 클릭한 파일
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // 파일 탐색기에서 현재 열려 있는 폴더 id(string 타입)들을 저장하는 상태
  // Set을 사용해 중복 없이 폴더 열림 상태를 관리
  // 함수 형태 => 첫 렌더링 때만 Set을 생성하도록 함 (리렌더 시 재생성 방지)
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(['root']),
  );

  // {파일 id : 코드} 형식으로 저장하기
  const [fileCodes, setFileCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    setFileCodes(collectFileCodes(root));
    setExpanded(collectFolderIds(root));
  }, [root]);

  // 현재 활성화 된 파일이고, 사용자가 타이핑 중인 코드
  const [currentCode, setCurrentCode] = useState('');

  // 작성중인 코드 저장하는 함수
  const saveCurrentFile = () => {
    if (!activeFileId) return;

    setFileCodes((prev) => ({
      ...prev,
      [activeFileId]: currentCode,
    }));
  };

  // 폴더를 클릭했을 때 열고 닫는 기능
  const toggleFolder = (folderId: string) => {
    setExpanded((prev) => {
      // 이전 state를 기반으로 새로운 state 만들기
      const next = new Set(prev); // 기존 Set을 직접 수정하지 않도록 주의할 것! => 복사본 만들기

      // 포함되어 있는 경우 = 열려 있는 폴더
      if (next.has(folderId)) {
        next.delete(folderId);
      }
      // 포함되어 있지 않은 경우
      else {
        next.add(folderId);
      }
      return next;
    });
  };

  // 파일 탐색기에서 파일을 클릭했을 때 실행
  // 1. 탭에 추가
  // 2. 현재 작업 중인 파일로 지정
  const openFile = (file: FileNode) => {
    if (file.type !== 'file') return;

    saveCurrentFile();

    setOpenTabs((prev) => {
      // prev : 현재 열려있는 탭 목록
      // prev 배열 안에 있는 탭 들 중에서 클릭한 파일과 같은 id가 있는지를 체크
      // some() : 배열 내에서 적어도 하나 이상의 요소가 주어진 콜백 함수의 조건을 만족하는지 검사
      const exists = prev.some((f) => f.id === file.id);

      if (exists) return prev;
      return [...prev, file]; // 기존 탭 목록에 새 파일을 추가한 새 배열 반환
    });

    setActiveFileId(file.id); // 클릭한 파일을 현재 작업 중인 파일로 지정하기

    const code = fileCodes[file.id] ?? file.code ?? '';

    if (fileCodes[file.id] === undefined && file.code === undefined) {
      setCurrentCode('');
    }
    setCurrentCode(code);
  };

  const selectTab = (fileId: string) => {
    if (fileId === activeFileId) return;

    saveCurrentFile();

    setActiveFileId(fileId);

    const code = fileCodes[fileId];

    if (code === undefined) {
      setCurrentCode('');
    } else {
      setCurrentCode(code);
    }
  };

  const closeTab = (fileId: string) => {
    if (fileId === activeFileId) {
      saveCurrentFile();
    }

    setOpenTabs((prev) => {
      const idx = prev.findIndex((f) => f.id === fileId); // 닫으려는 탭의 index 찾기

      // 닫을 탭을 제거한 새로운 배열 생성
      const newTabs = prev.filter((f) => f.id !== fileId);

      // 현재 켜진 파일을 닫았으면 탭 변경이 생김
      if (activeFileId === fileId) {
        // 닫은 탭 기준 왼쪽 탭 -> 없으면 오른쪽 탭 -> 없으면 null
        const nextActive = newTabs[idx - 1] ?? newTabs[idx] ?? null;
        setActiveFileId(nextActive?.id ?? null);

        if (nextActive) {
          const code = fileCodes[nextActive.id];
          setCurrentCode(code);
        } else {
          setCurrentCode('');
        }
      }

      return newTabs;
    });
  };

  // 현재 선택된 탭의 파일 정보
  // useMemo() : 재런더링 될 때 계산 결과를 캐싱할 수 있게 해준다.
  const activeFile = useMemo(() => {
    if (!activeFileId) return null;
    return openTabs.find((f) => f.id === activeFileId) ?? null; // 열려있는 탭 들 중에서 활성화된 파일 찾기
  }, [activeFileId, openTabs]); // activeFileId나 openTabs가 바뀔 때마다 실행하기

  return {
    expanded,
    toggleFolder,
    fileCodes,

    openTabs,
    activeFileId,
    openFile,
    closeTab,
    selectTab,

    activeFile,
    currentCode,
    setCurrentCode,
    saveCurrentFile,
  };
}
