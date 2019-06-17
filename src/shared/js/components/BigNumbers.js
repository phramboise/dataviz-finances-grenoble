import React from 'react'

import Donut from './Donut.js'
import Markdown from './Markdown.js'
import {makeAmountString, default as MoneyAmount} from './MoneyAmount.js'

import QuestionMarkIcon from '../../../../images/icons/question-mark.svg'

export default function ({ items, label }) {
    const globalAmount = items.reduce((total, {value}) => total+value, 0)

    return <div className="side">
        <Donut items={items} padAngle={0.015} donutWidth={40}>
            <MoneyAmount amount={globalAmount} /> de {label}
        </Donut>
        <dl class="explanatory-legend">
            {items.map(item => <>
                <dt class={item.colorClassName}>
                    <div className="money-amount" aria-value={item.value}>
                        <QuestionMarkIcon className="icon" aria-hidden={true} />
                        {makeAmountString(item.value)}
                    </div>

                    {item.text}
                </dt>
                <dd><Markdown>{item.description}</Markdown></dd>
            </>)}
        </dl>
    </div>;
}
