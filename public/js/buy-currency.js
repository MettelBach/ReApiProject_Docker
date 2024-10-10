function formatInput(input) {
    input.value = parseFloat(input.value).toFixed(2);
}

document.getElementById("amountFrom").value = "0.00";
    
function convertCurrency() {
    const amount = document.getElementById('amountFrom').value;
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const resultElement = document.getElementById('result');
    const priceOne = document.querySelector('.price-one');
    const priceTwo = document.querySelector('.price-two');

    fetch(`/convert?from=${from}&to=${to}&amount=${amount}`)
    .then(response => response.json())
    .then(data => {
        resultElement.value = parseFloat(data.convertedAmount).toFixed(2);

        const exchangeRate = data.exchangeRate; 
        const inverseRate = data.inverseRate;
        priceOne.textContent = `1 ${from.toUpperCase()} = ${inverseRate.toFixed(3)} ${to.toUpperCase()}`;
        priceTwo.textContent = `1 ${to.toUpperCase()} = ${exchangeRate.toFixed(3)} ${from.toUpperCase()}`;
    })
    .catch(error => {
        resultElement.value = "0.00";
        throw Error('Error: Cannot do this operation');
    });
}

document.getElementById('amountFrom').addEventListener('input', convertCurrency);
document.getElementById('from').addEventListener('change', convertCurrency);
document.getElementById('to').addEventListener('change', convertCurrency);

convertCurrency();

const currencies = [
    { code: 'PLN', name: 'Polish Złoty' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'UAH', name: 'Ukrainian Hryvnia' }
];

const fromSelect = document.getElementById('from');
const toSelect = document.getElementById('to');

const fromOption = new Option("Polish Złoty" + ` (PLN)`, "PLN");

currencies.forEach(currency => {
    const toOption = new Option(currency.name + ` (${currency.code})`, currency.code);
    fromSelect.appendChild(fromOption);
    toSelect.appendChild(toOption);
});
