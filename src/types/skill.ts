export type SkillLevel =
  | 'absolute_beginner'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert';

export interface SkillLevelMeta {
  id: SkillLevel;
  label: string;
  description: string;
}

export const SKILL_LEVELS: SkillLevelMeta[] = [
  {
    id: 'absolute_beginner',
    label: 'Absolute Beginner',
    description: 'First steps in programming; understanding variables, loops, and basic logic.',
  },
  {
    id: 'beginner',
    label: 'Beginner',
    description: 'Comfortable with syntax, functions, and simple data manipulation.',
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    description: 'Working with standard data structures (trees, hash maps) and common algorithms.',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Complex algorithmic patterns, dynamic programming, and system optimization.',
  },
  {
    id: 'expert',
    label: 'Expert / Hardest',
    description: 'Competition-level problems, nuanced edge cases, and high-scale architectural design.',
  },
];

export const getSkillLevelLabel = (level: SkillLevel): string => {
  const found = SKILL_LEVELS.find((l) => l.id === level);
  return found ? found.label : level;
};
