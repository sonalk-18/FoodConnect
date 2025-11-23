const { body, validationResult } = require('express-validator');

const withValidationErrors = (chains) => [
  ...chains,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    return next();
  }
];

const validateSignup = withValidationErrors([
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['donor', 'receiver']).withMessage('Role must be donor or receiver')
]);

const validateLogin = withValidationErrors([
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
]);

const validateFood = withValidationErrors([
  body('name').trim().notEmpty().withMessage('Food name required'),
  body('description').trim().notEmpty().withMessage('Description required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').trim().notEmpty().withMessage('Category required')
]);

const validateOrder = withValidationErrors([
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be an array')
    .custom((items) =>
      items.every(
        (item) =>
          item &&
          Number.isInteger(item.foodId) &&
          Number.isInteger(item.qty) &&
          item.qty > 0
      )
    )
    .withMessage('Each item must include foodId and qty (integers > 0)')
]);

const validateRoleUpdate = withValidationErrors([
  body('role').isIn(['donor', 'receiver']).withMessage('Role must be donor or receiver')
]);

const validateCartItem = withValidationErrors([
  body('foodId').isInt({ min: 1 }).withMessage('foodId must be a positive integer'),
  body('qty').isInt({ min: 1 }).withMessage('qty must be at least 1')
]);

const validateStatusUpdate = withValidationErrors([
  body('status')
    .isIn(['placed', 'processing', 'completed', 'cancelled'])
    .withMessage('Invalid order status')
]);

const validateDonation = withValidationErrors([
  body('donorType').isIn(['individual', 'restaurant', 'event', 'other']).withMessage('Invalid donor type'),
  body('contactName').trim().notEmpty().withMessage('Contact name is required'),
  body('contactPhone')
    .trim()
    .matches(/^[0-9+\-\s]{7,15}$/)
    .withMessage('Valid phone number required'),
  body('foodType').trim().notEmpty().withMessage('Food type required'),
  body('quantity').trim().notEmpty().withMessage('Quantity is required'),
  body('pickupAddress').trim().notEmpty().withMessage('Pickup address required'),
  body('pickupWindow').trim().notEmpty().withMessage('Pickup time window required')
]);

const validatePartner = withValidationErrors([
  body('organizationName').trim().notEmpty().withMessage('Organization name required'),
  body('contactPerson').trim().notEmpty().withMessage('Contact person required'),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('phone')
    .trim()
    .matches(/^[0-9+\-\s]{7,15}$/)
    .withMessage('Valid phone number required'),
  body('location').trim().notEmpty().withMessage('Location required'),
  body('organizationType').isIn(['ngo', 'restaurant', 'volunteer', 'sponsor']).withMessage('Invalid organization type')
]);

const validateReward = withValidationErrors([
  body('title').trim().notEmpty().withMessage('Title required'),
  body('pointsRequired').isInt({ min: 1 }).withMessage('Points required must be at least 1'),
  body('inventory').optional().isInt({ min: 0 }).withMessage('Inventory must be positive'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
]);

const validateGame = withValidationErrors([
  body('title').trim().notEmpty().withMessage('Title required'),
  body('url').isURL().withMessage('Valid game URL required'),
  body('pointsPerPlay').isInt({ min: 0 }).withMessage('Points per play must be 0 or more')
]);

const validatePointsAward = withValidationErrors([
  body('points').isInt({ min: 1 }).withMessage('Points must be at least 1'),
  body('sourceType').isIn(['game', 'donation', 'manual']).withMessage('Invalid source type'),
  body('sourceId').optional().isInt({ min: 1 }).withMessage('sourceId must be positive'),
  body('note').optional().isLength({ max: 255 }).withMessage('Note too long')
]);

module.exports = {
  validateSignup,
  validateLogin,
  validateFood,
  validateOrder,
  validateRoleUpdate,
  validateCartItem,
  validateStatusUpdate,
  validateDonation,
  validatePartner,
  validateReward,
  validateGame,
  validatePointsAward
};

