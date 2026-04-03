const { Op } = require('sequelize');
const { FinancialRecord, User } = require('../models');
const ApiError = require('../utils/ApiError');

class RecordService {
  /**
   * Create a new financial record
   */
  async createRecord(data, userId) {
    const record = await FinancialRecord.create({
      ...data,
      created_by: userId,
    });

    return record;
  }

  /**
   * Get all records with filtering, sorting, and pagination
   */
  async getAllRecords({ page = 1, limit = 20, type, category, startDate, endDate, search, sortBy = 'date', sortOrder = 'DESC' }) {
    const where = {};

    // Type filter
    if (type) {
      where.type = type;
    }

    // Category filter
    if (category) {
      where.category = { [Op.like]: `%${category}%` };
    }

    // Date range filter
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = startDate;
      if (endDate) where.date[Op.lte] = endDate;
    }

    // Search in description
    if (search) {
      where.description = { [Op.like]: `%${search}%` };
    }

    const offset = (page - 1) * limit;

    // Validate sort field
    const allowedSortFields = ['date', 'amount', 'type', 'category', 'created_at'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'date';
    const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const { count, rows } = await FinancialRecord.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email'],
      }],
      order: [[safeSortBy, safeSortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      records: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Get single record by ID
   */
  async getRecordById(id) {
    const record = await FinancialRecord.findByPk(id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email'],
      }],
    });

    if (!record) {
      throw ApiError.notFound('Financial record not found');
    }

    return record;
  }

  /**
   * Update a financial record
   */
  async updateRecord(id, data) {
    const record = await FinancialRecord.findByPk(id);

    if (!record) {
      throw ApiError.notFound('Financial record not found');
    }

    // Only update provided fields
    const allowedFields = ['amount', 'type', 'category', 'date', 'description'];
    const updates = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates[field] = data[field];
      }
    }

    await record.update(updates);
    return record;
  }

  /**
   * Soft delete a financial record
   */
  async deleteRecord(id) {
    const record = await FinancialRecord.findByPk(id);

    if (!record) {
      throw ApiError.notFound('Financial record not found');
    }

    await record.update({ is_deleted: true });
    return { message: 'Record deleted successfully' };
  }
}

module.exports = new RecordService();
