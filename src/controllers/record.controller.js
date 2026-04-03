const recordService = require('../services/record.service');

class RecordController {
  async createRecord(req, res, next) {
    try {
      const record = await recordService.createRecord(req.body, req.user.id);
      res.status(201).json({
        success: true,
        message: 'Financial record created successfully',
        data: { record },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllRecords(req, res, next) {
    try {
      const result = await recordService.getAllRecords(req.query);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecordById(req, res, next) {
    try {
      const record = await recordService.getRecordById(req.params.id);
      res.status(200).json({
        success: true,
        data: { record },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRecord(req, res, next) {
    try {
      const record = await recordService.updateRecord(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Financial record updated successfully',
        data: { record },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteRecord(req, res, next) {
    try {
      const result = await recordService.deleteRecord(req.params.id);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RecordController();
