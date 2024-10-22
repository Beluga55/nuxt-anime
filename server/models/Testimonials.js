import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  username: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  testimonial: { type: String, required: true },
  rating: { type: Number, required: true },
  dateCreated: { type: Date, default: Date.now },
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

export default Testimonial;