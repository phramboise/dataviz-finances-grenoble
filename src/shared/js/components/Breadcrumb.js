import React from 'react';

export default function ({ items }) {
    return <nav aria-label="Breadcrumb">
        <ol>{items.map(({url, text}) => <li key={url+text}>
            <a href={url ? url : '#'} rel="permalink" aria-current={url ? false : 'page'}>{text}</a>
        </li>)}</ol>
    </nav>;
}
