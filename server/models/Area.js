const mongoose = require('mongoose');

const AreaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Area', AreaSchema);
