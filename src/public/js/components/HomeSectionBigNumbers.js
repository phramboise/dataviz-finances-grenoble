import React, {useState, useCallback} from 'react';
import Tooltip from "react-tooltip";
import { sum } from "d3-array";

import MoneyAmount, {percentage} from "../../../shared/js/components/MoneyAmount";
import BigNumbers from "../../../shared/js/components/BigNumbers.js";


export default function BigNumbersSection ({bigNumbersRef, RDFIcon, changeExplorationYear, explorationYear, revenueItems, expenditureItems, years, onNumberClick}) {
    const [activeBigNumber, setActiveBigNumber] = useState(null);

    const TooltipInnerContent = useCallback((itemId) => {
        if (!itemId) return null;
        const allItems = revenueItems.concat(expenditureItems);
        const sameCategoryTotal = sum(allItems.filter(el => el.id.split('/')[0] === itemId.split('/')[0]).map(el => el.value).toArray());
        const item = allItems.find(d => d.id === itemId);

        return <div className={item.colorClassName}>
            <p className='react-tooltip-type-aggregation'>
                {item.text}
            </p>

            <p>
                <MoneyAmount amount={item.value} />
                <small>soit {percentage(item.value, sameCategoryTotal)} en {explorationYear}</small>
            </p>
        </div>
    });

    const onYearChange = (event) => changeExplorationYear(Number(event.target.value));

    return (<section ref={bigNumbersRef} id="summary" className="yearly-budget" aria-label={`Les grands chiffres ${explorationYear}`} aria-describedby="yearly-budget--description">
        <h2>Les grands chiffres</h2>

        <p className="h4" id="yearly-budget--description">
            <label htmlFor="select-year">Afficher les recettes et dépenses de</label>
            <select id="select-year" value={explorationYear} onChange={onYearChange}>
                {years.map(year => <option key={year} value={year}>l&apos;année {year}</option>)}
            </select>
        </p>

        <div className="side-by-side" role="table">
            <BigNumbers items={revenueItems} label="recettes" iconFn={RDFIcon} year={explorationYear} setActive={setActiveBigNumber} activeBigNumber={activeBigNumber} onClick={onNumberClick} />
            <BigNumbers items={expenditureItems} label="dépenses" iconFn={RDFIcon} year={explorationYear} setActive={setActiveBigNumber} activeBigNumber={activeBigNumber} onClick={onNumberClick} />
            <Tooltip
                className="react-tooltip"
                id="tooltip-bignumbers"
                place="top"
                type="light"
                effect="solid"
                getContent={TooltipInnerContent}/>
        </div>
    </section>);
}
