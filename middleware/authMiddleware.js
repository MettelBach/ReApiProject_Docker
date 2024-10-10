const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, "mettel bach secret", (error, decodedToken) => {
            if (error) {
                console.log(error.message);
                res.redirect("/signin");
            } else {
                console.log(decodedToken);
                next();
            }
        });
    } else {
        res.redirect("/signin");
    }
};

const requireUnAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, "mettel bach secret", (error, decodedToken) => {
            if (error) {
                next();
            } else {
                res.redirect("/account");
            }
        });
    } else {
        next();
    }
};

const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, "mettel bach secret", async (error, decodedToken) => {
            if (error) {
                console.log(error.message);
                res.locals.user = null;
                next();
            } else {
            // console.log(JWT: decodedToken);
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
};

module.exports = { requireAuth, checkUser, requireUnAuth }
