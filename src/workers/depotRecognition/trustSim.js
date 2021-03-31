export const MAX_SHOW_DIFF = 0.22;

export const MAX_TRUST_DIFF = {
  DEFAULT: 0.2,
  30042: 0.15,
  30043: 0.12,
  30044: 0.12,
  30062: 0.15,
};

export const isTrustSim = sim => {
  if (!sim) return false;
  const { diff, name } = sim;
  const maxTrustDiff = name in MAX_TRUST_DIFF ? MAX_TRUST_DIFF[name] : MAX_TRUST_DIFF.DEFAULT;
  return diff < maxTrustDiff;
};
