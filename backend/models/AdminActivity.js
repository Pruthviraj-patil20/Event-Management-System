const mongoose = require('mongoose');

const adminActivitySchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    adminName: {
      type: String,
      default: ''
    },
    action: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    targetType: {
      type: String,
      default: '',
      index: true
    },
    targetId: {
      type: String,
      default: ''
    },
    targetLabel: {
      type: String,
      default: ''
    },
    details: {
      type: String,
      default: ''
    },
    ip: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['success', 'error'],
      default: 'success'
    }
  },
  {
    timestamps: true
  }
);

adminActivitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdminActivity', adminActivitySchema);