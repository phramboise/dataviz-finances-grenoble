import { scaleLinear } from 'd3-scale';
import { min, max, sum } from 'd3-array';
import cx from 'clsx';

import React, {useState, useEffect} from 'react';
import Tooltip from 'react-tooltip';

import LegendList from './LegendList.js';
import {percentage} from './MoneyAmount.js';
import D3Axis from './D3Axis.js';

const mapAccessor = ([contentId, value]) => value;
const yAscSort = ([aId, a], [bId, b]) => b - a;

/*
    This component displays a stackchart and a legend if there is a legend.
    Colors are attributed by this component via the use of `area-color-${i+1}` classes

    It is the caller's responsibility to make sure ys (from ysByX) are sorted in a order
    that is consistent with the legendItems order
*/
export default function StackChart ({
    // data
    xs, ysByX, contentId,
    // aestetics
    portrait = false,
    WIDTH = 800, HEIGHT = 430,
    Y_AXIS_MARGIN = 80, HEIGHT_PADDING = 40,
    BRICK_SPACING = 6, MIN_BRICK_HEIGHT = 4, BRICK_RADIUS = 5,
    BRICK_DISPLAY_VALUE = true,
    PORTRAIT_COLUMN_WIDTH = 70,
    // legend
    legendItems = [], uniqueColorClass,
    // other
    selectedX, yValueDisplay = x => String(x),
    // events
    onSelectedXAxisItem, onBrickClicked
}) {
    const columnAndMarginWidth = (WIDTH - Y_AXIS_MARGIN)/(xs.length)
    const columnMargin = columnAndMarginWidth/4;
    const columnWidth = columnAndMarginWidth - columnMargin;

    const [focusedItem, setFocusedItem] = useState(undefined);

    const xScale = scaleLinear()
        .domain([min(xs), max(xs)])
        .range(portrait ?
            [HEIGHT_PADDING, HEIGHT - PORTRAIT_COLUMN_WIDTH]:
            [Y_AXIS_MARGIN+columnAndMarginWidth/2, WIDTH-columnAndMarginWidth/2]
        );

    const maxAmount = max(ysByX.valueSeq().toJS().map(ysMap => sum(ysMap, mapAccessor)));

    const yScale = scaleLinear()
        .domain([0, maxAmount])
        .range(
            portrait ?
                [0, WIDTH - 5]:
                [HEIGHT - HEIGHT_PADDING, HEIGHT_PADDING]
        );

    const [yMin, yMax] = yScale.range();

    const yValueScale = scaleLinear()
        .domain([0, maxAmount])
        .range([0, Math.abs(yMin-yMax)]);

    const ticks = yScale.ticks(5);

    const xAxisTickData = xs.map(x => ({
        transform: portrait ?
            `translate(0, ${xScale(x)})` :
            `translate(${xScale(x)}, ${HEIGHT-HEIGHT_PADDING})`,
        line: { x1 : 0, y1 : 0, x2 : 0, y2 : 0 },
        text: {
            x: portrait ? 0 : -10,
            y: 0,
            dx: portrait ? '1em' : undefined,
            dy: portrait ? undefined : '2em',
            anchor: portrait ? 'left' : undefined,
            t: x
        },
        id: x,
        className: cx({'selected': x === selectedX})
    }))

    const yAxisTickData = ticks.map(tick => {
        return {
            transform: portrait ?
                `translate(${yScale(tick)}, 0)` :
                `translate(0, ${yScale(tick)})`,
            line: {
                x1 : 0,
                y1 : 0,
                x2 : portrait ? 0 : WIDTH,
                y2 : portrait ? HEIGHT : 0
            },
            text: {
                x: 0,
                y: portrait ? 0 : -10,
                dx: portrait ? 5 : 0,
                dy: portrait ? 12 : 0,
                anchor: portrait ? 'left' : 'right',
                t: yValueDisplay(tick)
            }

        }
    })

    useEffect(() => {
        if (focusedItem !== undefined) {
            xs.forEach(year => {
                Tooltip.show(document.getElementById(`brick-${year}-${focusedItem}`))
            })

            return () => Tooltip.hide();
        }
    })

    return (<div className={cx('stackchart', portrait && 'portrait')}>
        {/* useless <div> to defend the <svg> in Chrome when using flex: 1 on the legend */}
        <div className="over-time">
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
                <D3Axis className="x" tickData={xAxisTickData} onSelectedAxisItem={onSelectedXAxisItem} />
                <D3Axis className="y" tickData={yAxisTickData} />
                <g className={cx('content', focusedItem && 'with-focus')}>
                    {ysByX.entrySeq().toJS().map(([x, ysMap]) => {
                        const total = sum(ysMap, mapAccessor);

                        // .map + .slice is an 0(n²) algorithm. Fine here because n is never higher than 20
                        const stackYs = ysMap
                            .sort(yAscSort)
                            .map(mapAccessor)
                            .map((amount, i, arr) => sum(arr.slice(0, i)) )
                            .map(yValueScale)
                            .map(height => height < 1 ? 0 : height);

                        const stack = ysMap
                            .sort(yAscSort)
                            .map(([contentId, y], i) => {
                                const baseHeight = yValueScale(y);

                                const height = Math.max(baseHeight - BRICK_SPACING, MIN_BRICK_HEIGHT);

                                const baseY = portrait ?
                                    +BRICK_SPACING/2 :
                                    HEIGHT - HEIGHT_PADDING - height - BRICK_SPACING/2;

                                return {
                                    value: y,
                                    contentId,
                                    height,
                                    y: i === 0 ?
                                        baseY :
                                        (portrait ?
                                            baseY + stackYs[i] :
                                            baseY - stackYs[i])
                                }
                            });


                        const totalHeight = yValueScale(total);

                        const totalY = HEIGHT - HEIGHT_PADDING - totalHeight;

                        return (<g key={x} data-total={total} className={cx(x === selectedX && 'selected')} transform={portrait ? `translate(0, ${xScale(x) + 6 })` : `translate(${xScale(x)})`}>
                            <g>{stack.map( ({value, contentId, height, y}) => {
                                const legendItem = legendItems.find(item => item.id === contentId) || {}
                                const colorClass = legendItem.colorClassName || uniqueColorClass;

                                return (<g key={x+contentId} id={`brick-${x}-${contentId}`}
                                    data-tip={`${value}|${total}`}
                                    data-for={focusedItem === contentId ? `brick-${x}` : ''}
                                    transform={portrait ? `translate(${y})` : `translate(0, ${y})`}
                                    className={cx(
                                        'brick',
                                        onBrickClicked && 'actionable',
                                        colorClass,
                                        legendItem.id || contentId,
                                        focusedItem === contentId && 'focused'
                                    )}
                                    onClick={onBrickClicked ? () => {
                                        setFocusedItem(undefined)
                                        onBrickClicked(
                                            x,
                                            legendItem ? legendItem.id : y
                                        )
                                    } : undefined}
                                    onMouseOver={() => setFocusedItem(contentId)}
                                    onFocus={() => setFocusedItem(contentId)}
                                    onMouseOut={() => setFocusedItem(undefined)}
                                    onBlur={() => setFocusedItem(undefined)}
                                    aria-valuetext={value}
                                >
                                    <rect y={0} x={portrait ? 0 : -columnWidth/2}
                                        width={portrait ? height : columnWidth}
                                        height={portrait ? PORTRAIT_COLUMN_WIDTH - 12 : height}
                                        rx={BRICK_RADIUS}
                                        ry={BRICK_RADIUS}>
                                    </rect>
                                </g>)
                            })}
                            <text className="stackchart-title"
                                x={portrait ? WIDTH - 90 : -columnWidth/2}
                                y={portrait ? 0 : totalY}
                                dy={portrait ? '-6' : '-1em'}
                                dx="0em"
                                textAnchor="right">
                                <tspan>{yValueDisplay(total)}</tspan>
                            </text>
                            </g>
                        </g>)
                    })}
                </g>
            </svg>
        </div>
        {xs.map(year => <Tooltip key={'tooltip-brick-' + year} type="light" id={'brick-' + year} effect="solid" place="top" className="react-tooltip" getContent={(tipAttribute) => {
            if (!tipAttribute || focusedItem === undefined) return;

            const [value, total] = tipAttribute.split('|');
            const partAmount = percentage(value, total, {suffix: ''});
            const legendItem = legendItems.find(item => focusedItem === item.id)

            return (<div className={legendItem.colorClassName}>
                {selectedX === year && <p className="label">{legendItem.text}</p>}
                <p>
                    <span className="money-amount">{yValueDisplay(value)}</span>
                    <small>soit {partAmount}% en {year}</small>
                </p>
            </div>)
        }} />)}
        {legendItems && <LegendList onElementFocus={(id) => setFocusedItem(id)}
            items={legendItems.map((li, i) => Object.assign(
                {colorClassName: `area-color-${i+1}`},
                {ariaCurrent: focusedItem === li.id},
                li,
                {className: cx(li.className, focusedItem === li.id && 'focused')},
            ))} />}
    </div>);
}
