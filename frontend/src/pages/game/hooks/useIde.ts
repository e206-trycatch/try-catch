// import { arrayMove } from '@dnd-kit/sortable';
import { useMemo, useState } from 'react';

import type { FileNode } from '../types/ideTypes';

function collectIdeData(root: FileNode) {
  const fileCodes: Record<string, string> = {};
  const folderIds = new Set<string>();

  const dfs = (node: FileNode) => {
    if (node.type === 'file') {
      fileCodes[node.id] = node.code ?? '';
      return;
    }

    if (node.type === 'folder') {
      folderIds.add(node.id);
      node.children?.forEach(dfs);
      return;
    }
  };
  dfs(root);
  return { fileCodes, folderIds };
}

export type PanelType = 'primary' | 'secondary';

export function useIde(root: FileNode) {
  // primary 상단 탭 영역에 열려 있는 파일 목록
  const [openTabs, setOpenTabs] = useState<FileNode[]>([]);
  // 파일 탐색기에서 현재 클릭한 파일
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  // 현재 활성화 된 파일이고, 사용자가 타이핑 중인 코드
  const [currentCode, setCurrentCode] = useState('');

  // secondary 상단 탭 영역에 열려 있는 파일 목록
  const [secondaryOpenTabs, setSecondaryOpenTabs] = useState<FileNode[]>([]);
  const [secondaryActiveFileId, setSecondaryActiveFileId] = useState<
    string | null
  >(null);
  const [secondaryCurrentCode, setSecondaryCurrentCode] = useState('');

  // 스플릿 상태
  const [isSplit, setIsSplit] = useState(false);
  const [focusedPane, setFocusedPane] = useState<PanelType>('primary');

  // 파일 탐색기에서 현재 열려 있는 폴더 id(string 타입)들을 저장하는 상태
  // Set을 사용해 중복 없이 폴더 열림 상태를 관리
  // 함수 형태 => 첫 렌더링 때만 Set을 생성하도록 함 (리렌더 시 재생성 방지)
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(['root']),
  );

  // {파일 id : 코드} 형식으로 저장하기 (두 패널이 공유)
  const [fileCodes, setFileCodes] = useState<Record<string, string>>({});

  // root가 변경되면 fileCodes와 expanded를 렌더 중 동기적으로 재설정
  const [prevRoot, setPrevRoot] = useState(root);

  if (root !== prevRoot) {
    setPrevRoot(root);
    const { fileCodes: codes, folderIds } = collectIdeData(root);
    setFileCodes(codes);
    setExpanded(folderIds);
  }

  // 작성중인 코드 저장하는 함수
  const saveCurrentFile = (panel: PanelType = 'primary') => {
    if (panel === 'primary') {
      if (!activeFileId) return;
      setFileCodes((prev) => ({
        ...prev,
        [activeFileId]: currentCode,
      }));
    } else {
      if (!secondaryActiveFileId) return;
      setFileCodes((prev) => ({
        ...prev,
        [secondaryActiveFileId]: secondaryCurrentCode,
      }));
    }
  };

  // 모든 패널의 현재 코드 저장
  const saveAllPanes = () => {
    setFileCodes((prev) => {
      const updates: Record<string, string> = { ...prev };
      if (activeFileId) {
        updates[activeFileId] = currentCode;
      }
      if (secondaryActiveFileId) {
        updates[secondaryActiveFileId] = secondaryCurrentCode;
      }
      return updates;
    });
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
  // 포커스된 패널에 파일 열기
  const openFile = (file: FileNode) => {
    if (file.type !== 'file') return;

    // 스플릿 모드이고 secondary에 포커스된 경우
    if (isSplit && focusedPane === 'secondary') {
      openFileInPane(file, 'secondary');
    } else {
      openFileInPane(file, 'primary');
    }
  };

  // 특정 패널에 파일 열기
  const openFileInPane = (file: FileNode, panel: PanelType) => {
    // 현재 파일의 코드를 저장하고 최신 fileCodes 상태를 로컬 변수로 유지
    const latestFileCodes = { ...fileCodes };

    if (panel === 'primary') {
      if (activeFileId) {
        latestFileCodes[activeFileId] = currentCode;
        setFileCodes(latestFileCodes);
      }

      setOpenTabs((prev) => {
        const exists = prev.some((f) => f.id === file.id);
        if (exists) return prev;
        return [...prev, file];
      });

      setActiveFileId(file.id);
      const code = latestFileCodes[file.id] ?? file.code ?? '';
      setCurrentCode(code);
    } else {
      if (secondaryActiveFileId) {
        latestFileCodes[secondaryActiveFileId] = secondaryCurrentCode;
        setFileCodes(latestFileCodes);
      }

      setSecondaryOpenTabs((prev) => {
        const exists = prev.some((f) => f.id === file.id);
        if (exists) return prev;
        return [...prev, file];
      });

      setSecondaryActiveFileId(file.id);
      const code = latestFileCodes[file.id] ?? file.code ?? '';
      setSecondaryCurrentCode(code);
    }
  };

  const selectTab = (fileId: string, panel: PanelType = 'primary') => {
    if (panel === 'primary') {
      if (fileId === activeFileId) return;

      // 현재 파일의 코드를 저장하고 최신 fileCodes 상태를 로컬 변수로 유지
      const latestFileCodes = { ...fileCodes };
      if (activeFileId) {
        latestFileCodes[activeFileId] = currentCode;
        setFileCodes(latestFileCodes);
      }

      setActiveFileId(fileId);
      const code = latestFileCodes[fileId];
      setCurrentCode(code ?? '');
    } else {
      if (fileId === secondaryActiveFileId) return;

      const latestFileCodes = { ...fileCodes };
      if (secondaryActiveFileId) {
        latestFileCodes[secondaryActiveFileId] = secondaryCurrentCode;
        setFileCodes(latestFileCodes);
      }

      setSecondaryActiveFileId(fileId);
      const code = latestFileCodes[fileId];
      setSecondaryCurrentCode(code ?? '');
    }
  };

  const closeTab = (fileId: string, panel: PanelType = 'primary') => {
    if (panel === 'primary') {
      if (fileId === activeFileId) {
        saveCurrentFile('primary');
      }

      setOpenTabs((prev) => {
        const idx = prev.findIndex((f) => f.id === fileId);
        const newTabs = prev.filter((f) => f.id !== fileId);

        if (activeFileId === fileId) {
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
    } else {
      if (fileId === secondaryActiveFileId) {
        saveCurrentFile('secondary');
      }

      setSecondaryOpenTabs((prev) => {
        const idx = prev.findIndex((f) => f.id === fileId);
        const newTabs = prev.filter((f) => f.id !== fileId);

        if (secondaryActiveFileId === fileId) {
          const nextActive = newTabs[idx - 1] ?? newTabs[idx] ?? null;
          setSecondaryActiveFileId(nextActive?.id ?? null);

          if (nextActive) {
            const code = fileCodes[nextActive.id];
            setSecondaryCurrentCode(code);
          } else {
            setSecondaryCurrentCode('');
          }
        }

        // secondary 탭이 모두 닫히면 자동으로 스플릿 해제
        if (newTabs.length === 0) {
          setIsSplit(false);
          setFocusedPane('primary');
        }

        return newTabs;
      });
    }
  };

  // 현재 선택된 탭의 파일 정보
  // useMemo() : 재런더링 될 때 계산 결과를 캐싱할 수 있게 해준다.
  const activeFile = useMemo(() => {
    if (!activeFileId) return null;
    return openTabs.find((f) => f.id === activeFileId) ?? null;
  }, [activeFileId, openTabs]);

  // secondary 패널의 현재 선택된 탭 파일 정보
  const secondaryActiveFile = useMemo(() => {
    if (!secondaryActiveFileId) return null;
    return (
      secondaryOpenTabs.find((f) => f.id === secondaryActiveFileId) ?? null
    );
  }, [secondaryActiveFileId, secondaryOpenTabs]);

  // 스플릿 토글 (현재 active 파일을 secondary에 복제하여 열기)
  const toggleSplit = () => {
    if (isSplit) {
      // 스플릿 해제: secondary 상태 초기화
      saveCurrentFile('secondary');
      setIsSplit(false);
      setFocusedPane('primary');
      setSecondaryOpenTabs([]);
      setSecondaryActiveFileId(null);
      setSecondaryCurrentCode('');
    } else {
      // 스플릿 활성화: 현재 active 파일을 secondary에도 열기
      setIsSplit(true);
      if (activeFile) {
        setSecondaryOpenTabs([activeFile]);
        setSecondaryActiveFileId(activeFile.id);
        setSecondaryCurrentCode(
          fileCodes[activeFile.id] ?? activeFile.code ?? '',
        );
      }
    }
  };

  const overwriteFileCodes = (updates: Record<string, string>) => {
    setFileCodes((prev) => ({ ...prev, ...updates }));
  };

  return {
    expanded,
    toggleFolder,
    fileCodes,

    // Primary 패널
    openTabs,
    activeFileId,
    activeFile,
    currentCode,
    setCurrentCode,

    // Secondary 패널 (스플릿 모드)
    secondaryOpenTabs,
    secondaryActiveFileId,
    secondaryActiveFile,
    secondaryCurrentCode,
    setSecondaryCurrentCode,

    // 스플릿 상태
    isSplit,
    focusedPane,
    setFocusedPane,
    toggleSplit,

    // 파일 조작
    openFile,
    closeTab,
    selectTab,
    saveCurrentFile,
    saveAllPanes,
    overwriteFileCodes,
  };
}
