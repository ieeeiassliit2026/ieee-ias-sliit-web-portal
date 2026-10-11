import React from 'react';

export default function Loader({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <ul className="loader">
        <li className="ball" />
        <li className="ball" />
        <li className="ball" />
      </ul>
      {text && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{text}</p>}
    </div>
  );
}
