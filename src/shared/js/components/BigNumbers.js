import React from 'react'

import Donut from './Donut.js'
import Markdown from './Markdown.js'
import {makeAmountString, default as MoneyAmount} from './MoneyAmount.js'

import QuestionMarkIcon from '../../../../images/icons/question-mark.svg'

export default function BigNumbers ({ items, label, iconFn }) {
    const globalAmount = items.reduce((total, {value}) => total+value, 0)

    return <div className="side">
        <Donut items={items} padAngle={0.015} donutWidth={40}>
            <MoneyAmount amount={globalAmount} /> de {label}
        </Donut>
        <dl className="explanatory-legend">
            {items.map(item => {
                const Icon = iconFn(item.id)
                return <>
                    <dt className={item.colorClassName}>
                        <div className="money-amount" aria-label={item.value}>
                            <Icon className="icon" aria-hidden={true} />
                            {makeAmountString(item.value)}
                        </div>

                        {item.text}
                    </dt>
                    <dd><Markdown>{item.description}</Markdown></dd>
                </>
            })}
        </dl>
    </div>;
}
