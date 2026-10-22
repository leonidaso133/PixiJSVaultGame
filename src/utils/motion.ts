const query = matchMedia("(prefers-reduced-motion: reduce)");

export function reducedMotion() {
  return query.matches;
}
