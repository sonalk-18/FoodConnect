const { validationResult } = require('express-validator');
const donationModel = require('../models/donationModel');
const pointsModel = require('../models/pointsModel');
const userModel = require('../models/userModel');

const DONATION_POINTS = Number(process.env.DONATION_POINTS || 50);

const awardDonationPoints = async (userId, donationId) => {
  if (DONATION_POINTS <= 0) return null;
  await pointsModel.addEntry({
    userId,
    points: DONATION_POINTS,
    sourceType: 'donation',
    sourceId: donationId,
    note: 'Thanks for donating food!',
    direction: 'credit'
  });
  await userModel.incrementPoints(userId, DONATION_POINTS);
  return DONATION_POINTS;
};

exports.createDonation = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const payload = {
      userId: req.user.id,
      donorType: req.body.donorType,
      contactName: req.body.contactName,
      contactPhone: req.body.contactPhone,
      contactEmail: req.body.contactEmail || req.user.email,
      foodType: req.body.foodType,
      quantity: req.body.quantity,
      pickupAddress: req.body.pickupAddress,
      pickupWindow: req.body.pickupWindow,
      notes: req.body.notes
    };

    const donation = await donationModel.createDonation(payload);
    const awarded = await awardDonationPoints(req.user.id, donation.id);

    return res.status(201).json({
      donation,
      pointsAwarded: awarded
    });
  } catch (error) {
    return next(error);
  }
};

exports.getDonations = async (req, res, next) => {
  try {
    const donations = await donationModel.getDonations(req.query);
    return res.json(donations);
  } catch (error) {
    return next(error);
  }
};

exports.getDonation = async (req, res, next) => {
  try {
    const donation = await donationModel.getDonationById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    // Users can only view their own donations
    if (donation.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return res.json(donation);
  } catch (error) {
    return next(error);
  }
};

exports.getMyDonations = async (req, res, next) => {
  try {
    const donations = await donationModel.getDonationsByUser(req.user.id);
    return res.json(donations);
  } catch (error) {
    return next(error);
  }
};

exports.updateDonationStatus = async (req, res, next) => {
  try {
    const donation = await donationModel.getDonationById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const updated = await donationModel.updateDonationStatus(
      req.params.id,
      req.body.status,
      req.body.assignedVolunteer
    );
    return res.json(updated);
  } catch (error) {
    return next(error);
  }
};

