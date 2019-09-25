import React from 'react';
import cx from 'clsx';
import {arc as _arc, pie as _pie} from 'd3-shape';

/*

interface DonutProps{
    proportion: number [0, 1]
    items: ImmutableList<{text, value}>
}

*/
export default function Donut ({
    donutWidth = 50, outerRadius = 200,
    width = 2*outerRadius, height = 2*outerRadius,
    padAngle = Math.PI/30,
    proportion, items, children,
    setActive, activeItem, onClick,
    className
}){
    const arcDescs = _pie()
        .startAngle(2*Math.PI)
        .endAngle(0)
        .padAngle(padAngle)
        .value(el => el.value)
        (items.toArray())
    const arc = _arc();
    const {colorClassName} = items.first();

    return (<figure className={cx('donut', colorClassName, className)}>
        <svg viewBox={`0 0 ${width} ${height}`}>
            <g transform={`translate(${width/2}, ${height/2})`} role="row">
                {arcDescs.map(ad => {
                    const d = arc({
                        outerRadius,
                        innerRadius: outerRadius - donutWidth,
                        ...ad
                    });

                    return <g key={ad.data.id}
                              onMouseOver={setActive ? () => setActive(ad.data.id) : undefined}
                              onMouseOut={setActive ? () => setActive(null) : undefined}
                              onClick={() => onClick(ad.data)}
                              data-for="tooltip-bignumbers"
                              data-tip={ad.data.id}
                              className={cx(ad.data.colorClassName, activeItem === ad.data.id && 'focused', setActive && 'actionable', onClick && 'actionable')}
                              tabIndex="0"
                              role="cell">
                        <path d={d} />
                    </g>
                })}
            </g>
        </svg>
        <figcaption>{children}</figcaption>
    </figure>);

}
