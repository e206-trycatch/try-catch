import type { FileNode } from '../types/ideTypes';

type Props = {
  openTabs: FileNode[];
  activeFileId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
};

export default function FileTabs({
  openTabs,
  activeFileId,
  onSelectTab,
  onCloseTab,
}: Props) {
  return (
    <div className="h-12 flex border-b border-[#333] overflow-x-auto bg-stone-900">
      {openTabs.map((tab) => {
        // 현재 순회 중인 탭의 id와 현재 활성화 된 파일의 id가 같으면 true
        const active = tab.id === activeFileId;

        return (
          <div
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`min-w-[180px] flex items-center gap-2 px-3 cursor-pointer border-r border-[#333] 
              ${active ? 'bg-white/10 text-white' : 'bg-transparent text-gray-400'}
    `}
          >
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
              {tab.name}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation(); // 클릭 이벤트가 부모로 전파되는 것을 막음
                onCloseTab(tab.id);
              }}
              className="ml-auto bg-transparent border-none text-gray-400 hover:text-white text-base cursor-pointer"
            >
              x
            </button>
          </div>
        );
      })}
    </div>
  );
}
