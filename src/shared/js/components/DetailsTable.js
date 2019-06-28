import React from 'react';
import ReactTooltip from 'react-tooltip'

import {makeLigneBudgetId}  from 'document-budgetaire/Records.js';

import {aggregatedDocumentBudgetaireNodeElements} from '../finance/AggregationDataStructures.js';
import {fonctionLabels, natureLabels} from '../../../../build/finances/finance-strings.json';

import {currencyFormat, ScaledAmount, default as MoneyAmount} from './MoneyAmount';

export default function DetailsTable({element}) {
    const lignesBudget = element && aggregatedDocumentBudgetaireNodeElements(element)
    return <table className="raw-data">
        <thead>
            <tr>
                <th>Nature</th>
                <th>Montant</th>
                <th>Fonction</th>
                {/*<th>Identifiant</th>*/}
            </tr>
        </thead>
        <tbody>
        {lignesBudget && lignesBudget
            .sort((r1, r2) => r2['MtReal'] - r1['MtReal'])
            .map(ligne => <tr key={makeLigneBudgetId(ligne)}>
                <td data-id={'N'+ligne['Nature']}>{natureLabels[ligne['Nature']]}</td>
                <td className="digits" data-tip={currencyFormat(ligne['MtReal'])}>
                    <ScaledAmount amount={ligne['MtReal']} />
                    <ReactTooltip className="money-amount tooltip" effect="solid" place="left" delayShow={10} />
                </td>
                <td data-id={'F'+ligne['Fonction']}>{fonctionLabels[ligne['Fonction']]}</td>
                {/*<th scope="row">
                    <code>N{ligne['Nature']}F{ligne['Fonction']}</code>
                </th>*/}
            </tr>
        )}
        </tbody>
    </table>
}
