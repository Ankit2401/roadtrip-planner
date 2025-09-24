const rateLimitMap = new Map();

const rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
    return (req, res, next) => {
        const clientId = req.ip || req.connection.remoteAddress;
        const now = Date.now();

        // Get the client's data or initialize it if it's a new client
        let clientData = rateLimitMap.get(clientId);

        if (!clientData || now > clientData.resetTime) {
            // Reset the counter if it's a new client or the window has expired
            clientData = {
                count: 0,
                resetTime: now + windowMs,
            };
            rateLimitMap.set(clientId, clientData);
        }

        clientData.count++;

        if (clientData.count > maxRequests) {
            const retryAfterSeconds = Math.ceil((clientData.resetTime - now) / 1000);
            return res.status(429).json({
                message: 'Too many requests. Please try again later.',
                retryAfter: retryAfterSeconds,
            });
        }

        next();
    };
};

module.exports = rateLimiter;