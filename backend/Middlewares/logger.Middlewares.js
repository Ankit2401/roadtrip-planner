const fs = require('fs/promises');
const path = require('path');
const onFinished = require('on-finished');

// Create logs directory if it doesn't exist.
const logsDir = path.join(__dirname, '../logs');

// Asynchronous function to ensure the logs directory exists.
const ensureLogsDir = async () => {
    try {
        await fs.mkdir(logsDir, { recursive: true });
    } catch (err) {
        console.error('Failed to create logs directory:', err);
    }
};

// Immediately call the function to create the directory.
ensureLogsDir();

const logger = (req, res, next) => {
    // Record the start time of the request.
    const startTime = process.hrtime();

    // Log the incoming request to the console.
    const incomingLog = `[${new Date().toISOString()}] Incoming Request: ${req.method} ${req.originalUrl} from ${req.ip}`;
    console.log(incomingLog);

    // Use on-finished to log the response after it has been sent.
    onFinished(res, async (err) => {
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const responseTimeMs = (seconds * 1000) + (nanoseconds / 1e6);
        const logTimestamp = new Date().toISOString();
        const statusCode = res.statusCode;
        const statusMessage = res.statusMessage || '';

        const finishedLog = `[${logTimestamp}] Response: ${req.method} ${req.originalUrl} - Status: ${statusCode} ${statusMessage} - Duration: ${responseTimeMs.toFixed(2)}ms`;
        console.log(finishedLog);

        if (process.env.NODE_ENV === 'production') {
            const logEntry = `${incomingLog}\n${finishedLog}\n`;
            const logFile = path.join(logsDir, `access-${logTimestamp.split('T')[0]}.log`);
            
            try {
                await fs.appendFile(logFile, logEntry);
            } catch (writeErr) {
                console.error('Error writing to log file:', writeErr);
            }
        }
    });

    next();
};

module.exports = logger;