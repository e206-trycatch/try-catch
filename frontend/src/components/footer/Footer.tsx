const Footer = () => {
  return (
    <footer
      className="w-full flex justify-between items-end fixed bottom-0 left-0 z-10 pointer-events-none"
      style={{
        padding: '2vw 3vw',
        fontSize: '1.1vw', // 18px -> 1.1vm
      }}
    >
      {/* 왼쪽 텍스트 */}
      <div className="flex flex-col select-none" style={{ gap: '0.4vw' }}>
        <span style={{ letterSpacing: '-0.05vw', lineHeight: '1.1' }}>
          ESCAPE
        </span>
        <span style={{ letterSpacing: '-0.05vw', lineHeight: '1.1' }}>
          THE ROOM
        </span>
      </div>

      {/* 오른쪽 텍스트 */}
      <div
        className="flex flex-col items-end select-none"
        style={{ gap: '0.4vw' }}
      >
        <span
          style={{
            letterSpacing: '-0.05vw',
            lineHeight: '1.1',
            fontWeight: 'normal',
          }}
        >
          CATCH ERROR
        </span>
        <span
          style={{
            letterSpacing: '-0.05vw',
            lineHeight: '1.1',
            fontWeight: 'normal',
          }}
        >
          IF YOU CAN
        </span>
      </div>
    </footer>
  );
};

export default Footer;
