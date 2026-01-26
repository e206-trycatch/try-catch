// select 공통 스타일 + 옵션 렌더
type Option = { label: string; value: string };

type SelectFieldProps = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  widthClassName?: string; // 예: "w-[140px]"
};

const SelectField = ({
  value,
  onChange,
  options,
  widthClassName = 'w-[140px]',
}: SelectFieldProps) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={[
        'text-[#030030] block h-[35px] bg-[#FEFEFE]',
        'border-[2.5px] border-[rgba(3,0,48,0.50)]',
        'px-2.5 py-0 leading-[35px] rounded-[5px]',
        widthClassName,
      ].join(' ')}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default SelectField;
