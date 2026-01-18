const { isFeatureEnabled } = require('../helper/featureFlagHelper');

/**
 * Middleware to check if a feature is enabled before allowing access
 * @param {string} featureName - Name of the feature flag to check
 */
function requireFeatureFlag(featureName) {
  return async (req, res, next) => {
    try {
      const userId = req.user?._id?.toString() || req.user?.id?.toString();
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
      }

      const { enabled } = await isFeatureEnabled(userId, featureName);
      
      if (!enabled) {
        return res.status(403).json({
          success: false,
          message: 'This feature is currently unavailable'
        });
      }

      next();
    } catch (error) {
      console.error('Feature flag middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking feature availability'
      });
    }
  };
}

module.exports = { requireFeatureFlag };
