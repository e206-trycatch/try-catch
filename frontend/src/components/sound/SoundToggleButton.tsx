import soundOffIcon from '../../assets/images/icons/soundoff_icon.png';
import soundOnIcon from '../../assets/images/icons/soundon_icon.png';
import { useSoundStore } from '../../stores/useSoundStore';

interface SoundToggleButtonProps {
  className?: string;
}

const SoundToggleButton = ({ className = '' }: SoundToggleButtonProps) => {
  const { isMuted, toggleMute } = useSoundStore();

  return (
    <button
      onClick={toggleMute}
      className={`flex items-center gap-1 hover:text-gray-300 transition-colors ${className}`}
      aria-label={isMuted ? '음소거 해제' : '음소거'}
    >
      <img
        src={isMuted ? soundOffIcon : soundOnIcon}
        alt={isMuted ? 'Sound Off' : 'Sound On'}
        className="w-6 h-6"
      />
      <span>{isMuted ? 'OFF' : 'ON'}</span>
    </button>
  );
};

export default SoundToggleButton;
