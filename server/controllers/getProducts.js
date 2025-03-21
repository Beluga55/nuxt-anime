import Product from "../models/Product.js";
import { getProductsImage } from "./getImagesFromCloud.js";

export const getProducts = async (req, res) => {
  const page = 1;
  const limit = 50;

  const result = await Product.aggregate([
    {
      $facet: {
        meta: [{ $count: "total" }],
        data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
      },
    },
  ]);

  const productsWithUrls = await Promise.all(
    result[0].data.map(async (product) => ({
      ...product,
      imageUrl: await getProductsImage(product.image),
    }))
  );

  res.status(200).json({
    meta: { ...result[0].meta[0], page, limit },
    data: productsWithUrls,
  });
};

export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);

  // Get the image URL from the product image property
  const imageUrl = await getProductsImage(product.image);

  // Add the image URL to the product object
  product.image = imageUrl;

  // Return the product with the image URL
  res.status(200).json(product);
};