export function runGrade({ score, distance, cornCollected, bestCombo }) {
  // Add one point per whole meter, ten per corn and 100 per best combo level to the score.
  // Minimum totals are S 8,000, A 6,500, B 4,500 and C 2,200. Lower totals earn D.
  const total = score + Math.floor(distance) + cornCollected * 10 + bestCombo * 100;
  if (total >= 8000) return 'S';
  if (total >= 6500) return 'A';
  if (total >= 4500) return 'B';
  if (total >= 2200) return 'C';
  return 'D';
}
