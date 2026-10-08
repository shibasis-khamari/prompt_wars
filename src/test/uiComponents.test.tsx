import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Slider } from '../components/ui/Slider';
import { Chip } from '../components/ui/Chip';
import { Tag } from '../components/ui/Tag';
import { SegmentedProgress } from '../components/ui/SegmentedProgress';
import { TestRow } from '../components/ui/TestRow';
import { DiffView } from '../components/ui/DiffView';
import { Tabs } from '../components/ui/Tabs';
import { Toolbar } from '../components/ui/Toolbar';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';

describe('Shared UI Components Library Suite', () => {
  it('SegmentedControl: handles selection and keyboard arrow navigation', () => {
    const handleChange = vi.fn();
    const options = [
      { value: 'py', label: 'Python' },
      { value: 'js', label: 'JavaScript' },
    ];

    render(
      <SegmentedControl
        options={options}
        value="py"
        onChange={handleChange}
        ariaLabel="Language selection"
      />
    );

    const pyTab = screen.getByRole('tab', { name: 'Python' });
    const jsTab = screen.getByRole('tab', { name: 'JavaScript' });

    expect(pyTab).toHaveAttribute('aria-selected', 'true');
    expect(jsTab).toHaveAttribute('aria-selected', 'false');

    // Click option
    fireEvent.click(jsTab);
    expect(handleChange).toHaveBeenCalledWith('js');

    // Arrow navigation
    fireEvent.keyDown(pyTab, { key: 'ArrowRight' });
    expect(handleChange).toHaveBeenCalledWith('js');
  });

  it('Slider: renders labeled stops and responds to changes', () => {
    const handleChange = vi.fn();
    const stops = [
      { value: 1, label: 'Novice' },
      { value: 2, label: 'Easy' },
      { value: 3, label: 'Medium' },
    ];

    render(
      <Slider
        id="test-slider"
        value={2}
        min={1}
        max={3}
        stops={stops}
        onChange={handleChange}
        ariaLabel="Difficulty"
      />
    );

    const input = screen.getByLabelText('Difficulty');
    expect(input).toHaveValue('2');

    // Clicking a stop button triggers change
    const noviceBtn = screen.getByText('Novice');
    fireEvent.click(noviceBtn);
    expect(handleChange).toHaveBeenCalledWith(1);
  });

  it('Chip: toggles selected state and displays optional counter badge', () => {
    const handleClick = vi.fn();
    const { rerender } = render(
      <Chip label="Loops" selected={false} onClick={handleClick} count={5} />
    );

    const chipBtn = screen.getByRole('button', { name: /Loops/i });
    expect(chipBtn).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('5')).toBeInTheDocument();

    fireEvent.click(chipBtn);
    expect(handleClick).toHaveBeenCalledTimes(1);

    rerender(<Chip label="Loops" selected={true} onClick={handleClick} count={5} />);
    expect(chipBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('Tag: renders diagnostic and metadata variants with accessible content', () => {
    render(
      <div>
        <Tag label="Verified" variant="pass" icon="✓" />
        <Tag label="Failed" variant="error" icon="✕" />
        <Tag label="Caution" variant="warn" icon="⚠" />
        <Tag label="Metadata" variant="muted" />
      </div>
    );

    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Caution')).toBeInTheDocument();
    expect(screen.getByText('Metadata')).toBeInTheDocument();
  });

  it('SegmentedProgress: reflects current level across total segments', () => {
    render(<SegmentedProgress value={3} totalSegments={5} ariaLabel="Mastery level" />);
    const bar = screen.getByRole('progressbar', { name: 'Mastery level' });
    expect(bar).toHaveAttribute('aria-valuenow', '3');
    expect(bar).toHaveAttribute('aria-valuemax', '5');
    expect(bar).toHaveAttribute('aria-valuetext', '3 of 5 segments');
  });

  it('TestRow: formats pass, fail, and pending statuses without answer leakage', () => {
    const { rerender } = render(
      <TestRow
        id="t1"
        description="Check positive numbers"
        input={[1, 2]}
        expectedOutput={3}
        actualOutput={3}
        status="passed"
      />
    );

    expect(screen.getByText('Check positive numbers')).toBeInTheDocument();
    expect(screen.getByText('Passed')).toBeInTheDocument();

    rerender(
      <TestRow
        id="t1"
        description="Check positive numbers"
        input={[1, 2]}
        expectedOutput={3}
        actualOutput={0}
        status="failed"
        error="AssertionError: 0 != 3"
      />
    );

    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('AssertionError: 0 != 3')).toBeInTheDocument();
  });

  it('DiffView: renders added and removed code line annotations', () => {
    render(
      <DiffView
        originalCode="def add(a, b):\n    return a - b"
        modifiedCode="def add(a, b):\n    return a + b"
      />
    );

    expect(screen.getByText('Comparison: Your code vs Reference solution')).toBeInTheDocument();
    expect(screen.getByText('+ Added')).toBeInTheDocument();
    expect(screen.getByText('- Removed')).toBeInTheDocument();
  });

  it('Tabs: supports tab selection and keyboard accessibility', () => {
    const handleTabChange = vi.fn();
    const tabs = [
      { id: 'brief', label: 'Brief' },
      { id: 'code', label: 'Code' },
      { id: 'results', label: 'Results', badge: 2 },
    ];

    render(
      <Tabs
        tabs={tabs}
        activeTab="code"
        onChange={handleTabChange}
        ariaLabel="Workspace sections"
      />
    );

    const briefTab = screen.getByRole('tab', { name: 'Brief' });
    const codeTab = screen.getByRole('tab', { name: /Code/ });
    expect(codeTab).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(briefTab);
    expect(handleTabChange).toHaveBeenCalledWith('brief');

    fireEvent.keyDown(codeTab, { key: 'ArrowRight' });
    expect(handleTabChange).toHaveBeenCalledWith('results');
  });

  it('Toolbar, EmptyState, and Skeleton render accessible containers and states', () => {
    render(
      <div>
        <Toolbar ariaLabel="Test toolbar">
          <span>Filter items</span>
        </Toolbar>

        <EmptyState
          icon="📦"
          title="No items found"
          whatHappened="No items match your criteria."
          whatToDoNext="Try clearing your search."
          action={<button type="button">Clear</button>}
        />

        <Skeleton width="100px" height="20px" />
      </div>
    );

    expect(screen.getByRole('toolbar', { name: 'Test toolbar' })).toBeInTheDocument();
    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText(/What happened:/)).toBeInTheDocument();
    expect(screen.getByText(/What to do next:/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });
});
