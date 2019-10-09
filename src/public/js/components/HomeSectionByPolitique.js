import React from 'react';

import BubbleChartCluster from "../../../shared/js/components/BubbleChartCluster.js";
import DetailsTable from "../../../shared/js/components/DetailsTable.js";

import AggregatedViewIcon from "../../../../images/icons/aggregation.svg";
import DetailedViewIcon from "../../../../images/icons/details.svg";

export default function byPolitiqueSection ({RD, FI, years, changeExplorationYear, explorationYear, byPolitiqueRef, topLevelElement, contentElement, politiqueView, politiqueId, bubbleTreeData, BubbleChartInnerTooltip}) {
    if (!topLevelElement || !bubbleTreeData) {
        return null;
    }

    const onYearChange = (event) => changeExplorationYear(Number(event.target.value));

    return (<section ref={byPolitiqueRef} className="discrete" id="politiques">
        <h2>
            {topLevelElement.id !== contentElement.id ? `${topLevelElement.text} (${contentElement.label})` : topLevelElement.text}
            {' '} réparties&nbsp;par politique&nbsp;publique en&nbsp;
            <select value={explorationYear} onChange={onYearChange}>
                {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
        </h2>

        <p className="intro">
        </p>

        <ul className="inline-tabs tabs--rdfi" role="tablist">
            <li role="presentation">
                <a aria-selected={politiqueView === 'aggregated'} className={`link rdfi-${RD} rdfi-${FI}`} role="tab" href={politiqueView !== 'aggregated' && `#!/explorer/${contentElement.id}`}>
                    <AggregatedViewIcon className="icon icon--small" />
                    vue d&apos;ensemble
                </a>
            </li>
            <li role="presentation">
                <a aria-selected={politiqueView === 'tabular'} className={`link rdfi-${RD} rdfi-${FI}`} role="tab" href={politiqueView !== 'tabular' && `#!/explorer/${contentElement.id}/details`}>
                    <DetailedViewIcon className="icon icon--small" />
                    vue détaillée
                </a>
            </li>
        </ul>
        <div className="tabpanel" role="tabpanel">
            {politiqueView === 'aggregated' && <BubbleChartCluster families={bubbleTreeData} politiqueId={politiqueId} InnerTooltip={BubbleChartInnerTooltip} />}
            {politiqueView === 'tabular' && <DetailsTable families={bubbleTreeData} politiqueId={politiqueId} />}
        </div>
    </section>)
}
