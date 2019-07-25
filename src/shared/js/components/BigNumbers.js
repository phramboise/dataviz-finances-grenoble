import React, {Fragment} from 'react'

import Donut from './Donut.js'
import Markdown from './Markdown.js'
import {makeAmountString, default as MoneyAmount, percentage} from './MoneyAmount.js'

import QuestionMarkIcon from '../../../../images/icons/question-mark.svg'

export default function BigNumbers ({ items, label, iconFn, year }) {
    const globalAmount = items.reduce((total, {value}) => total+value, 0)

    return <div className="side">
        <Donut items={items} padAngle={0.015} donutWidth={40}>
            <MoneyAmount amount={globalAmount} /> de {label}
        </Donut>
        <dl className="explanatory-legend">
            {items.map(item => {
                const Icon = iconFn(item.id)
                return <Fragment key={item.id}>
                    <dt className={item.colorClassName}>
                        <Icon className="icon" aria-hidden={true} />
                        <small>{percentage(item.value, globalAmount)} en {item.text.toLocaleLowerCase()}</small>
                        <span className="money-amount" aria-label={item.value}>
                            <span className="prefix">soit </span>
                            {makeAmountString(item.value)}
                            <span className="suffix"> en {year}</span>
                        </span>
                    </dt>
                    <dd><Markdown>{item.description}</Markdown></dd>
                </Fragment>
            })}
        </dl>
    </div>;
}
