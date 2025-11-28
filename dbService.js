const fetch = require('node-fetch');

const DB_API_URL = process.env.DB_API_URL || 'https://api.example.com';

// ===== User Data Functions =====

/**
 * Get user data from external database
 * @param {number} userId - Telegram user ID
 * @returns {Promise<Object>} User data object
 */
async function getUserData(userId) {
    try {
        const response = await fetch(`${DB_API_URL}/users/${userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                // User not found - return default structure
                return null;
            }
            throw new Error(`DB API Error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        throw error;
    }
}

/**
 * Register new user in database
 * @param {number} userId - Telegram user ID
 * @param {string} username - Telegram username
 * @param {string} firstName - User's first name
 * @param {string} referrerId - Referrer's user ID (optional)
 * @returns {Promise<Object>} Created user data
 */
async function createUser(userId, username, firstName, referrerId = null) {
    try {
        const response = await fetch(`${DB_API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                username,
                firstName,
                balance: 0.00,
                referrerId,
                completedTasks: 0,
                referralCount: 0,
                totalEarnings: 0.00,
                createdAt: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error(`DB API Error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error creating user ${userId}:`, error);
        throw error;
    }
}

/**
 * Update user balance
 * @param {number} userId - Telegram user ID
 * @param {number} amount - Amount to add to balance
 * @returns {Promise<Object>} Updated user data
 */
async function updateBalance(userId, amount) {
    try {
        const response = await fetch(`${DB_API_URL}/users/${userId}/balance`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        });
        
        if (!response.ok) {
            throw new Error(`DB API Error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error updating balance for user ${userId}:`, error);
        throw error;
    }
}

/**
 * Add referral bonus
 * @param {number} referrerId - Referrer's user ID
 * @param {number} amount - Bonus amount (0.50 ETB for 5%)
 * @returns {Promise<Object>} Updated user data
 */
async function addReferralBonus(referrerId, amount) {
    try {
        const response = await fetch(`${DB_API_URL}/users/${referrerId}/referral-bonus`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        });
        
        if (!response.ok) {
            throw new Error(`DB API Error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error adding referral bonus for user ${referrerId}:`, error);
        throw error;
    }
}

/**
 * Get all user IDs for broadcast
 * @returns {Promise<Array>} Array of user IDs
 */
async function getAllUserIds() {
    try {
        const response = await fetch(`${DB_API_URL}/users/all/ids`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`DB API Error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.userIds || [];
    } catch (error) {
        console.error('Error fetching all user IDs:', error);
        return [];
    }
}

/**
 * Get user statistics
 * @param {number} userId - Telegram user ID
 * @returns {Promise<Object>} User statistics
 */
async function getUserStats(userId) {
    try {
        const response = await fetch(`${DB_API_URL}/users/${userId}/stats`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`DB API Error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error fetching stats for user ${userId}:`, error);
        throw error;
    }
}

/**
 * Record completed task
 * @param {number} userId - Telegram user ID
 * @param {string} taskType - Type of task (e.g., 'gmail')
 * @param {number} amount - Amount earned
 * @returns {Promise<Object>} Task record
 */
async function recordCompletedTask(userId, taskType, amount) {
    try {
        const response = await fetch(`${DB_API_URL}/tasks/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                taskType,
                amount,
                completedAt: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error(`DB API Error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error recording task for user ${userId}:`, error);
        throw error;
    }
}

module.exports = {
    getUserData,
    createUser,
    updateBalance,
    addReferralBonus,
    getAllUserIds,
    getUserStats,
    recordCompletedTask
};
