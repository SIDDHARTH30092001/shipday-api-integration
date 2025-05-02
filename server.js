const express = require("express");
const cors = require("cors");
const Shipday = require("shipday/integration");

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());

// Directly using trial API key
const shipdayClient = new Shipday("n8hQZtKH0x.xe6ycVBN1KKRsPFWVdQ5", 10000);

app.get("/track", async (req, res) => {
  const orderNumber = req.query.order;
  if (!orderNumber) return res.status(400).json({ message: "Missing order number" });

  try {
    const orders = await shipdayClient.orderService.getOrders();
    const order = orders.find(o => o.orderNumber === orderNumber.toString());

    if (!order) return res.status(404).json({ message: "Order not found" });

    const {
      orderId,
      orderNumber: trackingId,
      orderItems,
      activityLog,
      costing,
      customer,
      orderStatus,
      orderStatusAdmin,
      assignedCarrier,
      trackingLink,
      deliveryInstruction
    } = order;

    const orderDate = activityLog?.placementTime
      ? new Date(activityLog.placementTime).toLocaleString()
      : null;

    const estimatedDelivery = activityLog?.expectedDeliveryDate || null;

    res.json({
      orderId,
      trackingId,
      orderDate,
      items: orderItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        addOns: item.addOns,
      })),
      paymentStatus: costing?.totalCost > 0 ? "Paid" : "Pending",
      status: orderStatus?.orderState,
      statusAdmin: orderStatusAdmin,
      estimatedDelivery,
      expectedDeliveryTime: activityLog?.expectedDeliveryTime,
      customerAddress: customer?.address,
      customerPhone: customer?.phoneNumber,
      deliveryInstruction,
      deliveryPerson: assignedCarrier ? {
        name: assignedCarrier.name,
        phone: assignedCarrier.phoneNumber,
      } : null,
      trackingLink,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));
