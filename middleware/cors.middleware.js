function cors(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Max-Age", "86400")
    res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE")
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
    res.header("Access-Control-Expose-Headers", "Content-Length")
    res.header("Access-Control-Allow-Credentials", "true")
    next();
}

module.exports = cors



