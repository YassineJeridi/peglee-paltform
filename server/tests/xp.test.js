const { computeLevel } = require('../src/services/xpService');
const xpRules = require('../src/config/xpRules');

describe('computeLevel', () => {
  it('commence au niveau 1 avec 0 XP', () => {
    expect(computeLevel(0)).toEqual({ level: 1, xpIntoLevel: 0, xpForNextLevel: 100 });
  });

  it('reste au niveau courant juste en dessous d\'un palier', () => {
    const result = computeLevel(99);
    expect(result.level).toBe(1);
  });

  it('passe au niveau supérieur exactement au palier', () => {
    const result = computeLevel(100);
    expect(result.level).toBe(2);
    expect(result.xpIntoLevel).toBe(0);
  });

  it('calcule xpIntoLevel / xpForNextLevel en milieu de niveau', () => {
    const result = computeLevel(150);
    expect(result.level).toBe(2);
    expect(result.xpIntoLevel).toBe(50);
    expect(result.xpForNextLevel).toBe(150); // 250 - 100
  });

  it('renvoie xpForNextLevel à null au niveau maximal', () => {
    const maxThreshold = xpRules.LEVEL_THRESHOLDS[xpRules.LEVEL_THRESHOLDS.length - 1];
    const result = computeLevel(maxThreshold + 500);
    expect(result.level).toBe(xpRules.LEVEL_THRESHOLDS.length);
    expect(result.xpForNextLevel).toBeNull();
  });
});
