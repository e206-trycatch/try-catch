import SubmitBgIcon from '../../../assets/images/buttons/code_submit_btn.png';

type SubmitBtnProps = {
  onClick: () => void;
};

export default function SubmitBtn({ onClick }: SubmitBtnProps) {
  return (
    <button
      className="w-[200px] h-[60px] bg-center bg-no-repeat cursor-pointer text-black"
      onClick={onClick}
      style={{
        backgroundImage: `url(${SubmitBgIcon})`,
        position: 'absolute',
        zIndex: '99',
      }}
      type="button"
    >
      제출
    </button>
  );
}
