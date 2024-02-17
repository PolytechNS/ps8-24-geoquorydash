// config.js
module.exports.parseJSON = (req, callback) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            callback(null, data);
        } catch (err) {
            callback(err, null);
        }
    });
};

module.exports.arrayOfPositionContainsPosition = (array, position) => {
    for (let i = 0; i < array.length; i++) {
        if (array[i].x === position.x && array[i].y === position.y) {
            return true;
        }
    }
    return false;
}