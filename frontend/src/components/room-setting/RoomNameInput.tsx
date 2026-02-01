type RoomNameInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  widthClassName?: string;
};

const RoomNameInput = ({
  value,
  onChange,
  placeholder = '방 제목을 입력하세요',
  widthClassName = 'w-[368px]',
}: RoomNameInputProps) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={[
        'text-[#030030] block h-[35px] bg-[#FEFEFE]',
        'border-[2.5px] border-[rgba(3,0,48,0.50)]',
        'px-[15px] py-0 rounded-[5px]',
        'placeholder:text-[#030030] placeholder:opacity-50',
        widthClassName,
      ].join(' ')}
    />
  );
};

export default RoomNameInput;
