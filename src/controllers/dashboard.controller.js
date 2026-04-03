const dashboardService = require('../services/dashboard.service');

class DashboardController {
  async getSummary(req, res, next) {
    try {
      const summary = await dashboardService.getSummary();
      res.status(200).json({
        success: true,
        data: { summary },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategorySummary(req, res, next) {
    try {
      const categories = await dashboardService.getCategorySummary();
      res.status(200).json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTrends(req, res, next) {
    try {
      const { months } = req.query;
      const trends = await dashboardService.getTrends({ months: months ? parseInt(months) : 12 });
      res.status(200).json({
        success: true,
        data: { trends },
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecentActivity(req, res, next) {
    try {
      const { limit } = req.query;
      const activities = await dashboardService.getRecentActivity({ limit: limit ? parseInt(limit) : 10 });
      res.status(200).json({
        success: true,
        data: { activities },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
