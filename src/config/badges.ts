export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const BADGES: BadgeDefinition[] = [
  {
    id: 'zero-hints',
    title: 'Zero hints',
    description: 'Solve a puzzle without unlocking any hints.',
    icon: '🎯',
  },
  {
    id: 'off-by-one-slayer',
    title: 'Off-by-one slayer',
    description: 'Fix a puzzle featuring an off-by-one or loop boundary bug.',
    icon: '⚔️',
  },
  {
    id: 'first-blood',
    title: 'First blood',
    description: 'Successfully solve your very first debugging puzzle.',
    icon: '🏆',
  },
  {
    id: 'streak-master',
    title: 'Streak master',
    description: 'Maintain an active daily debugging streak for 3 consecutive days.',
    icon: '🔥',
  },
  {
    id: 'polyglot-hunter',
    title: 'Polyglot hunter',
    description: 'Fix buggy programs in both Python and JavaScript.',
    icon: '🌐',
  },
  {
    id: 'deep-diver',
    title: 'Deep diver',
    description: 'Successfully conquer a challenging Level 4 or Level 5 puzzle.',
    icon: '🌊',
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Achieve 3 consecutive zero-hint puzzle solves.',
    icon: '⭐',
  },
];
