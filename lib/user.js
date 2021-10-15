let db = require('./db');

async function fetchUserTokenFormDatabase(userId) {
    const [ rows, field ] = await db.executeQuery("SELECT token FROM user_token WHERE user_id = " + userId);
        
    return rows[0].token;
}

module.exports = {
    fetchUserTokenFormDatabase: fetchUserTokenFormDatabase
}