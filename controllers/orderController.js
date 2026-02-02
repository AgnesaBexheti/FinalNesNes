const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Client = require('../models/Client');
const Discount = require('../models/Discount');
const { sequelize } = require('../models');

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: Client,
          attributes: ['id', 'fullName', 'email', 'address']
        },
        {
          model: OrderItem,
          include: [{
            model: Product,
            attributes: ['id', 'name', 'description', 'price']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: Client,
          attributes: ['id', 'fullName', 'email', 'address']
        },
        {
          model: OrderItem,
          include: [{
            model: Product,
            attributes: ['id', 'name', 'description', 'price']
          }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get orders by client
exports.getOrdersByClient = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { clientId: req.params.clientId },
      include: [
        {
          model: Client,
          attributes: ['id', 'fullName', 'email', 'address']
        },
        {
          model: OrderItem,
          include: [{
            model: Product,
            attributes: ['id', 'name', 'description', 'price']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new order (Place order)
exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { client, items } = req.body;

    console.log({client});

    // Validate input
    if (!client || !client.name || !client.email) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Client information (fullName, email) is required shfdbglretg' , client});
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    // Create or find client
    let clientRecord = await Client.findOne({
      where: { email: client.email }
    });

    if (!clientRecord) {
      clientRecord = await Client.create({
        fullName: client.name,
        email: client.email,
        address: client.address || ''
      }, { transaction });
    }

    // Create order
    const order = await Order.create({
      clientId: clientRecord.id,
      status: 'pending'
    }, { transaction });

    // Process order items
    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      // Validate item
      if (!item.productId || !item.quantity) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Each item must have productId and quantity' });
      }

      // Get product
      const product = await Product.findByPk(item.productId);
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ error: `Product with ID ${item.productId} not found` });
      }

      // Check stock availability
      if (product.initialQuantity < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          error: `Insufficient stock for product "${product.name}". Available: ${product.initialQuantity}, Requested: ${item.quantity}`
        });
      }

      // Get active discount if exists
      const discount = await Discount.findOne({
        where: {
          productId: item.productId,
          active: true
        }
      });

      // Calculate price with discount
      let priceAtOrder = product.price;
      if (discount) {
        priceAtOrder = product.price * (1 - discount.percentage / 100);
      }

      // Create order item
      const orderItem = await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtOrder: priceAtOrder
      }, { transaction });

      orderItems.push(orderItem);
      totalAmount += priceAtOrder * item.quantity;

      // Update product quantity (deduct from stock)
      await product.update({
        initialQuantity: product.initialQuantity - item.quantity
      }, { transaction });
    }

    // Save the total price to the order
    await order.update({ totalPrice: totalAmount }, { transaction });

    await transaction.commit();

    // Fetch complete order with relations
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: Client,
          attributes: ['id', 'fullName', 'email', 'address']
        },
        {
          model: OrderItem,
          include: [{
            model: Product,
            attributes: ['id', 'name', 'description', 'price']
          }]
        }
      ]
    });

    res.status(201).json({
      order: completeOrder,
      totalAmount: totalAmount.toFixed(2)
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    await order.save();

    // Fetch complete order
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: Client,
          attributes: ['id', 'fullName', 'email', 'address']
        },
        {
          model: OrderItem,
          include: [{
            model: Product,
            attributes: ['id', 'name', 'description', 'price']
          }]
        }
      ]
    });

    res.json(completeOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await order.destroy();
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get order statistics
exports.getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const processingOrders = await Order.count({ where: { status: 'processing' } });
    const shippedOrders = await Order.count({ where: { status: 'shipped' } });
    const deliveredOrders = await Order.count({ where: { status: 'delivered' } });
    const cancelledOrders = await Order.count({ where: { status: 'cancelled' } });

    res.json({
      total: totalOrders,
      pending: pendingOrders,
      processing: processingOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
