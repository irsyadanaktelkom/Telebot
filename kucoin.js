async function getData() {
    try {
        const currencyResponse = await fetch('https://api.kucoin.com/api/v3/currencies');
        const currencyData = await currencyResponse.json();

        return { currencies: currencyData.data };
    } catch (error) {
        console.error('Error fetching data from KuCoin:', error);
        return null;
    }
}

module.exports = { getData };
