

const axios = require('axios');

// Keeps the Render backend awake by sending periodic self-pings.
const setupAutoPing = () => {

    if (!process.env.AUTO_PING_URL) {
        console.warn('[Auto-Ping] AUTO_PING_URL is not defined');
        return; // stops execution
    }
    const URL = process.env.AUTO_PING_URL || 'http://localhost:4000/keep-alive'; // Endpoint used for keep-alive checks
    const INTERVAL = 14 * 60 * 1000; // Runs every 14 minutes to prevent idle sleep


    console.log('[Auto-Ping] Keep-alive system initialized.');

    setInterval(async () => {
        try {
            const response = await axios.get(URL); // Send GET request to keep the service active
            console.log(`[Auto-Ping] Successful ping: ${response.data} (${new Date().toLocaleTimeString()})`);
        } catch (error) {
            console.error('[Auto-Ping] Ping failed:', error.message); // Log error if request fails
        }
    }, INTERVAL);
};

module.exports = setupAutoPing;