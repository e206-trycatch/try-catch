const VHSEffect = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* 가로 스캔 라인(오가는 선) */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, #FEFEFE 2px, #FEFEFE 4px)',
          animation: 'scanlines 8s linear infinite',
        }}
      />

      {/* 노이즈 효과 */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          animation: 'noise 0.2s steps(10) infinite',
        }}
      />

      {/* 위아래로 반짝이는 바 */}
      <div
        className="absolute left-0 right-0 h-1 bg-white opacity-20"
        style={{
          top: '20%',
          animation: 'glitch-bar 3s linear infinite',
        }}
      />
      <div
        className="absolute left-0 right-0 h-1 bg-white opacity-20"
        style={{
          top: '60%',
          animation: 'glitch-bar 5s linear infinite reverse',
        }}
      />
    </div>
  );
};

export default VHSEffect;
