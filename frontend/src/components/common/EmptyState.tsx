// 빈 상태 UI 컴포넌트

interface EmptyStateProps {
  message: string;
}

const EmptyState = ({ message }: EmptyStateProps) => {
  return (
    <div className="flex flex-col justify-center items-center py-20">
      <div className="text-gray-400 text-5xl mb-4">📭</div>
      <div className="text-gray-500">{message}</div>
    </div>
  );
};

export default EmptyState;
