import https from "https";
import Testimonial from "../models/Testimonials.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { getSignedUrl } from "./getImagesFromCloud.js";

export const getTestimonials = async (req, res) => {
  let data = [];

  const testimonials = await Testimonial.find().sort({ rating: -1 }).limit(10);

  // Https request to check the image URL
  const checkImageUrl = (url) => {
    return new Promise((resolve) => {
      https
        .get(url, (response) => {
          if (response.statusCode === 200) {
            resolve(url);
          } else {
            resolve(null);
          }
        })
        .on("error", () => {
          resolve(null);
        });
    });
  };

  // username, product, description, rating, image
  const promises = testimonials.map(async (testimonial) => {
    // Find each user and product based on each testimonial
    const user = await User.findById(testimonial.username);
    const product = await Product.findById(testimonial.productId);

    // Extract the username and product name
    const username = user ? user.username : "User not found";
    const productName = product ? product.name : "Product not found";

    // Get the image URL for the user
    const imageUrl = await getSignedUrl(user.image);

    // Check the imageUrl using https request (if error, return null)
    const validateImageUrl = await checkImageUrl(imageUrl);

    // Send the response with the testimonial data
    return {
      username: username,
      productName: productName,
      testimonial: testimonial.testimonial,
      rating: testimonial.rating,
      imageUrl: validateImageUrl,
    };
  });

  // Wait for all promises to resolve when using forEach (i.e., all data to be fetched)
  data = await Promise.all(promises);

  res.status(200).json(data);
};
