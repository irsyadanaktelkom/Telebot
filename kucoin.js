const fetch = require('node-fetch');

async function getCurrencies() {
    try {
        const response = await fetch('65d20bd58a137d0001734757');
        const responseData = await response.json();

        // Extracting data from the response
        const currencies = responseData.data.map(currency => {
            const { currency: symbol, name, fullName, chains } = currency;
            const formattedChains = chains.map(chain => {
                const {
                    chainName,
                    withdrawalMinSize,
                    withdrawalMinFee,
                    isWithdrawEnabled,
                    isDepositEnabled,
                    confirms,
                    preConfirms,
                    contractAddress,
                    chainId
                } = chain;
                return {
                    chainName,
                    withdrawalMinSize,
                    withdrawalMinFee,
                    isWithdrawEnabled,
                    isDepositEnabled,
                    confirms,
                    preConfirms,
                    contractAddress,
                    chainId
                };
            });

            return {
                symbol,
                name,
                fullName,
                chains: formattedChains
            };
        });

        return currencies;
    } catch (error) {
        console.error('Error fetching currencies from KuCoin:', error);
        return null;
    }
}

module.exports = {
    getCurrencies
};
