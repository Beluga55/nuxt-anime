export default {
  addToCart(product, quantity = 1) {
    // 1. First check if this is a unique item or existing item
    const existingItemIndex = this.cartItems.findIndex(item => item.id === product._id);
    const isNewItem = existingItemIndex === -1;

    // Format product data to ensure consistent structure
    const cartProduct = {
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 0,
      stock: product.stock,
      image: product.imageUrl || product.image, // Handle both imageUrl and image fields
      description: product.description
    };

    // 2. Check quantity against stock limit
    if (isNewItem) {
      // For new items, just check against product stock
      if (quantity > product.stock) {
        throw new Error(`Cannot add ${quantity} items. Maximum stock available is ${product.stock}`);
      }
      // Add as new item with specified quantity
      cartProduct.quantity = quantity;
      this.cartItems.push(cartProduct);
    } else {
      // For existing items, check total quantity against stock
      const existingItem = this.cartItems[existingItemIndex];
      const totalQuantity = existingItem.quantity + quantity;
      
      if (totalQuantity > product.stock) {
        const remainingStock = product.stock - existingItem.quantity;
        throw new Error(
          `Cannot add ${quantity} more items. You already have ${existingItem.quantity} in cart. ` +
          `Only ${remainingStock} more can be added.`
        );
      }
      // Update existing item quantity
      existingItem.quantity = totalQuantity;
    }

    // 3. Save to localStorage
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
  },

  removeFromCart(productId) {
    this.cartItems = this.cartItems.filter(item => item.id !== productId);
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
  },

  updateQuantity(productId, quantity) {
    const item = this.cartItems.find(item => item.id === productId);
    if (item) {
      // Check if new quantity exceeds stock
      if (quantity > item.stock) {
        throw new Error(`Cannot set quantity higher than ${item.stock} due to stock limit`);
      }
      item.quantity = quantity;
      localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
    }
  },

  loadCart() {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
    }
  },

  clearCart() {
    this.cartItems = [];
    localStorage.removeItem('cartItems');
  }
};
