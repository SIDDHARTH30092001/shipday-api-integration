const express = require('express');
const axios = require('axios');
const app = express();

// Enable CORS if frontend and backend are on different origins
const cors = require('cors');
app.use(cors());

const port = 3000; // Or any other port of your choice

// Replace with your API key
const apiKey = "Basic n8hQZtKH0x.xe6ycVBN1KKRsPFWVdQ5";

// API endpoint to track orders
app.get('/track', async (req, res) => {
  const orderNumber = req.query.order;
  if (!orderNumber) return res.status(400).json({ message: "Order number is required." });

  const encodedOrder = encodeURIComponent(orderNumber);
  const url = `https://api.shipday.com/orders/${encodedOrder}`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: apiKey },
    });

    const data = response.data[0]; // Since the response is an array, we select the first element

    const {
      orderId,
      orderNumber: trackingId,
      orderItems,
      activityLog,
      paymentMethod,
      customer,
      orderStatus,
      assignedCarrier,
      trackingLink,
      deliveryInstruction
    } = data;

    const orderDate = activityLog?.placementTime
      ? new Date(activityLog.placementTime).toLocaleString()
      : null;

    const estimatedDelivery = activityLog?.expectedDeliveryDate || null;

    // Structure the response data
    const result = {
      orderId,
      trackingId,
      orderDate,
      items: orderItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        addOns: item.addOns,
      })),
      payment: {
        method: paymentMethod || "N/A",  // Payment method
        totalCost: data.costing?.totalCost ?? 0.00,  // Total cost
      },
      status: orderStatus?.orderState,
      statusAdmin: orderStatus?.orderStateAdmin,
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
    };

    res.json(result);
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ message: "Error fetching order details." });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
