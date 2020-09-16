export const MAX_SHOW_DIFF = 0.2;

export const MAX_TRUST_DIFF = {
  DEFAULT: 0.15,
  30042: 0.12,
  30043: 0.1,
  30044: 0.1,
  30062: 0.12,
  30125: 0.2,
  31024: 0.18,
};

export const isTrustSim = sim => {
  if (!sim) return false;
  const { diff, name } = sim;
  const maxTrustDiff = name in MAX_TRUST_DIFF ? MAX_TRUST_DIFF[name] : MAX_TRUST_DIFF.DEFAULT;
  return diff < maxTrustDiff;
};
