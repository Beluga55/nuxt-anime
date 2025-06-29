import Support from "../models/Support.js";

// Get all support tickets for admin
export const getAdminSupportTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';

    // Build search query
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    const result = await Support.aggregate([
      { $match: query },
      {
        $facet: {
          meta: [{ $count: "total" }],
          data: [
            { $sort: { dateCreated: -1 } },
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
    res.status(500).json({ message: "Error fetching support tickets", error: error.message });
  }
};

// Get single support ticket details
export const getSupportTicketDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Support.findById(id);

    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Error fetching support ticket details", error: error.message });
  }
};

// Update support ticket status
export const updateSupportTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedTicket = await Support.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    res.status(200).json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: "Error updating support ticket status", error: error.message });
  }
};

// Delete support ticket
export const deleteSupportTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTicket = await Support.findByIdAndDelete(id);

    if (!deletedTicket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    res.status(200).json({ message: "Support ticket deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting support ticket", error: error.message });
  }
};

// Add response to support ticket (extend the model if needed)
export const addSupportTicketResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { response, adminName } = req.body;

    // For now, we'll update the ticket status and add a response field
    // In a real system, you might want a separate responses collection
    const updatedTicket = await Support.findByIdAndUpdate(
      id,
      { 
        status: 'in-progress',
        adminResponse: response,
        adminName: adminName,
        responseDate: new Date()
      },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    res.status(200).json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: "Error adding response to support ticket", error: error.message });
  }
};

// Get support ticket statistics
export const getSupportTicketStats = async (req, res) => {
  try {
    const stats = await Support.aggregate([
      {
        $group: {
          _id: null,
          totalTickets: { $sum: 1 },
          openTickets: {
            $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] }
          },
          inProgressTickets: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
          },
          resolvedTickets: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          closedTickets: {
            $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
          }
        }
      }
    ]);

    const statusBreakdown = await Support.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get recent ticket trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ticketTrends = await Support.aggregate([
      {
        $match: {
          dateCreated: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$dateCreated" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      general: stats[0] || {
        totalTickets: 0,
        openTickets: 0,
        inProgressTickets: 0,
        resolvedTickets: 0,
        closedTickets: 0
      },
      statusBreakdown,
      trends: ticketTrends
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching support ticket statistics", error: error.message });
  }
};