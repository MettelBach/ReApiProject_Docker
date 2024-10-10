const axios = require("axios");

module.exports.get_currencies = async (req, res) => {
    const { from, to, amount } = req.query;
    try {
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            return res.status(400).json({ error: "Amount must be a positive number." });
        }

        let fromRatePLN = from === "PLN" ? 1 : await getRateFromNBP(from);
        let toRatePLN = to === "PLN" ? 1 : await getRateFromNBP(to);

        const exchangeRate = toRatePLN / fromRatePLN; 
        const inverseRate = 1 / exchangeRate;

        const amountInPLN = amountNum * fromRatePLN; 
        const convertedAmount = amountInPLN / toRatePLN;

        res.json({
            convertedAmount: parseFloat(convertedAmount.toFixed(2)),
            exchangeRate: parseFloat(exchangeRate.toFixed(4)),
            inverseRate: parseFloat(inverseRate.toFixed(4))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred during the conversion." });
    }
}

async function getRateFromNBP(currencyCode) {
    const response = await axios.get(`http://api.nbp.pl/api/exchangerates/rates/a/${currencyCode}/?format=json`);
    return response.data.rates[0].mid;
}