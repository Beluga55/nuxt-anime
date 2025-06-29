import Product from "../models/Product.js";
import { getProductsImage } from "./getImagesFromCloud.js";

// Get all products for admin (with full details)
export const getAdminProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const category = req.query.category || '';

    // Build search query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      query.category = category;
    }

    const result = await Product.aggregate([
      { $match: query },
      {
        $facet: {
          meta: [{ $count: "total" }],
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit }, 
            { $limit: limit }
          ],
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
      meta: { 
        total: result[0].meta[0]?.total || 0, 
        page, 
        limit,
        totalPages: Math.ceil((result[0].meta[0]?.total || 0) / limit)
      },
      data: productsWithUrls,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

// Create new product
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      width,
      height,
      material,
      price,
      image,
      category,
      stock,
    } = req.body;

    // Validate required fields
    if (!name || !description || !width || !height || !material || !price || !image || !category || stock === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = new Product({
      name,
      description,
      width,
      height,
      material,
      price: parseFloat(price),
      image,
      category,
      stock: parseInt(stock),
      rating: 0,
      numReviews: 0
    });

    const savedProduct = await product.save();
    
    // Add image URL for response
    const imageUrl = await getProductsImage(savedProduct.image);
    
    res.status(201).json({
      ...savedProduct.toObject(),
      imageUrl
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating product", error: error.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert price and stock to proper types
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.stock !== undefined) updateData.stock = parseInt(updateData.stock);

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Add image URL for response
    const imageUrl = await getProductsImage(updatedProduct.image);

    res.status(200).json({
      ...updatedProduct.toObject(),
      imageUrl
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};

// Get product statistics
export const getProductStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          averagePrice: { $avg: "$price" },
          lowStockProducts: {
            $sum: { $cond: [{ $lte: ["$stock", 10] }, 1, 0] }
          }
        }
      }
    ]);

    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalStock: { $sum: "$stock" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      general: stats[0] || {
        totalProducts: 0,
        totalStock: 0,
        averagePrice: 0,
        lowStockProducts: 0
      },
      categories: categoryStats
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching product statistics", error: error.message });
  }
};