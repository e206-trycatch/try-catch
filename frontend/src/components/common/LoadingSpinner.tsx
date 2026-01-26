// 로딩 스피너 컴포넌트

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;
