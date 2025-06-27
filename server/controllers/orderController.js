import Order from "../models/Order.js";
import User from "../models/User.js";
import { getProductsImage } from "./getImagesFromCloud.js";

// Get order by session ID
export const getOrderBySessionId = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }
    
    // Find the order with this session ID
    // This assumes the webhook has stored the session ID with the order
    const order = await Order.findOne({ 
      "metadata.session_id": sessionId 
    }).populate({
      path: 'orderItems.product',
      select: 'name price image'
    });

    console.log(order);
    
    if (!order) {
      // If order not found, it might still be processing
      return res.status(404).json({ 
        error: "Order not found or still processing",
        processing: true
      });
    }
    
    // Format order with signed image URLs
    const formattedOrder = {
      ...order.toObject(),
      orderItems: await Promise.all(order.orderItems.map(async (item) => {
        let imageUrl = '';
        try {
          if (item.product?.image) {
            imageUrl = await getProductsImage(item.product.image);
          }
        } catch (error) {
          console.error(`Error getting image for product ${item.product?.name}:`, error);
          imageUrl = '';
        }
        
        return {
          ...item.toObject(),
          product: item.product ? {
            ...item.product.toObject(),
            image: imageUrl
          } : null
        };
      }))
    };
    
    res.json({ order: formattedOrder });
  } catch (error) {
    console.error("Error retrieving order:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get orders by user email with pagination
export const getOrdersByUserEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const { page = 1, limit = 10, status, sortBy = 'datePlaced', sortOrder = 'desc' } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    // Find user by email first
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Build query filter
    const filter = { user: user._id };
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Fetch orders with pagination
    const orders = await Order.find(filter)
      .populate({
        path: 'orderItems.product',
        select: 'name price image category'
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Get total count for pagination
    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));
    
    // Calculate total spent by joining with products and summing price * qty
    const totalSpent = await Order.aggregate([
      { $match: { user: user._id } },
      { $unwind: "$orderItems" },
      { 
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: null,
          total: { 
            $sum: { 
              $multiply: ["$productDetails.price", "$orderItems.qty"] 
            }
          }
        }
      }
    ]);
    
    // Format response with signed image URLs
    let formattedOrders;
    try {
      formattedOrders = await Promise.all(orders.map(async (order) => ({
        id: order._id,
        orderId: order.metadata?.order_id || order._id,
        date: order.datePlaced,
        status: order.status,
        items: await Promise.all(order.orderItems.map(async (item) => {
          let imageUrl = '';
          try {
            if (item.product?.image) {
              imageUrl = await getProductsImage(item.product.image);
            }
          } catch (error) {
            console.error(`Error getting image for product ${item.product?.name}:`, error);
            // Fallback to filename if image processing fails
            imageUrl = item.product?.image || '';
          }
          
          return {
            name: item.product?.name || 'Product not found',
            quantity: item.qty,
            price: item.product?.price || 0,
            image: imageUrl,
            category: item.product?.category || ''
          };
        })),
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        totalAmount: order.orderItems.reduce((sum, item) => 
          sum + (item.product?.price || 0) * item.qty, 0
        )
      })));
    } catch (error) {
      console.error('Error processing order images, falling back to basic order data:', error);
      // Fallback: return orders without processed images
      formattedOrders = orders.map(order => ({
        id: order._id,
        orderId: order.metadata?.order_id || order._id,
        date: order.datePlaced,
        status: order.status,
        items: order.orderItems.map(item => ({
          name: item.product?.name || 'Product not found',
          quantity: item.qty,
          price: item.product?.price || 0,
          image: item.product?.image || '',
          category: item.product?.category || ''
        })),
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        totalAmount: order.orderItems.reduce((sum, item) => 
          sum + (item.product?.price || 0) * item.qty, 0
        )
      }));
    }
    
    res.json({
      orders: formattedOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      },
      stats: {
        totalSpent: totalSpent[0]?.total || 0,
        totalOrders: total
      }
    });
    
  } catch (error) {
    console.error("Error retrieving user orders:", error);
    res.status(500).json({ error: error.message });
  }
};
