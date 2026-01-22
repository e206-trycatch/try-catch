const Footer = () => {
  return (
    <footer className="w-full flex justify-between items-end px-12 py-8 text-white absolute bottom-0 left-0 z-10 pointer-events-none">
      {/* 왼쪽 텍스트 */}
      <div className="flex flex-col gap-1.5 select-none">
        <span className="tracking-[-0.8px] -webkit-text-stroke-width:0.5px text-lg leading-4">
          ESCAPE
        </span>
        <span className="tracking-[-0.8px] -webkit-text-stroke-width:0.5px text-lg leading-4">
          THE ROOM
        </span>
      </div>
      {/* 오른쪽 텍스트 */}
      <div className="flex flex-col items-end gap-1.5 select-none">
        <span className="tracking-[-0.8px] -webkit-text-stroke-width:0.5px text-lg font-normal leading-4">
          CATCH ERROR
        </span>
        <span className="tracking-[-0.8px] -webkit-text-stroke-width:0.5px text-lg font-normal leading-4">
          IF YOU CAN
        </span>
      </div>
    </footer>
  );
};

export default Footer;
