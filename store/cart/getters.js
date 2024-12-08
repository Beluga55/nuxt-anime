export default {
  totalItems: (state) => state.cartItems.reduce((total, item) => total + item.quantity, 0),
  totalAmount: (state) => state.cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
};
