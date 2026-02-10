import { toast } from 'react-toastify';

interface SubmitConfirmToastProps {
  toastId: string;
  onConfirm: () => void;
}

export default function SubmitConfirmToast({
  toastId,
  onConfirm,
}: SubmitConfirmToastProps) {
  return (
    <div className="flex flex-1 gap-5 items-center justify-between">
      <div>정말 제출하시겠습니까?</div>
      <div className="flex gap-2">
        <button
          type="button"
          className="flex justify-center items-center bg-red-600 text-white px-4 py-[7px] rounded text-sm hover:bg-red-700"
          onClick={() => {
            toast.dismiss(toastId);
            onConfirm();
          }}
        >
          제출
        </button>
        <button
          type="button"
          className="flex justify-center items-center bg-red-900/50 text-red-200 px-4 py-[7px] rounded text-sm hover:bg-red-900/70 border border-red-700"
          onClick={() => toast.dismiss(toastId)}
        >
          취소
        </button>
      </div>
    </div>
  );
}
