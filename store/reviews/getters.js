export default {
  hasReviews: (state) => state.totalReviews > 0,
  averageRating: (state) => state.totalAverageRating
}
