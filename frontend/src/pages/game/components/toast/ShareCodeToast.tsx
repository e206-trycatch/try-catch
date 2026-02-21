import { toast } from 'react-toastify';

interface ShareCodeToastProps {
  nickname: string;
  toastId: string;
  onLoad: () => void;
}

export default function ShareCodeToast({
  nickname,
  toastId,
  onLoad,
}: ShareCodeToastProps) {
  return (
    <div className="flex flex-1 gap-5 items-center justify-between">
      <div>{nickname}님이 코드를 공유했습니다.</div>
      <div className="flex gap-2">
        <button
          type="button"
          className="flex justify-center items-center bg-red-600 text-white px-4 py-[7px] rounded text-sm hover:bg-red-700"
          onClick={() => {
            onLoad();
            toast.dismiss(toastId);
          }}
        >
          불러오기
        </button>
      </div>
    </div>
  );
}
