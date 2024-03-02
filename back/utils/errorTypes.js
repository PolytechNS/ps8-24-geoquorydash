class InvalidTokenError extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidTokenError";
    }
}

class DatabaseConnectionError extends Error {
    constructor(message) {
        super(message);
        this.name = "DatabaseConnectionError";
    }
}

module.exports = { InvalidTokenError, DatabaseConnectionError };