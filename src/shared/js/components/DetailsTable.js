import React, {Fragment} from 'react';

import {makeLigneBudgetId}  from 'document-budgetaire/Records.js';

import {aggregatedDocumentBudgetaireNodeElements} from '../finance/AggregationDataStructures.js';
import {fonctionLabels, natureLabels} from '../../../../build/finances/finance-strings.json';

import {currencyFormat, ScaledAmount, default as MoneyAmount} from './MoneyAmount';

const byAmount = (r1, r2) => r2['MtReal'] - r1['MtReal'];

export default function DetailsTable({element}) {
    const lignesBudget = element && aggregatedDocumentBudgetaireNodeElements(element)

    return <table className="raw-data">
        <thead>
            <tr>
                <th id="raw-col-nature" scope="col">Nature</th>
                <th id="raw-col-montant" scope="col" className="digits">Montant</th>
            </tr>
        </thead>
        <tbody>
        {lignesBudget && lignesBudget
            .groupBy(ligne => ligne['Fonction'])
            .entrySeq().map(([Fonction, rows]) => {
                const groupId = `raw-data-group-${Fonction}`
                return (<Fragment key={groupId}>
                    <tr className="colgroup">
                        <th id={groupId} colSpan="2" scope="colgroup">{fonctionLabels[ Fonction ]}</th>
                    </tr>
                    {rows.sort(byAmount).map(ligne => (
                        <tr key={makeLigneBudgetId(ligne)} className="raw-record" tabIndex="0">
                            <td headers={`${groupId} raw-col-nature`}>{natureLabels[ ligne['Nature'] ]}</td>
                            <td headers={`${groupId} raw-col-montant`} className="money-amount">
                                {currencyFormat(ligne['MtReal'])}
                            </td>
                        </tr>
                    ))}
                </Fragment>)
            })}
        </tbody>
    </table>
}
