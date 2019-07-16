import React, {Fragment} from 'react';

import {makeLigneBudgetId}  from 'document-budgetaire/Records.js';

import {fonctionLabels, natureLabels} from '../../../../build/finances/finance-strings.json';

import {currencyFormat, ScaledAmount, default as MoneyAmount} from './MoneyAmount';

const SPACE_REGEX = new RegExp(' ', 'g');
const DOT_REGEX = new RegExp('\\.', 'g');
const PRE_DOT = new RegExp('^(.+)\\.');

const byAmount = (r1, r2) => r2['MtReal'] - r1['MtReal'];
const id = (string) => string.replace(PRE_DOT, '').replace(SPACE_REGEX, '-').replace(DOT_REGEX, '--');

export default function DetailsTable({families}) {
    return <table className="raw-data">
        <tbody>
        {families.map(Politique => {
            return <Fragment key={Politique.id}>
            <tr className="colgroup colgroup--group">
                <th id={id(Politique.id)} colSpan="2" scope="colgroup">{Politique.label}</th>
            </tr>

            {Politique.children.map(SousPolitique => <Fragment key={SousPolitique.id}>
                <tr className="colgroup colgroup--subgroup">
                    <th id={id(SousPolitique.id)} colSpan="2" scope="colgroup">
                        {SousPolitique.label}
                    </th>
                </tr>
                <tr>
                    <th id="raw-col-nature" scope="col">Nature</th>
                    <th id="raw-col-montant" scope="col" className="digits">Montant</th>
                </tr>
                {SousPolitique.elements.sort(byAmount).map(ligne => (
                    <tr key={makeLigneBudgetId(ligne)} className="raw-record" tabIndex="0">
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
