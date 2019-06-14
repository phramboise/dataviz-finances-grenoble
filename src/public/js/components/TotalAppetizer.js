import React from 'react';

import PrimaryCallToAction from '../../../shared/js/components/gironde.fr/PrimaryCallToAction';
import Markdown from '../../../shared/js/components/Markdown';

/*
interface TotalAppetizerProps{
    total: number,
    year: number,
    totalUrl: total
}
 */

export default function ({total, year, exploreUrl}) {
    let toDisplay = '';
    let beforeAndComma;
    let afterComma;

    if(total){
        toDisplay = (total/Math.pow(10, 6)).toFixed(1);
        beforeAndComma = toDisplay.match(/^(\d+)\./)[1];
        afterComma = toDisplay.match(/\.(\d+)$/)[1];
    }
    return React.createElement('div', { className: 'appetizer total-appetizer' },
        React.createElement('h1', {},
            total ? React.createElement('div', {className: 'number'},
                React.createElement('span', {className: 'before-comma'}, beforeAndComma),
                React.createElement('span', {className: 'after-comma'}, ', '+afterComma)
            ) : '',
            React.createElement('div', {className: 'text'},
                `Million${total/Math.pow(10, 6) >= 2 ? 's' : ''} d'euros de dépenses en ${year}`
            )
        ),
        React.createElement('hr', {}),
        React.createElement(Markdown, {},
            `La Ville a dépensé ${toDisplay.replace('.', ',')} million${total/Math.pow(10, 6) >= 2 ? 's' : ''} d’euros en ${year}. Ce budget est composé de dépenses de fonctionnement, nécessaires aux missions et gestion des services de la collectivité, et de dépenses d’investissement dédiées à des programmes structurants ou stratégiques pour le territoire.`
        ),
        React.createElement(PrimaryCallToAction, { href: exploreUrl, text: 'Explorer les comptes de la ville'})
    );
}
