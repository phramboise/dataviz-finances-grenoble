import React from 'react';

export default function LegendList({items, onElementFocus}){
    return <ol className="legend-list">
        {items.map(({className, url, text, colorClassName, ariaCurrent, id}) => {
            return <li key={id}
                        className={className}
                        tabIndex="0"
                        aria-current={ariaCurrent}
                        onMouseOver={() => onElementFocus(id)}
                        onMouseOut={() => onElementFocus(undefined)}
                        onFocus={() => onElementFocus(id)}
                        onBlur={() => onElementFocus(undefined)}>
                        <span className={`color ${colorClassName}`}></span>
                        {text}
            </li>
        })}
    </ol>
}
