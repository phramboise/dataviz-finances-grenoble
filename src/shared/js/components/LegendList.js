import React from 'react';

export default function LegendList({items, onElementFocus}){
    return <ol className="legend-list">
        {items.map(({className, url, text, colorClassName, ariaCurrent}, i) => {
            return <li key={colorClassName} className={className} aria-current={ariaCurrent}>
                <a href={url} className={url ? 'link' : 'disabled'} tabIndex="0"
                    onMouseOver={() => onElementFocus(i)}
                    onMouseOut={() => onElementFocus(undefined)}
                    onFocus={() => onElementFocus(i)}
                    onBlur={() => onElementFocus(undefined)}>
                    <span className={`color ${colorClassName}`}></span>
                    {text}
                </a>
            </li>
        })}
    </ol>
}
