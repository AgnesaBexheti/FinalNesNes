const { sequelize } = require('../models');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const { Op } = require('sequelize');

// Get daily earnings report
exports.getDailyEarnings = async (req, res) => {
  try {
    const { date } = req.query;

    // Default to today if no date provided
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Use raw SQL to avoid column mapping issues
    const [results] = await sequelize.query(`
      SELECT
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(oi.quantity), 0) as total_items_sold,
        COALESCE(SUM(oi.quantity * oi.price_at_order), 0) as total_earnings
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.created_at >= :startOfDay
        AND o.created_at <= :endOfDay
        AND o.status != 'cancelled'
    `, {
      replacements: {
        startOfDay: startOfDay.toISOString(),
        endOfDay: endOfDay.toISOString()
      }
    });

    const result = results[0];

    res.json({
      date: startOfDay.toISOString().split('T')[0],
      total_earnings: parseFloat(result.total_earnings).toFixed(2),
      total_orders: parseInt(result.total_orders),
      total_items_sold: parseInt(result.total_items_sold)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get monthly earnings report
exports.getMonthlyEarnings = async (req, res) => {
  try {
    const { year, month } = req.query;

    // Default to current month if not provided
    const now = new Date();
    const targetYear = year ? parseInt(year) : now.getFullYear();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;

    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    // Use raw SQL for monthly summary
    const [summaryResults] = await sequelize.query(`
      SELECT
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(oi.quantity), 0) as total_items_sold,
        COALESCE(SUM(oi.quantity * oi.price_at_order), 0) as total_earnings
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.created_at >= :startOfMonth
        AND o.created_at <= :endOfMonth
        AND o.status != 'cancelled'
    `, {
      replacements: {
        startOfMonth: startOfMonth.toISOString(),
        endOfMonth: endOfMonth.toISOString()
      }
    });

    // Get daily breakdown
    const [dailyResults] = await sequelize.query(`
      SELECT
        DATE(o.created_at) as date,
        COUNT(DISTINCT o.id) as orders,
        COALESCE(SUM(oi.quantity), 0) as items_sold,
        COALESCE(SUM(oi.quantity * oi.price_at_order), 0) as earnings
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.created_at >= :startOfMonth
        AND o.created_at <= :endOfMonth
        AND o.status != 'cancelled'
      GROUP BY DATE(o.created_at)
      ORDER BY date
    `, {
      replacements: {
        startOfMonth: startOfMonth.toISOString(),
        endOfMonth: endOfMonth.toISOString()
      }
    });

    const summary = summaryResults[0];

    res.json({
      year: targetYear,
      month: targetMonth,
      month_name: startOfMonth.toLocaleString('default', { month: 'long' }),
      total_earnings: parseFloat(summary.total_earnings).toFixed(2),
      total_orders: parseInt(summary.total_orders),
      total_items_sold: parseInt(summary.total_items_sold),
      daily_breakdown: dailyResults.map(day => ({
        date: day.date,
        orders: parseInt(day.orders),
        items_sold: parseInt(day.items_sold),
        earnings: parseFloat(day.earnings).toFixed(2)
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get top-selling products
exports.getTopSellingProducts = async (req, res) => {
  try {
    const { limit = 10, period } = req.query;

    let dateFilter = '';

    // Filter by time period if specified
    if (period) {
      const now = new Date();
      let startDate;

      switch (period) {
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        dateFilter = `AND o.created_at >= '${startDate.toISOString()}'`;
      }
    }

    // Use raw SQL query - rank by number of orders (not quantity)
    const [results] = await sequelize.query(`
      SELECT
        oi.product_id,
        p.name as product_name,
        p.description as product_description,
        p.price as current_price,
        COUNT(DISTINCT o.id) as order_count,
        SUM(oi.quantity) as total_quantity_sold,
        SUM(oi.quantity * oi.price_at_order) as total_revenue
      FROM order_items oi
      INNER JOIN orders o ON oi.order_id = o.id
      INNER JOIN products p ON oi.product_id = p.id
      WHERE o.status != 'cancelled' ${dateFilter}
      GROUP BY oi.product_id, p.id, p.name, p.description, p.price
      ORDER BY order_count DESC, total_quantity_sold DESC
      LIMIT ${parseInt(limit)}
    `);

    const formattedProducts = results.map((item, index) => ({
      rank: index + 1,
      product_id: item.product_id,
      product_name: item.product_name,
      product_description: item.product_description,
      current_price: item.current_price,
      order_count: parseInt(item.order_count),
      total_quantity_sold: parseInt(item.total_quantity_sold),
      total_revenue: parseFloat(item.total_revenue).toFixed(2)
    }));

    res.json({
      period: period || 'all_time',
      limit: parseInt(limit),
      top_selling_products: formattedProducts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get comprehensive sales summary
exports.getSalesSummary = async (req, res) => {
  try {
    // Total revenue (all time)
    const allOrders = await Order.findAll({
      where: {
        status: {
          [Op.notIn]: ['cancelled']
        }
      },
      include: [{
        model: OrderItem,
        attributes: ['quantity', 'priceAtOrder']
      }]
    });

    let totalRevenue = 0;
    allOrders.forEach(order => {
      order.OrderItems.forEach(item => {
        totalRevenue += item.quantity * item.priceAtOrder;
      });
    });

    // Order statistics by status
    const orderStats = await Order.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const statusCounts = {};
    orderStats.forEach(stat => {
      statusCounts[stat.status] = parseInt(stat.dataValues.count);
    });

    res.json({
      total_revenue: totalRevenue.toFixed(2),
      total_orders: allOrders.length,
      order_status_breakdown: statusCounts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
