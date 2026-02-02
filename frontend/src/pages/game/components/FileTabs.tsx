import CodeFileIcon from '../../../assets/images/icons/code_file_icon.svg';
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
    <div className="flex shrink-0 border border-[#333] bg-stone-900 items-stretch">
      <div className="flex overflow-x-auto overflow-y-hidden w-full scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {openTabs.map((tab) => {
          // 현재 순회 중인 탭의 id와 현재 활성화 된 파일의 id가 같으면 true
          const active = tab.id === activeFileId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`p-2 flex items-center gap-2 px-3 cursor-pointer border-r border-[#333]
                ${active ? 'bg-white/10 text-amber-300' : 'bg-transparent text-gray-400'}
            `}
            >
              <img src={CodeFileIcon} alt="코드파일" className="w-4 mr-1" />
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                {tab.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // 클릭 이벤트가 부모로 전파되는 것을 막음
                  onCloseTab(tab.id);
                }}
                className="ml-auto bg-transparent border-none text-gray-400 hover:text-white pl-5 text-base cursor-pointer"
                aria-label={`${tab.id} 탭 닫기`}
              >
                x
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
