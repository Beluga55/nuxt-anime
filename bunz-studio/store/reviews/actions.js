const useApi = () => useNuxtApp().$api;

export default {
  async getProductReviews({ productId, page = 1, limit = 3 }) {
    this.loading = true;
    try {
      const [response, error] = await useApi().testimonials.getProductReviews({
        productId,
        page,
        limit,
      });
      if (error) throw error;

      this.productReviews = response.reviews;
      this.totalAverageRating = response.totalAverageRating;
      this.totalReviews = response.totalReviews;
      this.pagination = response.pagination;
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  },

  nextPage(productId) {
    if (this.pagination.hasNextPage) {
      this.getProductReviews({ productId, page: this.pagination.currentPage + 1, limit: this.pagination.limit })
    }
  },

  prevPage(productId) {
    if (this.pagination.hasPrevPage) {
      this.getProductReviews({ productId, page: this.pagination.currentPage - 1, limit: this.pagination.limit })
    }
  }
}
