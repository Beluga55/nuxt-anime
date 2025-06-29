import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

// Get all orders for admin
export const getAdminOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';

    // Build search query
    const query = {};
    if (status) {
      query.status = status;
    }

    const result = await Order.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $addFields: {
          userName: { $arrayElemAt: ['$userDetails.username', 0] },
          userEmail: { $arrayElemAt: ['$userDetails.email', 0] },
          totalItems: { $sum: '$orderItems.qty' },
          totalAmount: {
            $sum: {
              $map: {
                input: '$orderItems',
                as: 'item',
                in: {
                  $multiply: [
                    '$$item.qty',
                    {
                      $let: {
                        vars: {
                          product: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: '$productDetails',
                                  cond: { $eq: ['$$this._id', '$$item.product'] }
                                }
                              },
                              0
                            ]
                          }
                        },
                        in: '$$product.price'
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      },
      // Filter by search after all data is populated
      ...(search ? [{
        $match: {
          $or: [
            { userName: { $regex: search, $options: 'i' } },
            { userEmail: { $regex: search, $options: 'i' } },
            { 'metadata.order_id': { $regex: search, $options: 'i' } }
          ]
        }
      }] : []),
      {
        $facet: {
          meta: [{ $count: "total" }],
          data: [
            { $sort: { datePlaced: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit }
          ],
        },
      },
    ]);

    res.status(200).json({
      meta: {
        total: result[0].meta[0]?.total || 0,
        page,
        limit,
        totalPages: Math.ceil((result[0].meta[0]?.total || 0) / limit)
      },
      data: result[0].data,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

// Get single order details
export const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('user', 'username email phone')
      .populate('orderItems.product', 'name price image category');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order details", error: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('user', 'username email');

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Error updating order status", error: error.message });
  }
};

// Delete order (admin only)
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error: error.message });
  }
};

// Get order statistics
export const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $addFields: {
          totalAmount: {
            $sum: {
              $map: {
                input: '$orderItems',
                as: 'item',
                in: {
                  $multiply: [
                    '$$item.qty',
                    {
                      $let: {
                        vars: {
                          product: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: '$productDetails',
                                  cond: { $eq: ['$$this._id', '$$item.product'] }
                                }
                              },
                              0
                            ]
                          }
                        },
                        in: '$$product.price'
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Processing'] }, 1, 0] }
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Shipped'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    const statusStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      general: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0
      },
      statusBreakdown: statusStats
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching order statistics", error: error.message });
  }
};