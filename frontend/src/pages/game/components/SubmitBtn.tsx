import SubmitBtnIcon from '../../../assets/images/icons/submit_icon.png';

type SubmitBtnProps = {
  onClick: () => void;
};

export default function SubmitBtn({ onClick }: SubmitBtnProps) {
  return (
    <button
      className="text-xl p-5 text-white flex gap-3 items-center justify-center cursor-pointer ml-auto rounded-sm transition-transform duration-200 hover:scale-110 active:scale-95"
      onClick={onClick}
      type="button"
    >
      <span>제출</span>
      <span>
        <img src={SubmitBtnIcon} alt="제출" className="w-8" />
      </span>
    </button>
  );
}
