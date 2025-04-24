const express = require('express');
const cors = require('cors');
const Shipday = require('shipday/integration');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const shipdayClient = new Shipday('n8hQZtKH0x.xe6ycVBN1KKRsPFWVdQ5', 10000);

app.get('/track', async (req, res) => {
  const orderNumber = req.query.order;

  try {
    const orders = await shipdayClient.orderService.getOrders();
    const order = orders.find(o => o.orderNumber === orderNumber);

    if (order) {
      const status = order.orderStatusAdmin;
      const deliveryDate = order.activityLog?.expectedDeliveryDate;
      res.json({ status, deliveryDate });
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("Error fetching tracking info:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
