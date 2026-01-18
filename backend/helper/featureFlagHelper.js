const axios = require('axios');
const http = require('http');

/**
 * Check if a feature is enabled for a user
 * @param {string} userId - User ID
 * @param {string} featureName - Feature flag name
 * @returns {Promise<{enabled: boolean, source?: string}>} - Feature flag status
 */
async function isFeatureEnabled(userId, featureName) {
  try {
    // Read from process.env at runtime, not at module load time
    const FEATURE_FLAG_SERVICE_URL = process.env.FEATURE_FLAG_SERVICE_URL || 'http://127.0.0.1:5001';
    const FEATURE_FLAG_SECRET = process.env.FEATURE_FLAG_SECRET;

    if (!FEATURE_FLAG_SECRET) {
      console.warn('FEATURE_FLAG_SECRET not set, defaulting feature flag to false');
      return { enabled: false, source: 'error' };
    }

    // Force IPv4 by using 127.0.0.1 if localhost is detected
    let serviceUrl = FEATURE_FLAG_SERVICE_URL;
    if (serviceUrl.includes('localhost')) {
      serviceUrl = serviceUrl.replace('localhost', '127.0.0.1');
    }

    // Create HTTP agent that forces IPv4
    const httpAgent = new http.Agent({
      family: 4, // Force IPv4
      keepAlive: true
    });

    const response = await axios.get(`${serviceUrl}/flags/evaluate`, {
      params: {
        user_id: userId,
        feature_name: featureName
      },
      headers: {
        'X-Service-Token': FEATURE_FLAG_SECRET,
        'Content-Type': 'application/json'
      },
      httpAgent: httpAgent,
      timeout: 5000
    });

    console.log(response.data)

    return {
      enabled: response.data.enabled === true,
      source: response.data.source
    };
  } catch (error) {
    console.error('Error checking feature flag:', error.message);
    // Default to false if feature flag service is unavailable
    return { enabled: false, source: 'error' };
  }
}

module.exports = { isFeatureEnabled };
