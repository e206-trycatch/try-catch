import SubmitBgIcon from '../../../assets/images/buttons/code_submit_btn.png';

type SubmitBtnProps = {
  onClick: () => void;
};

export default function SubmitBtn({ onClick }: SubmitBtnProps) {
  return (
    <button
      className="w-[95px] h-[45px] bg-center bg-no-repeat cursor-pointer text-black ml-auto"
      onClick={onClick}
      style={{
        backgroundImage: `url(${SubmitBgIcon})`,
      }}
      type="button"
    >
      제출
    </button>
  );
}
