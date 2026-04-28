/**
 * Semantic color tokens — always resolve to the current theme via
 * CSS variables defined in app/globals.css. Never use hex literals in
 * component files; reference these tokens.
 */
export const CC = {
  bg: "var(--cc-bg)",
  bg2: "var(--cc-bg2)",
  card: "var(--cc-card)",
  cardSolid: "var(--cc-card-solid)",
  border: "var(--cc-border)",
  borderStrong: "var(--cc-border-strong)",
  gridLine: "var(--cc-grid-line)",
  fg: "var(--cc-fg)",
  fg2: "var(--cc-fg2)",
  fg3: "var(--cc-fg3)",
  yellow: "var(--cc-yellow)",
  blue: "var(--cc-blue)",
  red: "var(--cc-red)",
  green: "var(--cc-green)",
  ambientA: "var(--cc-ambient-a)",
  ambientB: "var(--cc-ambient-b)",
} as const;
