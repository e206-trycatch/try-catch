import { useEffect, useRef, useState } from 'react';

import { HINT_INFO_MESSAGES } from './hintInfoMessages';

export default function HintInfoTooltip() {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={tooltipRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-center w-5 h-5 rounded-full border border-gray-500 text-gray-400 hover:text-gray-200 hover:border-gray-300 transition-colors text-xs leading-none"
      >
        i
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 w-64 rounded-lg bg-stone-800 border border-stone-600 p-3 shadow-xl z-10">
          <p className="text-amber-400 font-semibold text-xs mb-2">
            AI 힌트 안내
          </p>
          <ul className="space-y-1.5">
            {HINT_INFO_MESSAGES.map((msg) => (
              <li
                key={msg}
                className="flex items-start gap-1.5 text-xs text-gray-300"
              >
                <span className="text-amber-500 shrink-0 leading-none">•</span>
                <span>{msg}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
