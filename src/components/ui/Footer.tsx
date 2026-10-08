import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-neutral)',
        backgroundColor: 'var(--surface-panel)',
        padding: 'var(--space-6) var(--space-4)',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          textAlign: 'center',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--ink-muted)',
          lineHeight: 1.5,
        }}
      >
        Bug Hunt Arena. Code and puzzles run locally in your browser. No trackers. Privacy first.
      </div>
    </footer>
  );
};
