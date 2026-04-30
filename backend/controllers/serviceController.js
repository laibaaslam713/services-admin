const Service = require('../models/Service');
const { validationResult } = require('express-validator');

exports.getServices = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '', status = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) filter.category = category;
    if (status) filter.status = status;

    const [services, total] = await Promise.all([
      Service.find(filter).sort({ created_at: -1 }).skip(skip).limit(parseInt(limit)),
      Service.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: services,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createService = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { title, description, image_url, category, status } = req.body;
    
    let finalImageUrl = image_url || '';
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    const service = await Service.create({
      title, description,
      image_url: finalImageUrl,
      category, status
    });

    res.status(201).json({ success: true, data: service, message: 'Service created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateService = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { title, description, image_url, category, status } = req.body;
    
    const updateData = { title, description, category, status };
    if (req.file) {
      updateData.image_url = `/uploads/${req.file.filename}`;
    } else if (image_url !== undefined) {
      updateData.image_url = image_url;
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: service, message: 'Service updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
