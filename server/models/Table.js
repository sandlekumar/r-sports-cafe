const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  area: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area',
    required: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Table', TableSchema);
