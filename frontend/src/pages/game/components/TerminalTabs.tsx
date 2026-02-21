import terminalIcon from '../../../assets/images/icons/terminal_icon.svg';

type Props = {
  activeTab: 'Frontend' | 'Backend';
  onChangeTab: (tab: 'Frontend' | 'Backend') => void;
};

export default function TerminalTabs({ activeTab, onChangeTab }: Props) {
  return (
    <div className="flex bg-stone-900 px-4 py-1 border-b border-gray-700">
      <div className="flex justify-center items-center gap-2 mr-5">
        <img
          src={terminalIcon}
          alt="터미널"
          width={24}
          height={24}
          className="w-6 h-6"
        />
        <span className="text-white text-base font-normal font-['Umdot_11'] leading-4">
          Terminal
        </span>
      </div>
      <button
        className={`px-4 py-2 ${activeTab === 'Frontend' ? 'bg-black text-white' : 'text-gray-400'}`}
        onClick={() => onChangeTab('Frontend')}
      >
        Frontend
      </button>
      <button
        className={`px-4 py-2 ${activeTab === 'Backend' ? 'bg-black text-white' : 'text-gray-400'}`}
        onClick={() => onChangeTab('Backend')}
      >
        Backend
      </button>
    </div>
  );
}
