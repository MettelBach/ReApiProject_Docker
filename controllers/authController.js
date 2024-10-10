const User = require("../models/User");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");

// handle errors
const handleErrors = (error) => {
    console.log("\n", error.message, "\n", error.code,"\n");
    let errors = { 
        email: "",
        password: "",
        name: "",
        surname: "",
        phone: "",
        amount: ""
    };

    if (error.message === "0 or lower") {
        errors.amount = "You can't send 0 or lower than 0!";
    } else if (error.message === "No money on account") {
        errors.amount = "Not enough money. Top up your account!";
    }

    if (error.message === "Incorrect email") {
        errors.email = "That email is not registered";
    } else if (error.message === "No email of that user") {
        errors.email = "User with this email is not registered!";
    } else if (error.message === "Same email") {
        errors.email = "You cannot send money to you!";
    }

    if (error.message === "Incorrect password") {
        errors.password = "That password is incorrect";
    } else if (error.message === 'Password length update error') {
        errors.password = 'Password must contains more than 5 symbols';
    }

    if (error.code === 11000) {
        const indexNames = Object.keys(error.keyPattern);
        indexNames.forEach((indexName) => {
            if (indexName === "email") {
                errors.email = "Email is already registered";
            } else if (indexName === "phone") {
                errors.phone = "Phone number is already registered";
            }
        });

        return errors;
    }    

    if (error.message.includes("user validation failed")) {
        Object.values(error.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;
};

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, "mettel bach secret", { expiresIn: maxAge });
}

module.exports.signup_post = async (req, res) => {
    const { email, password, name, surname, phone } = req.body;

    try {
        const user = await User.create({ email, password, name, surname, phone });
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(201).json({ user: user._id });
    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    }
}

module.exports.signin_post = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user: user._id });
    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    }
}

module.exports.logout_get = (req, res) => {
    res.clearCookie("jwt");
    res.redirect("/");
}

module.exports.delete_account = async (req, res) => {
    try {
        const token_ = req.cookies.jwt;
        const decodedToken = jwt.verify(token_, 'mettel bach secret');
        const userId = decodedToken.id;

        await User.findByIdAndDelete(userId);
        res.clearCookie("jwt");
        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.update_profile = async (req, res) => {
    const { name, surname, phone, email, newPassword } = req.body;

    try {
        const token_ = req.cookies.jwt;
        const decodedToken = jwt.verify(token_, 'mettel bach secret');
        const userId = decodedToken.id;

        const user = await User.findById(userId);

        if (name) user.name = name;
        if (surname) user.surname = surname;
        if (phone) user.phone = phone;
        if (email) user.email = email;
        if (newPassword) {
            if (newPassword.length >= 6) {
                let hashedPassword = await argon2.hash(newPassword);
                user.password = hashedPassword;
            } else {
                throw Error("Password length update error");
            }
        }
        

        await user.save();

        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });

        res.status(200).json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    }
};


module.exports.send_money_post = async (req, res) => {
    const { email, amount, currency } = req.body;

    try {
        const token_ = req.cookies.jwt;
        const decodedToken = jwt.verify(token_, 'mettel bach secret');
        const senderId = decodedToken.id;
        const sender = await User.findById(senderId);

        const recipient = await User.findOne({ email });
        if (!recipient) {
            throw Error("No email of that user");
        }

        if (email === sender.email) {
            throw Error("Same email");
        }

        if (amount <= 0) {
            throw Error("0 or lower");
        }

        if (sender.wallet[currency] < amount) {
            throw Error("No money on account");
        }

        sender.wallet[currency] = parseFloat(sender.wallet[currency]) - parseFloat(amount);
        recipient.wallet[currency] = parseFloat(recipient.wallet[currency]) + parseFloat(amount);        

        await sender.save();
        await recipient.save();

        const token = createToken(senderId);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ success: true, message: "Money sent successfully!" });
    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    }
};
