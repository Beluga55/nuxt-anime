export default () => ({
  productReviews: [],
  totalAverageRating: 0,
  totalReviews: 0,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalReviews: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 3
  }
})
