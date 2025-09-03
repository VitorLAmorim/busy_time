export function getStarArray(rating: number): Array<'full' | 'half' | 'empty'> {
  const stars: Array<'full' | 'half' | 'empty'> = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push('full');
  }

  if (hasHalfStar) {
    stars.push('half');
  }

  while (stars.length < 5) {
    stars.push('empty');
  }

  return stars;
}
