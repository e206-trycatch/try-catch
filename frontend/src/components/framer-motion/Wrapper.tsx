import React from 'react';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full animate-[fadeIn_1.5s_ease-in-out]">{children}</div>
  );
};

export default Wrapper;
