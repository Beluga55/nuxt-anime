import User from "../models/User.js";
import Order from "../models/Order.js";

// Get all users for admin
export const getAdminUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const isActive = req.query.isActive;

    // Build search query
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Get users with order statistics
    const result = await User.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $addFields: {
          totalOrders: { $size: '$orders' },
          totalSpent: {
            $sum: {
              $map: {
                input: '$orders',
                as: 'order',
                in: {
                  $sum: {
                    $map: {
                      input: '$$order.orderItems',
                      as: 'item',
                      in: { $multiply: ['$$item.qty', '$$item.price'] }
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $project: {
          password: 0,
          twoFactorSecret: 0,
          twoFactorTempSecret: 0,
          twoFactorBackupCodes: 0,
          orders: 0
        }
      },
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
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

// Get single user details
export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password -twoFactorSecret -twoFactorTempSecret -twoFactorBackupCodes');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's orders
    const orders = await Order.find({ user: id })
      .populate('orderItems.product', 'name price')
      .sort({ datePlaced: -1 })
      .limit(10);

    // Calculate user statistics
    const userStats = await Order.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: {
            $sum: {
              $sum: {
                $map: {
                  input: '$orderItems',
                  as: 'item',
                  in: { $multiply: ['$$item.qty', '$$item.price'] }
                }
              }
            }
          },
          averageOrderValue: {
            $avg: {
              $sum: {
                $map: {
                  input: '$orderItems',
                  as: 'item',
                  in: { $multiply: ['$$item.qty', '$$item.price'] }
                }
              }
            }
          }
        }
      }
    ]);

    res.status(200).json({
      user,
      orders,
      stats: userStats[0] || { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user details", error: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated through this endpoint
    delete updateData.password;
    delete updateData.twoFactorSecret;
    delete updateData.twoFactorTempSecret;
    delete updateData.twoFactorBackupCodes;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -twoFactorSecret -twoFactorTempSecret -twoFactorBackupCodes');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
};

// Toggle user active status
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('-password -twoFactorSecret -twoFactorTempSecret -twoFactorBackupCodes');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating user status", error: error.message });
  }
};

// Delete user (soft delete)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { 
        isActive: false,
        deletedAt: new Date()
      },
      { new: true }
    ).select('-password -twoFactorSecret -twoFactorTempSecret -twoFactorBackupCodes');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deactivated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactiveUsers: { $sum: { $cond: ['$isActive', 0, 1] } },
          adminUsers: { $sum: { $cond: ['$isAdmin', 1, 0] } },
          googleUsers: { $sum: { $cond: ['$isGoogle', 1, 0] } },
          verifiedUsers: { $sum: { $cond: ['$emailVerified', 1, 0] } },
          twoFactorUsers: { $sum: { $cond: ['$twoFactorEnabled', 1, 0] } }
        }
      }
    ]);

    // Get user registration trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const registrationTrends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      general: stats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        adminUsers: 0,
        googleUsers: 0,
        verifiedUsers: 0,
        twoFactorUsers: 0
      },
      registrationTrends
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user statistics", error: error.message });
  }
};