import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  qty: { type: Number, required: true },
}, { _id : false });

const shippingAddressSchema = new mongoose.Schema({
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
}, { _id : false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  paymentMethod: { type: String, required: true },
  datePlaced: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending' },
  metadata: {
    session_id: { type: String },
    order_id: { type: String }
  }
});

const Order = mongoose.model('Order', orderSchema);

export default Order;