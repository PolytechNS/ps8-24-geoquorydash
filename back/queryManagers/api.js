// Main method, exported at the end of the file. It's the one that will be called when a REST request is received.
const statRouter = require('../logic/stat/statRouter');
const achievementsRouter = require('../logic/achievements/achievementsRouter');
const authRouter = require('../logic/authentification/authRouter');
const gameRouter = require('../logic/game/gameRouter');
const friendsRouter = require('../logic/friends/friendsRouter');
const profileRouter = require('../logic/profile/profileRouter');
const chatRouter = require('../logic/chat/chatRouter');
const configurationRouter = require('../logic/configuration/configurationRouter');

function manageRequest(request, response) {
    addCors(response);

    if (request.method === 'OPTIONS') {
        response.writeHead(204);
        response.end();
        return;
    }

    if (request.url.startsWith('/api/stat')) {
        statRouter(request, response).then();
    }
    if (request.url.startsWith('/api/achievements')) {
        achievementsRouter(request, response).then();
    }
    if (request.url.startsWith('/api/auth')) {
        authRouter(request, response).then();
    }
    if (request.url.startsWith('/api/game')) {
        gameRouter(request, response).then(() => {
            response.end();
        });
    }
    if (request.url.startsWith('/api/friends')) {
        friendsRouter(request, response).then();
    }
    if (request.url.startsWith('/api/profile')) {
        profileRouter(request, response).then();
    }
    if (request.url.startsWith('/api/chat')) {
        chatRouter(request, response).then();
    }
    if (request.url.startsWith('/api/configuration')) {
        configurationRouter(request, response).then();
    }

    response.statusCode = 200;
}

/* This method is a helper in case you stumble upon CORS problems. It shouldn't be used as-is:
** Access-Control-Allow-Methods should only contain the authorized method for the url that has been targeted
** (for instance, some of your api urls may accept GET and POST request whereas some others will only accept PUT).
** Access-Control-Allow-Headers is an example of how to authorize some headers, the ones given in this example
** are probably not the ones you will need. */
function addCors(response) {
    // Website you wish to allow to connect to your server.
    response.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow.
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow.
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent to the API.
    response.setHeader('Access-Control-Allow-Credentials', true);
}

exports.manage = manageRequest;