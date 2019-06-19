import React from 'react';

export default function LegendList({items}){
    return <ol className="legend-list">
        {items.map(({className, url, text, colorClassName}) => {
            return <li key={colorClassName} className={className}>
                <a href={url} className={url ? 'link' : 'disabled'}>
                    <span className={`color ${colorClassName}`}></span>
                    {text}
                </a>
            </li>
        })}
    </ol>
}
