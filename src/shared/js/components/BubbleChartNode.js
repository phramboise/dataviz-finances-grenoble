import React from 'react';
import page from 'page'
import {pack, hierarchy} from 'd3-hierarchy';
import {scaleLinear} from 'd3-scale';

import ReactTooltip from 'react-tooltip'

import MoneyAmount from "./MoneyAmount.js";


export default class BubbleChartNode extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {node, maxNodeValue} = this.props;
        const {total, label, children} = node;
        const RorD = node.rdfi[0];
        const WIDTH = 400;
        const HEIGHT = 400;
        const radius = scaleLinear().domain([0, maxNodeValue]).range([0, WIDTH / 2.5]);

        const nodes = hierarchy({name: label, children})
            .sort((a, b) => b.total - a.total);

        const bubbles = pack()
            .size([WIDTH, HEIGHT])
            .padding(10)
            .radius(d => Math.max(radius(d.data.total), 3))

        const listMapNodes = bubbles(nodes).children;

        return (<figure className={`bubble-chart rdfi-${RorD}`}>
            <figurelegend>
                <MoneyAmount amount={total} />
                <span>{label}</span>
            </figurelegend>

            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
                {listMapNodes.map(({r, x, y, data}) => (
                    <g key={data.id} transform={`translate(${x}, ${y})`}>
                        <a
                            // href={`#!/finance-details/${data.id}`}
                            onClick={e => e.preventDefault() && page(`/finance-details/${data.id}`)}
                            className="clickable"
                            onFocus={e => ReactTooltip.show(e.target)}
                            onBlur={e => ReactTooltip.hide(e.target)}
                            data-tip={data.id}
                            data-for={`tooltip-${node.id}`}
                            tabIndex="0"
                        >
                            <circle r={r}
                                className={`rdfi-${data.rdfi[0]} rdfi-${data.rdfi[1]}`}
                                aria-label={data.label} />
                        </a>
                    </g>
                ))}
            </svg>
            <ReactTooltip
                className='react-tooltip'
                key={`tooltip-${node.id}-${RorD}`}
                id={`tooltip-${node.id}`}
                delayHide={500}
                place='right'
                clickable={true}
                effect='solid'
                getContent={(nodeId) => {
                    if (!nodeId) return null;

                    const {data} = listMapNodes.find(d => d.data.id === nodeId);
                    return (<div className={`rdfi-${data.rdfi[0]} rdfi-${data.rdfi[1]}`}>
                        <p className='react-tooltip-type-aggregation'>
                            {data.rdfi[0] === 'R'? 'Recette': 'Dépense'}
                            {data.rdfi[1] === 'F'? ' de fonctionnement': ' d’investissement'}
                        </p>
                        <p>{data.label}<MoneyAmount amount={data.total} /></p>
                        <p><a href={`#!/finance-details/${data.id}`}>Voir le détail</a></p>
                    </div>);
                }}/>
        </figure>);
    }
}
