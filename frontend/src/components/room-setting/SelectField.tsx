// select 공통 스타일 + 옵션 렌더
type Option<T extends string = string> = { label: string; value: T };

type SelectFieldProps<T extends string = string> = {
  value: T | '';
  onChange: (value: T) => void;
  options: Option<T>[];
  widthClassName?: string; // 예: "w-[140px]"
  placeholder?: string; // 기본 옵션 텍스트
};

const SelectField = <T extends string = string>({
  value,
  onChange,
  options,
  widthClassName = 'w-[140px]',
  placeholder = '선택해주세요',
}: SelectFieldProps<T>) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={[
        'text-[#030030] block h-[35px] bg-[#FEFEFE]',
        'border-[2.5px] border-[rgba(3,0,48,0.50)]',
        'px-2.5 py-0 leading-[35px] rounded-[5px]',
        widthClassName,
      ].join(' ')}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default SelectField;
