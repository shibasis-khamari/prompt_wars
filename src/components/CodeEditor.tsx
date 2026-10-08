import React, { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
export interface CodeEditorProps {
  value: string;
  language?: 'javascript' | 'python';
  onChange?: (value: string) => void;
  readOnly?: boolean;
  ariaLabel?: string;
}

const diagnosticEditorTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--surface-panel)',
    color: 'var(--ink)',
    fontFamily: 'var(--font-mono)',
  },
  '.cm-content': {
    caretColor: 'var(--ink)',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--ink)',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'var(--surface-highlight)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--surface)',
    color: 'var(--ink-muted)',
    borderRight: '1px solid var(--border-neutral)',
  },
  '.cm-activeLine': {
    backgroundColor: 'var(--surface-highlight)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'var(--surface-highlight)',
  },
});

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  language = 'javascript',
  onChange,
  readOnly = false,
  ariaLabel = 'Code editor',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && onChange && !isUpdatingRef.current) {
        onChange(update.state.doc.toString());
      }
    });

    const langExtension = language === 'python' ? python() : javascript({ typescript: false });

    const startState = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        langExtension,
        diagnosticEditorTheme,
        keymap.of([...defaultKeymap, ...historyKeymap]),
        updateListener,
        EditorState.readOnly.of(readOnly),
        EditorView.contentAttributes.of({
          'aria-label': ariaLabel,
          role: 'textbox',
          tabindex: '0',
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [language]); // Recreate if language changes

  // Update editor content when `value` prop changes externally
  useEffect(() => {
    const view = viewRef.current;
    if (view && value !== view.state.doc.toString()) {
      isUpdatingRef.current = true;
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      });
      isUpdatingRef.current = false;
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className="code-editor-container overflow-hidden"
      style={{
        minHeight: '220px',
        fontSize: '14px',
        backgroundColor: 'var(--surface-panel)',
        border: '1px solid var(--border-neutral)',
        borderRadius: 'var(--radius-md)',
      }}
    />
  );
};
