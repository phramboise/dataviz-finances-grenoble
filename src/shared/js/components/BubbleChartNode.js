import React from 'react';
import {pack, hierarchy} from 'd3-hierarchy';
import {scaleLinear} from 'd3-scale';

import ReactTooltip from 'react-tooltip'

import MoneyAmount from "./MoneyAmount.js";

export const DISPLAY_MODE_NODES = 'NODES';
export const DISPLAY_MODE_ROOT = 'ROOT';

const rdfi = (node) => {
    let rdfi = '';

    rdfi += (['RECETTE', 'DEPENSE' ].find(type => node.id.includes(type)) || 'X').trim()[0]
    rdfi += (['FONCTIONNEMENT', 'INVESTISSEMENT'].find(type => node.id.includes(type)) || 'X').trim()[0]

    return rdfi;
}

export default function BubbleChartNode (props) {
    const {node, maxNodeValue, onClick} = props;
    const {total, label, children} = node;
    const {DISPLAY_MODE=DISPLAY_MODE_NODES} = props;
    const RorD = rdfi(node)[0];
    const WIDTH = 250;
    const HEIGHT = 250;
    const radius = scaleLinear().domain([0, maxNodeValue]).range([1, 80]);

    const nodes = hierarchy({...node, name: label})
        .sum(d => d.total)
        .sort((a, b) => b.total - a.total);

    const bubbles = pack()
        .size([WIDTH, HEIGHT])
        .padding(3)
        .radius(d => radius(d.data.total))

    const listMapNodes = DISPLAY_MODE === DISPLAY_MODE_NODES
        ? bubbles(nodes).children
        : [ bubbles(nodes) ];

    return (<figure className={`bubble-chart rdfi-${RorD}`}>
        <figcaption>
            <MoneyAmount amount={total} />
            <span>{label}</span>
        </figcaption>

        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
            {listMapNodes.map(({r, x, y, data}) => {
                const RDFI = rdfi(data)
                return <g key={data.id} transform={`translate(${x}, ${y})`}>
                    <a
                        onClick={e => onClick(node, data)}
                        onKeyPress={e => e.key === 'Enter' && onClick(node, data)}
                        className="clickable"
                        onFocus={e => ReactTooltip.show(e.target)}
                        onBlur={e => ReactTooltip.hide(e.target)}
                        data-tip={data.id}
                        data-for={`tooltip-${node.id}`}
                        tabIndex="0"
                    >
                        <circle r={r}
                            className={`rdfi-${RDFI[0]} rdfi-${RDFI[1]}`}
                            aria-label={data.label} />
                    </a>
                </g>
            })}
        </svg>
        <ReactTooltip
            className="react-tooltip"
            key={`tooltip-${node.id}-${RorD}`}
            id={`tooltip-${node.id}`}
            delayHide={500}
            place="top"
            type="light"
            clickable={true}
            effect="solid"
            getContent={(nodeId) => {
                if (!nodeId) return null;

                const {data} = listMapNodes.find(d => d.data.id === nodeId);
                const RDFI = rdfi(data)

                return (<div className={`rdfi-${RDFI[0]} rdfi-${RDFI[1]}`}>
                    <p className='react-tooltip-type-aggregation'>
                        {RDFI[0] === 'R'? 'Recette': 'Dépense'}
                        {RDFI[1] === 'F'? ' de fonctionnement': ' d’investissement'}
                    </p>
                    <p>{data.label}<MoneyAmount amount={data.total} /></p>
                </div>);
            }}/>
    </figure>);
}
