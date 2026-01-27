import { useNavigate } from 'react-router-dom';
import VHSEffect from '../../components/effects/VHSEffect';
import VHSStyles from '../../components/effects/VHSStyles';
import { useStore } from '../../stores/useStore';

const logoText = 'try - catch!';
const charCount = logoText.length;
const typingDuration = 0.1;
const displayTime = 2;
const totalCycle = charCount * typingDuration * 2 + displayTime;

const HomePage = () => {
  const navigate = useNavigate();
  const isLogin = useStore((state) => state.isLogin);

  const handleStartClick = () => {
    if (isLogin) {
      navigate('/selection/mode');
    } else {
      navigate('/login');
    }
  };

  const generateKeyframes = (charIndex: number, reverseIndex: number) => {
    const typeInStart = ((charIndex * typingDuration) / totalCycle) * 100;
    const typeInEnd = typeInStart + (typingDuration / totalCycle) * 100;
    const typeOutStart =
      ((charCount * typingDuration +
        displayTime +
        reverseIndex * typingDuration) /
        totalCycle) *
      100;
    const typeOutEnd = typeOutStart + (typingDuration / totalCycle) * 100;

    return `
      @keyframes typeChar${charIndex} {
        0%, ${typeInStart}% { opacity: 0; }
        ${typeInEnd}%, ${typeOutStart}% { opacity: 1; }
        ${typeOutEnd}%, 100% { opacity: 0; }
      }
    `;
  };

  return (
    <div className="fixed inset-0 overflow-hidden flex items-center justify-center">
      <VHSEffect />

      <style>
        {logoText
          .split('')
          .map((_, index) => generateKeyframes(index, charCount - index - 1))
          .join('')}
      </style>

      <div className="flex flex-col items-center gap-8 relative z-10">
        <div
          className="typing-text text-[90px] font-bold tracking-wide"
          style={{
            color: '#FEFEFE',
            textShadow: '0 0 10px rgba(254, 254, 254, 0.5)',
          }}
        >
          {logoText.split('').map((char, index) => (
            <span
              key={index}
              className="char"
              style={{
                animation: `typeChar${index} ${totalCycle}s infinite`,
              }}
            >
              {char}
            </span>
          ))}
        </div>

        <button
          className="relative px-8 py-4 hover:opacity-80 transition-opacity duration-200 pixel-button text-2xl font-semibold"
          style={{
            backgroundColor: '#FEFEFE',
            color: '#040040',
            clipPath:
              'polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))',
          }}
          onClick={handleStartClick}
        >
          Start
        </button>
      </div>

      <div
        className="absolute text-4xl"
        style={{
          color: '#FEFEFE',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        &gt;
      </div>

      <VHSStyles />
    </div>
  );
};

export default HomePage;
