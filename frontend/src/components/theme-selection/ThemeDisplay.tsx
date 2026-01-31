// ThemeDisplay.tsx
// - 테마 표시 박스
type ThemeDisplayProps = {
  themeName: string;
};

const ThemeDisplay = ({ themeName }: ThemeDisplayProps) => {
  return (
    <div className="flex w-[368px] h-[35px] items-center gap-2.5 [background:#FEFEFE] px-2.5 py-1 border-[2.5px] border-solid border-[rgba(3,0,48,0.50)]">
      <span className="text-[#030030]/60 text-[16px]">{themeName}</span>
    </div>
  );
};

export default ThemeDisplay;
