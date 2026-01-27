// 에러 메시지 컴포넌트

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return (
    <div className="flex flex-col justify-center items-center py-20">
      <div className="text-red-500 text-lg font-medium mb-2">오류 발생</div>
      <div className="text-gray-600">{message}</div>
    </div>
  );
};

export default ErrorMessage;
