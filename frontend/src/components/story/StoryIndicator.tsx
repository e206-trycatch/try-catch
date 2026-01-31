interface StoryIndicatorProps {
  total: number;
  current: number;
}

const StoryIndicator = ({ total, current }: StoryIndicatorProps) => {
  if (total <= 1) return null;

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
            index === current
              ? 'bg-white scale-110'
              : 'bg-white/40 hover:bg-white/60'
          }`}
        />
      ))}
    </div>
  );
};

export default StoryIndicator;
