import React, {Fragment} from 'react';

import {makeLigneBudgetId}  from 'document-budgetaire/Records.js';

import {natureLabels} from '../../../../build/finances/finance-strings.json';
import {currencyFormat, percentage} from './MoneyAmount.js';

const SPACE_REGEX = new RegExp(' ', 'g');
const DOT_REGEX = new RegExp('\\.', 'g');
const PRE_DOT = new RegExp('^(.+)\\.');

const byPolitique = (politiqueId) => (politiqueId
    ? function filteredRows(r){ return r.id.includes('.' + politiqueId) }
    : function allRows () { return true }
);
const byAmount = (r1, r2) => r2['MtReal'] - r1['MtReal'];
const id = (string) => string.replace(PRE_DOT, '').replace(SPACE_REGEX, '-').replace(DOT_REGEX, '--');

export default function DetailsTable({families, politiqueId}) {
    return <table className="raw-data">
        <tbody>
            {families.filter(byPolitique(politiqueId)).map(Politique => {
                return <Fragment key={Politique.id}>
                    <tr className="colgroup colgroup--group">
                        <th id={id(Politique.id)} scope="colgroup">{Politique.label}</th>
                        <th className="money-amount" scope="colgroup" aria-label={`Montant total : ${currencyFormat(Politique.total)}`}>
                            {currencyFormat(Politique.total)}
                        </th>
                    </tr>

                    {Politique.children.map(SousPolitique => <Fragment key={SousPolitique.id}>
                        <tr className="colgroup colgroup--subgroup">
                            <th id={id(SousPolitique.id)} scope="colgroup">
                                {SousPolitique.label}
                            </th>
                            <th className="money-amount" scope="colgroup" aria-label={`Montant total : ${currencyFormat(SousPolitique.total)}`}>
                                {currencyFormat(SousPolitique.total)}
                            </th>
                        </tr>
                        <tr>
                            <th id="raw-col-nature" scope="col">Nature</th>
                            <th id="raw-col-montant" scope="col" className="digits">Montant</th>
                        </tr>
                        {SousPolitique.elements.sort(byAmount).map(ligne => (
                            <tr key={makeLigneBudgetId(ligne)} data-fonction-nature={makeLigneBudgetId(ligne)} className="raw-record" tabIndex="0">
                                <td headers={`${id(Politique.id)} ${id(SousPolitique.id)} raw-col-nature`}>
                                    {natureLabels[ ligne['Nature'] ]}
                                </td>
                                <td headers={`${id(Politique.id)} ${id(SousPolitique.id)} raw-col-montant`} className="money-amount">
                                    {currencyFormat(ligne['MtReal'])}
                                </td>
                            </tr>
                        ))}
                    </Fragment>
                    )}
                </Fragment>
            })}
        </tbody>
    </table>
}
