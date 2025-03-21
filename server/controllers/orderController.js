import Order from "../models/Order.js";

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
      select: 'name price images'
    });

    console.log(order);
    
    if (!order) {
      // If order not found, it might still be processing
      return res.status(404).json({ 
        error: "Order not found or still processing",
        processing: true
      });
    }
    
    res.json({ order });
  } catch (error) {
    console.error("Error retrieving order:", error);
    res.status(500).json({ error: error.message });
  }
};
