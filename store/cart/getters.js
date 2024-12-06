export default {
  totalItems: (state) => state.cartItems.length,
  totalAmount: (state) => state.cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
};
