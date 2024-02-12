const http = require('http')
const { PORT } = require('./utils/constants')
const setupSocket = require('./socketManager');

const fileQuery = require('./queryManagers/front.js')
const apiQuery = require('./queryManagers/api.js')

const server = http.createServer(async function (request, response) {
    let filePath = request.url.split("/").filter(function (elem) {
        return elem !== "..";
    });

    try {
        if (filePath[1] === "api") {
            if (request.method === 'POST' && request.url === '/api/users') {
                handleCreateUser(request, response);
            } else if (request.method === 'GET' && request.url.startsWith('/api/login')) {
                handleLogin(request, response);
            } else {
                apiQuery.manage(request, response);
            }
        } else {
            fileQuery.manage(request, response);
        }
    } catch (error) {
        console.log(`error while processing ${request.url}: ${error}`)
        response.statusCode = 400;
        response.end(`Something in your request (${request.url}) is strange...`);
    }
});

setupSocket(server);

server.listen(PORT, function () {
    console.log(`Server is listening on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});

async function handleCreateUser(request, response) {
    try {
        let body = '';
        request.on('data', (chunk) => {
            body += chunk.toString();
        });

        request.on('end', async () => {
            const userData = JSON.parse(body);
            await addUser(userData);

            response.statusCode = 201;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify({ message: 'User created successfully' }));
        });
    } catch (error) {
        console.error('Error creating user:', error);
        response.statusCode = 500;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

async function handleLogin(request, response) {
    try {
        const username = request.url.split('=')[1];
        const user = await getUserByUsername(username);

        if (user) {
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify({ message: 'Login successful', user }));
        } else {
            response.statusCode = 404;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify({ error: 'User not found' }));
        }
    } catch (error) {
        console.error('Error logging in:', error);
        response.statusCode = 500;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({ error: 'Internal server error' }));
    }
}