import React from 'react';

export default function ({ items }) {
    return <nav aria-label="Fil d'ariane" id="datavizfi-breadcrumb">
        <ol>{items.map(({url, text}) => <li>
            <a href={url ? url : '#'} rel="permalink" aria-current={url ? false : 'page'}>{text}</a>
        </li>)}</ol>
    </nav>;
}
