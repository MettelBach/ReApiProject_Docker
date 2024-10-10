document.addEventListener('DOMContentLoaded', function() {
    const currencies = ['USD', 'EUR', 'UAH'];

    currencies.forEach(currency => {
        fetch(`/convert?from=${currency}&to=PLN&amount=1`)
            .then(response => response.json())
            .then(data => {
                const convertedAmount = data.convertedAmount;
                const listItem = document.querySelector(`.${currency}`);
                listItem.textContent = `1 ${currency} - ${convertedAmount.toFixed(2)} PLN`;
            })
            .catch(error => {
                console.error(`Error retrieving conversion rate for ${currency}:`, error);
            });
    });
});
