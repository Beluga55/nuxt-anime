import https from "https";
import Testimonial from "../models/Testimonials.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { getSignedUrl } from "./getImagesFromCloud.js";

// Https request to check the image URL
const checkImageUrl = (url) => {
  if (!url) return Promise.resolve(null);
  
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

export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.aggregate([
      { 
        $facet: {
          "fiveStars": [
            { $match: { rating: 5 } },
            { $limit: 5 }
          ],
          "fourStars": [
            { $match: { rating: 4 } },
            { $limit: 5 }
          ]
        }
      },
      {
        $project: {
          testimonials: {
            $concatArrays: ["$fiveStars", "$fourStars"]
          }
        }
      },
      { $unwind: "$testimonials" },
      { $replaceRoot: { newRoot: "$testimonials" } },
      { $sort: { rating: -1 } },
      { $limit: 10 }
    ]);

    const promises = testimonials.map(async (testimonial) => {
      const user = await User.findById(testimonial.username);
      const product = await Product.findById(testimonial.productId);

      const username = user ? user.username : "User not found";
      const productName = product ? product.name : "Product not found";
      const imageUrl = user ? await getSignedUrl(user.image) : null;
      const validateImageUrl = await checkImageUrl(imageUrl);

      return {
        id: testimonial._id,
        username: username,
        productName: productName,
        testimonial: testimonial.testimonial,
        rating: testimonial.rating,
        imageUrl: validateImageUrl,
      };
    });

    const reviews = await Promise.all(promises);

    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const skip = (page - 1) * limit;
    
    // Get total count and average rating for all reviews
    const [totalReviews, allReviews] = await Promise.all([
      Testimonial.countDocuments({ productId }),
      Testimonial.find({ productId }, 'rating')
    ]);
    
    // Calculate total average rating
    const totalRatingSum = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const totalAverageRating = totalReviews > 0 ? Math.round((totalRatingSum / totalReviews) * 10) / 10 : 0;
    
    // Get paginated reviews
    const testimonials = await Testimonial.find({ productId })
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limit);
    
    const reviewsWithUserData = await Promise.all(
      testimonials.map(async (testimonial) => {
        const user = await User.findById(testimonial.username);
        const imageUrl = user ? await getSignedUrl(user.image) : null;
        const validateImageUrl = await checkImageUrl(imageUrl);
        
        return {
          id: testimonial._id,
          username: user ? user.username : "User not found",
          testimonial: testimonial.testimonial,
          rating: testimonial.rating,
          dateCreated: testimonial.dateCreated,
          userImage: validateImageUrl
        };
      })
    );

    // Calculate pagination info
    const totalPages = Math.ceil(totalReviews / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      reviews: reviewsWithUserData,
      totalAverageRating,
      totalReviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalReviews,
        hasNextPage,
        hasPrevPage,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
