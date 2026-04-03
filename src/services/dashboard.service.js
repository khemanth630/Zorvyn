const { Op, fn, col, literal } = require('sequelize');
const { FinancialRecord } = require('../models');

class DashboardService {
  /**
   * Get overall financial summary: total income, expenses, and net balance.
   */
  async getSummary() {
    const [incomeResult, expenseResult] = await Promise.all([
      FinancialRecord.sum('amount', { where: { type: 'income' } }),
      FinancialRecord.sum('amount', { where: { type: 'expense' } }),
    ]);

    const totalIncome = parseFloat(incomeResult) || 0;
    const totalExpenses = parseFloat(expenseResult) || 0;
    const netBalance = totalIncome - totalExpenses;

    const totalRecords = await FinancialRecord.count();

    return {
      totalIncome: parseFloat(totalIncome.toFixed(2)),
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      netBalance: parseFloat(netBalance.toFixed(2)),
      totalRecords,
    };
  }

  /**
   * Get category-wise breakdown of income and expenses.
   */
  async getCategorySummary() {
    const results = await FinancialRecord.findAll({
      attributes: [
        'category',
        'type',
        [fn('SUM', col('amount')), 'total'],
        [fn('COUNT', col('id')), 'count'],
      ],
      group: ['category', 'type'],
      order: [[fn('SUM', col('amount')), 'DESC']],
      raw: true,
    });

    // Group by category
    const categories = {};
    for (const row of results) {
      if (!categories[row.category]) {
        categories[row.category] = {
          category: row.category,
          income: 0,
          expense: 0,
          incomeCount: 0,
          expenseCount: 0,
        };
      }
      categories[row.category][row.type] = parseFloat(row.total) || 0;
      categories[row.category][`${row.type}Count`] = parseInt(row.count) || 0;
    }

    return Object.values(categories).map((cat) => ({
      ...cat,
      net: parseFloat((cat.income - cat.expense).toFixed(2)),
    }));
  }

  /**
   * Get monthly trends for income and expenses.
   * Returns data grouped by year-month.
   */
  async getTrends({ months = 12 } = {}) {
    // Calculate start date: `months` months ago from today
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    const startDateStr = startDate.toISOString().split('T')[0];

    const results = await FinancialRecord.findAll({
      attributes: [
        [fn('strftime', '%Y-%m', col('date')), 'month'],
        'type',
        [fn('SUM', col('amount')), 'total'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: {
        date: { [Op.gte]: startDateStr },
      },
      group: [literal("strftime('%Y-%m', date)"), 'type'],
      order: [[literal("strftime('%Y-%m', date)"), 'ASC']],
      raw: true,
    });

    // Group by month
    const trends = {};
    for (const row of results) {
      if (!trends[row.month]) {
        trends[row.month] = {
          month: row.month,
          income: 0,
          expense: 0,
          net: 0,
        };
      }
      trends[row.month][row.type] = parseFloat(row.total) || 0;
    }

    // Calculate net for each month
    return Object.values(trends).map((t) => ({
      ...t,
      net: parseFloat((t.income - t.expense).toFixed(2)),
    }));
  }

  /**
   * Get recent financial activities.
   */
  async getRecentActivity({ limit = 10 } = {}) {
    const records = await FinancialRecord.findAll({
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
    });

    return records;
  }
}

module.exports = new DashboardService();
