import React from 'react';

export default function Breadcrumb ({ items }) {
    return <nav class="filAriane" aria-label="Breadcrumb">
        <ul>{items.map(({url, text}) => <li key={url+text}>
            <a href={url ? url : '#'} rel="permalink" aria-current={url ? false : 'page'}>{text}</a>
        </li>)}</ul>
    </nav>;
}
