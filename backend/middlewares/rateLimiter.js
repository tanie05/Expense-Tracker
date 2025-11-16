// Simple rate limiter middleware without external dependencies
// Stores IP addresses and their request counts in memory

const requestCounts = new Map();

// Clean up old entries every 15 minutes
setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of requestCounts.entries()) {
        if (now - data.resetTime > 15 * 60 * 1000) {
            requestCounts.delete(ip);
        }
    }
}, 15 * 60 * 1000);

const createRateLimiter = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000, // 15 minutes
        max = 5, // limit each IP to 5 requests per windowMs
        message = 'Too many requests, please try again later.'
    } = options;

    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();

        if (!requestCounts.has(ip)) {
            requestCounts.set(ip, {
                count: 1,
                resetTime: now
            });
            return next();
        }

        const data = requestCounts.get(ip);
        
        // Reset if window has passed
        if (now - data.resetTime > windowMs) {
            data.count = 1;
            data.resetTime = now;
            return next();
        }

        // Increment count
        data.count++;

        // Check if limit exceeded
        if (data.count > max) {
            return res.status(429).json({
                success: false,
                message: message
            });
        }

        next();
    };
};

// Rate limiter specifically for authentication endpoints
const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per 15 minutes
    message: 'Too many login/register attempts. Please try again after 15 minutes.'
});

module.exports = { authLimiter, createRateLimiter };

