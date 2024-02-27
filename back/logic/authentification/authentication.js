// authentication.js
const jwt = require('jsonwebtoken');
const JWT_SECRET_KEY = 'secret_key';

module.exports.generateToken = (userID) => {
    return jwt.sign({ userID }, JWT_SECRET_KEY);
};

module.exports.verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET_KEY);
};