export function calcAvgRating() {
  if (!this.populated("reviews")) return 0;

  // Filter out deleted reviews before calculating average
  const ratings = this.reviews
    .filter((review) => review.isDeleted !== true) // Filter out deleted reviews
    .map((review) => review.rate)
    .filter((r) => typeof r === "number");

  if (ratings.length === 0) return 0;

  const sum = ratings.reduce((acc, val) => acc + val, 0);
  return sum / ratings.length; // rounded to 1 decimal
}
