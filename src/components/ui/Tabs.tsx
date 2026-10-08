import React, { useRef } from 'react';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  ariaLabel: string;
  className?: string;
  variant?: 'underline' | 'pill';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  ariaLabel,
  className = '',
  variant = 'underline',
}) => {
  const tablistRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabs.length;
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
      e.preventDefault();
    } else if (e.key === 'Home') {
      nextIndex = 0;
      e.preventDefault();
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1;
      e.preventDefault();
    }

    if (nextIndex !== index) {
      onChange(tabs[nextIndex].id);
      const buttons = tablistRef.current?.querySelectorAll<HTMLButtonElement>('button[role="tab"]');
      buttons?.[nextIndex]?.focus();
    }
  };

  const isUnderline = variant === 'underline';

  return (
    <div
      ref={tablistRef}
      role="tablist"
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: isUnderline ? 'var(--space-4)' : 'var(--space-1)',
        borderBottom: isUnderline ? '1px solid var(--border-neutral)' : 'none',
        overflowX: 'auto',
      }}
      className={`ui-tabs ${className}`}
    >
      {tabs.map((tab, idx) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
              padding: isUnderline ? '0.625rem 0.25rem' : '0.375rem 0.75rem',
              border: isUnderline ? 'none' : '1px solid',
              borderColor: isUnderline
                ? 'transparent'
                : isActive
                ? 'var(--ink)'
                : 'transparent',
              borderBottom: isUnderline
                ? `2px solid ${isActive ? 'var(--ink)' : 'transparent'}`
                : undefined,
              borderRadius: isUnderline ? 0 : 'var(--radius-md)',
              backgroundColor: !isUnderline && isActive ? 'var(--ink)' : 'transparent',
              color: !isUnderline && isActive
                ? 'var(--surface-panel)'
                : isActive
                ? 'var(--ink)'
                : 'var(--ink-muted)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: isActive ? 600 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              marginBottom: isUnderline ? '-1px' : 0,
              transition: 'all 120ms ease',
            }}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                style={{
                  fontSize: 'var(--text-caption)',
                  fontFamily: 'var(--font-mono)',
                  padding: '1px 5px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: !isUnderline && isActive
                    ? 'var(--surface-panel)'
                    : 'var(--surface-highlight)',
                  color: !isUnderline && isActive ? 'var(--ink)' : 'var(--ink)',
                  fontWeight: 600,
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
