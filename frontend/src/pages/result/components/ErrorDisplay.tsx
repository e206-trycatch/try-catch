// 에러 표시 컴포넌트
interface Props {
  title: string;
  message: string;
  buttonText: string;
  onClick: () => void;
}

const ErrorDisplay = ({ title, message, buttonText, onClick }: Props) => {
  return (
    <div className="flex flex-col justify-center items-center h-screen gap-4">
      <p className="text-red-500">{title}</p>
      <p className="text-gray-400">{message}</p>
      <button
        onClick={onClick}
        className="px-6 py-3 border border-white text-white"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default ErrorDisplay;
