const Footer = () => {
  return (
    <footer
      className="w-full flex justify-between items-end absolute bottom-0 left-0 z-10 pointer-events-none"
      style={{
        padding: '24px 80px',
        fontSize: '18px',
      }}
    >
      {/* 왼쪽 텍스트 */}
      <div className="flex flex-col select-none" style={{ gap: '8px' }}>
        <span style={{ letterSpacing: '-0.8px', lineHeight: '1.1' }}>
          ESCAPE
        </span>
        <span style={{ letterSpacing: '-0.8px', lineHeight: '1.1' }}>
          THE ROOM
        </span>
      </div>

      {/* 오른쪽 텍스트 */}
      <div
        className="flex flex-col items-end select-none"
        style={{ gap: '8px' }}
      >
        <span
          style={{
            letterSpacing: '-0.8px',
            lineHeight: '1.1',
            fontWeight: 'normal',
          }}
        >
          CATCH ERROR
        </span>
        <span
          style={{
            letterSpacing: '-0.8px',
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
