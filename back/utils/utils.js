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
        if (this.arePositionsEquals(array[i], position)) {
            return true;
        }
    }
    return false;
}

module.exports.arePositionsEquals = (position1, position2) => {
    return position1.x === position2.x && position1.y === position2.y;
}