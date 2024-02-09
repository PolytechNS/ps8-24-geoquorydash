// controllers/authController.js
const { generateToken } = require('./authentication');
const { parseJSON } = require('../../utils/utils.js');

function signup(req, res) {
    parseJSON(req, (err, { username, password }) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }
        console.log('Signup called');
        console.log(username, password);
        // Your signup logic here...
        const token = generateToken(username);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ token }));
    });
}

function login(req, res) {
    parseJSON(req, (err, { username, password }) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }
        console.log('Login called');
        console.log(username, password);
        // Your login logic here...
        const token = generateToken(username);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ token }));
    });
}

module.exports = { signup, login };