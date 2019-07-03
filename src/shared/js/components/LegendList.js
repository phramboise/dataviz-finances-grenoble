import React from 'react';

export default function LegendList({items, onElementFocus}){
    return <ol className="legend-list">
        {items.map(({className, url, text, colorClassName, ariaCurrent}, i) => {
            return <li key={colorClassName}
                        className={className}
                        tabIndex="0"
                        aria-current={ariaCurrent}
                        onMouseOver={() => onElementFocus(i)}
                        onMouseOut={() => onElementFocus(undefined)}
                        onFocus={() => onElementFocus(i)}
                        onBlur={() => onElementFocus(undefined)}>
                        <span className={`color ${colorClassName}`}></span>
                        {text}
            </li>
        })}
    </ol>
}
