const User = require("../models/User");
const PayU = require("../public/js/payu-requests");
const jwt = require("jsonwebtoken");

merchantConfig = {
    merchantPosId: process.env.MERCHANT_POS_ID,
    key: process.env.KEY,
    currencyCode: "PLN"
}

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, "mettel bach secret", {
        expiresIn: maxAge
    });
}

PayU.setDefaultMerchant(merchantConfig);

module.exports.payment = async (req, res) => {
    try {
        const token_ = req.cookies.jwt;
        const decodedToken = jwt.verify(token_, 'mettel bach secret');
        const userId = decodedToken.id;

        const userIp = await fetch("https://ipinfo.io/json")
            .then(response => response.json())
            .then(data => {
                console.log("IP address of user:", data.ip);
                return data.ip;
            })
            .catch(error => {
                console.error("Error of getting IP:", error);
                throw new Error('Error of getting IP');
            });

        const amountFrom = req.body.amountFrom;
        const orderData = {
            customerIp: userIp,
            description: `Buying from ${amountFrom} ${merchantConfig.currencyCode} to ${req.body.amountTo} ${req.body.toCurrency}`,
            totalAmount: (parseInt((amountFrom * 100).toFixed(0))).toString(),
            products: [{
                name: `Buying ${req.body.amountTo} ${req.body.toCurrency}`,
                unitPrice: (parseInt((amountFrom * 100).toFixed(0))).toString(),
                quantity: 1
            }]
        };

        console.log(orderData);

        const response = await new Promise((resolve, reject) => {
            PayU.API.createOrder(orderData, (err, response) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(response);
                }
            });
        });

        if (response.body.status.statusCode === "SUCCESS") {
            const recipient = await User.findById(userId);
            const amountToAdd = parseFloat(req.body.amountTo);
            const currentAmount = parseFloat(recipient.wallet[req.body.toCurrency]);

            recipient.wallet[req.body.toCurrency] = (currentAmount + amountToAdd).toFixed(2);
            await recipient.save();
            const token = createToken(userId);
            res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
            console.log(`Successfully added ${req.body.amountTo} ${req.body.toCurrency} to user with ID ${userId}`);
        }

        res.status(200).json({ 
            message: "Link has been created",
            redirectUri: response.body.redirectUri
        });

    } catch (error) {
        console.error("Error creating order or updating recipient's wallet:", error);
        res.status(500).json({ error: "Error creating order or updating recipient's wallet" });
    }
};
