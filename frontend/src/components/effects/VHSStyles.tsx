const VHSStyles = () => {
  return (
    <style>{`
      @keyframes scanlines {
        0% { transform: translateY(0); }
        100% { transform: translateY(10px); }
      }

      @keyframes noise {
        0%, 100% { opacity: 0.05; }
        10% { opacity: 0.08; }
        20% { opacity: 0.03; }
        30% { opacity: 0.09; }
        40% { opacity: 0.04; }
        50% { opacity: 0.07; }
        60% { opacity: 0.05; }
        70% { opacity: 0.06; }
        80% { opacity: 0.04; }
        90% { opacity: 0.08; }
      }

      @keyframes typeInOut {
        0% { opacity: 0; }
        2% { opacity: 1; }
        40% { opacity: 1; }
        42% { opacity: 0; }
        100% { opacity: 0; }
      }

      @keyframes blink-caret {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
      }

      @keyframes glitch-bar {
        0% { 
          transform: translateY(0) scaleX(1);
          opacity: 0.2;
        }
        10% { 
          transform: translateY(50vh) scaleX(1.5);
          opacity: 0.3;
        }
        20% { 
          transform: translateY(100vh) scaleX(1);
          opacity: 0.2;
        }
        21% {
          transform: translateY(-100vh) scaleX(1);
          opacity: 0;
        }
        100% { 
          transform: translateY(0) scaleX(1);
          opacity: 0.2;
        }
      }

      @keyframes cursor-blink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
      }

      @keyframes revealChar {
        to { max-width: 100%; }
      }

      @keyframes typing {
        from {
          max-width: 0;
        }
        to {
          max-width: 100%;
        }
      }

      @keyframes blink {
        50% {
          border-color: transparent;
        }
      }

      .typing-text {
        display: inline-block;
        white-space: nowrap;
        position: relative;
      }

      .typing-text .char {
        display: inline-block;
        opacity: 0;
      }

      .typing-cursor {
        display: inline-block;
        width: 4px;
        height: 1em;
        background-color: #FEFEFE;
        margin-left: 2px;
        animation: blink-caret 0.75s step-end infinite;
        animation-delay: calc(var(--total-chars) * 0.1s);
      }


      input::placeholder {
        color: rgba(254, 254, 254, 0.5);
      }
    `}</style>
  );
};

export default VHSStyles;
