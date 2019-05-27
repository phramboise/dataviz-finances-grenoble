import React from 'react';

const MILLION = 1000000;
const THIN_SPACE = ' ';

const underMillion = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});
const aboveMillion = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
});

export function makeAmountString(amount){
    return amount < 100000 ?
        underMillion.format(amount) :
        aboveMillion.format(amount / MILLION) + THIN_SPACE + 'M€';
}

export default ({amount}) => {
    if (Number.isFinite(amount) === false) {
        return null
    }

    return <span className="money-amount">{makeAmountString(amount)}</span>
};
