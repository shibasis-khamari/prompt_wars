import { AdaptiveSkillState, updateAdaptiveSkill, calculateRank } from '../shared/rules';

const SKILL_STORAGE_KEY = 'bughunt_topic_skills_v1';
const XP_STORAGE_KEY = 'bughunt_user_xp_v1';
const BADGES_STORAGE_KEY = 'bughunt_user_badges_v1';

export function getSkillKey(language: string, topic: string): string {
  return `${language.toLowerCase()}:${topic.toLowerCase()}`;
}

export class SkillStore {
  private static loadSkills(): Record<string, AdaptiveSkillState> {
    if (typeof localStorage === 'undefined') return {};
    try {
      const raw = localStorage.getItem(SKILL_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private static saveSkills(data: Record<string, AdaptiveSkillState>): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SKILL_STORAGE_KEY, JSON.stringify(data));
    }
  }

  public static getTopicSkill(language: string, topic: string): AdaptiveSkillState {
    const key = getSkillKey(language, topic);
    const all = this.loadSkills();
    return (
      all[key] || {
        level: 1,
        consecutiveZeroHintSolves: 0,
        consecutiveFailures: 0,
      }
    );
  }

  public static recordTopicResult(
    language: string,
    topic: string,
    event: { solved: boolean; hintsUsed: number }
  ): AdaptiveSkillState {
    const key = getSkillKey(language, topic);
    const all = this.loadSkills();
    const current = this.getTopicSkill(language, topic);
    const updated = updateAdaptiveSkill(current, event);

    all[key] = updated;
    this.saveSkills(all);
    return updated;
  }

  public static getAllTopicSkills(): Record<string, AdaptiveSkillState> {
    return this.loadSkills();
  }

  public static getUserXP(): number {
    if (typeof localStorage === 'undefined') return 0;
    try {
      const raw = localStorage.getItem(XP_STORAGE_KEY);
      return raw ? parseInt(raw, 10) || 0 : 0;
    } catch {
      return 0;
    }
  }

  public static addXP(amount: number): { totalXP: number; rank: string } {
    const current = this.getUserXP();
    const totalXP = Math.max(current + amount, 0);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(XP_STORAGE_KEY, String(totalXP));
    }
    const rank = calculateRank(totalXP);
    return { totalXP, rank };
  }

  public static getUnlockedBadges(): string[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(BADGES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static unlockBadge(badgeId: string): string[] {
    const badges = this.getUnlockedBadges();
    if (!badges.includes(badgeId)) {
      badges.push(badgeId);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(BADGES_STORAGE_KEY, JSON.stringify(badges));
      }
    }
    return badges;
  }
}
