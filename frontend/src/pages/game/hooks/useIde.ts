import { useState } from 'react';

import type { FileNode } from '../types/ideTypes';

const collectIdeData = (root: FileNode) => {
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
};

export type PanelType = 'primary' | 'secondary';

export function useIde(root: FileNode) {
  // primary 상단 탭 영역에 열려 있는 파일 목록
  const [openTabs, setOpenTabs] = useState<FileNode[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [currentCode, setCurrentCode] = useState('');

  // secondary 상단 탭 영역에 열려 있는 파일 목록
  const [secondaryOpenTabs, setSecondaryOpenTabs] = useState<FileNode[]>([]);
  const [secondaryActiveFileId, setSecondaryActiveFileId] = useState<
    string | null
  >(null);
  const [secondaryCurrentCode, setSecondaryCurrentCode] = useState('');

  // 스플릿 상태
  const [isSplit, setIsSplit] = useState(false);
  const [focusedPanel, setFocusedPanel] = useState<PanelType>('primary');

  // 파일 탐색기에서 현재 열려 있는 폴더 id를 저장하는 상태
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(['root']),
  );

  // {파일 id : 코드} 형식으로 저장하기 (두 패널이 공유)
  const [fileCodes, setFileCodes] = useState<Record<string, string>>({});

  // 패널별 상태 접근자
  const getPanel = (panel: PanelType) => {
    if (panel === 'primary') {
      return {
        activeFileId,
        currentCode,
        openTabs,
        setActiveFileId,
        setCurrentCode,
        setOpenTabs,
      };
    }
    return {
      activeFileId: secondaryActiveFileId,
      currentCode: secondaryCurrentCode,
      openTabs: secondaryOpenTabs,
      setActiveFileId: setSecondaryActiveFileId,
      setCurrentCode: setSecondaryCurrentCode,
      setOpenTabs: setSecondaryOpenTabs,
    };
  };

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
    const panelState = getPanel(panel);
    if (!panelState.activeFileId) return;
    setFileCodes((prev) => ({
      ...prev,
      [panelState.activeFileId!]: panelState.currentCode,
    }));
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
    if (isSplit && focusedPanel === 'secondary') {
      openFileInPanel(file, 'secondary');
    } else {
      openFileInPanel(file, 'primary');
    }
  };

  // 파일 탐색기에서 클릭
  const openFileInPanel = (file: FileNode, panel: PanelType) => {
    const panelState = getPanel(panel);
    const latestFileCodes = { ...fileCodes };

    if (panelState.activeFileId) {
      latestFileCodes[panelState.activeFileId] = panelState.currentCode;
      setFileCodes(latestFileCodes);
    }

    panelState.setOpenTabs((prev) => {
      const exists = prev.some((f) => f.id === file.id);
      if (exists) return prev;
      return [...prev, file];
    });

    panelState.setActiveFileId(file.id);
    const code = latestFileCodes[file.id] ?? file.code ?? '';
    panelState.setCurrentCode(code);
  };

  // 이미 열린 탭 클릭
  const selectTab = (fileId: string, panel: PanelType = 'primary') => {
    const panelState = getPanel(panel);
    if (fileId === panelState.activeFileId) return;

    const latestFileCodes = { ...fileCodes };
    if (panelState.activeFileId) {
      latestFileCodes[panelState.activeFileId] = panelState.currentCode;
      setFileCodes(latestFileCodes);
    }

    panelState.setActiveFileId(fileId);
    const code = latestFileCodes[fileId];
    panelState.setCurrentCode(code ?? '');
  };

  const closeTab = (fileId: string, panel: PanelType = 'primary') => {
    const panelState = getPanel(panel);

    if (fileId === panelState.activeFileId) {
      saveCurrentFile(panel);
    }

    panelState.setOpenTabs((prev) => {
      const idx = prev.findIndex((f) => f.id === fileId);
      const newTabs = prev.filter((f) => f.id !== fileId);

      if (panelState.activeFileId === fileId) {
        const nextActive = newTabs[idx - 1] ?? newTabs[idx] ?? null;
        panelState.setActiveFileId(nextActive?.id ?? null);

        if (nextActive) {
          const code = fileCodes[nextActive.id];
          panelState.setCurrentCode(code);
        } else {
          panelState.setCurrentCode('');
        }
      }

      // secondary 탭이 모두 닫힌 경우
      if (panel === 'secondary' && newTabs.length === 0) {
        setIsSplit(false);
        setFocusedPanel('primary');
      }

      return newTabs;
    });
  };

  // 현재 선택된 탭의 파일 정보
  const activeFile = openTabs.find((f) => f.id === activeFileId) ?? null;

  // secondary 패널의 현재 선택된 탭 파일 정보
  const secondaryActiveFile =
    secondaryOpenTabs.find((f) => f.id === secondaryActiveFileId) ?? null;

  // 스플릿 토글 (현재 active 파일을 secondary에 복제하여 열기)
  const toggleSplit = () => {
    if (isSplit) {
      // 스플릿 해제: secondary 상태 초기화
      saveCurrentFile('secondary');
      setIsSplit(false);
      setFocusedPanel('primary');
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
    focusedPanel,
    setFocusedPanel,
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
