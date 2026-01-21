import { useStore } from '../../stores/useStore';

const HomePage = () => {
  const { count, increase } = useStore();

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-purple-600">Welcome!</h2>

        <div className="p-4 border border-gray-300 rounded-lg bg-yello shadow-sm w-fit">
          <p className="mb-2">
            Zustand test: <strong>{count}</strong>
          </p>
          <button
            onClick={increase}
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            + 1
          </button>
        </div>
      </div>
    </>
  );
};

export default HomePage;
