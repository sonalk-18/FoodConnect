const { validationResult } = require('express-validator');
const partnerModel = require('../models/partnerModel');

exports.createApplication = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const payload = {
      userId: req.user.id,
      organizationName: req.body.organizationName,
      organizationType: req.body.organizationType,
      contactPerson: req.body.contactPerson,
      email: req.body.email || req.user.email,
      phone: req.body.phone,
      location: req.body.location,
      website: req.body.website,
      message: req.body.message,
      documentUrl: req.body.documentUrl
    };
    const application = await partnerModel.createPartnerApplication(payload);
    return res.status(201).json(application);
  } catch (error) {
    return next(error);
  }
};

exports.getPartners = async (req, res, next) => {
  try {
    const partners = await partnerModel.getPartners(req.query);
    return res.json(partners);
  } catch (error) {
    return next(error);
  }
};

exports.getPartner = async (req, res, next) => {
  try {
    const partner = await partnerModel.getPartnerById(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: 'Partner application not found' });
    }
    // Users can only view their own partner applications
    if (partner.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return res.json(partner);
  } catch (error) {
    return next(error);
  }
};

exports.getMyPartners = async (req, res, next) => {
  try {
    const partners = await partnerModel.getPartnersByUser(req.user.id);
    return res.json(partners);
  } catch (error) {
    return next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const partner = await partnerModel.getPartnerById(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: 'Partner application not found' });
    }
    const updated = await partnerModel.updatePartnerStatus(
      req.params.id,
      req.body.status,
      req.body.notes
    );
    return res.json(updated);
  } catch (error) {
    return next(error);
  }
};

