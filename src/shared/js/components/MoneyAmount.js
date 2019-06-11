import React from 'react';

const SCALES = [
    {
        suffix: 'M',
        divideBy: 1000000,
        className: 'millions',
        threshold: 100000,
    },
    {
        suffix: 'K',
        divideBy: 1000,
        className: 'thousands',
        threshold: 1000,
    },
    {
        suffix: 'H',
        divideBy: 1,
        className: 'hundreds',
    }
]

const currency = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});
const short = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
});

const getScale = (scaleId) => SCALES.find(s => s.suffix === scaleId)

export function currencyFormat(amount) {
    return currency.format(amount) + '€';
}

export function makeAmountString(amount){
    const {suffix, divideBy, threshold} = getScale('M')

    return Math.abs(amount) < threshold ?
        currencyFormat(amount) :
        short.format(amount / divideBy) + suffix + '€'
}

function makeParts(amount, {scale}) {
    const [int, decimals] = (amount / scale.divideBy).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,').split('.')
    const SCALE_LENGTH = SCALES.length
    let keep = false

    if (Math.abs(amount) < scale.threshold) {
        return [
            { className: 'hundreds', string: currency.format(amount) },
            { className: 'suffix', string: '€' },
        ]
    }

    return int.split(',')
        .reverse()
        .map((part, i) => ({
            string: part,
            className: (SCALES[ SCALE_LENGTH - (i+1) ] || {}).className || ''
        }))
        .reverse()
        .concat([
            { className: 'suffix', string: scale.suffix + '€' },
        ])
}

function makeAmount(amount, {scale}){
    return {
        parts: makeParts(amount, {scale}),
        string: currency.format(amount) + '€'
    }
}

export default ({amount}) => {
    if (Number.isFinite(amount) === false) {
        return null
    }

    return <span className="money-amount">{makeAmountString(amount)}</span>
};

export function ScaledAmount ({amount, scale:scaleId='K'}) {
    if (Number.isFinite(amount) === false) {
        return null
    }

    const scale = getScale(scaleId)
    const {string, parts} = makeAmount(amount, {scale})
    return <span className="money-amount money-amount--scaled" data-scale={scale.suffix} aria-label={string}>
        {parts.map(({string, className}) => <span key={className} className={className}>{string}</span>)}
    </span>
};
