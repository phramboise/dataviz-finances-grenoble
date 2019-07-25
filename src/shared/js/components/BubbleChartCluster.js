import React from 'react';

import {aggregatedDocumentBudgetaireNodeTotal} from "../finance/AggregationDataStructures.js"

import {max, sum} from "d3-array";
import page from "page";

import MoneyAmount from "./MoneyAmount.js";
import DISPLAY_MODE_ROOT, {default as BubbleChartNode} from "./BubbleChartNode.js";

export default function BubbleChartCluster(props){
    const {families, InnerTooltip} = props

    if (!families) {
        return null;
    }

    const getNodeUrl = (node) => {
        const [nodeId, politiqueId] = node.id.replace(/^Budget Montreuil /, '').split('.');
        return `/explorer/${nodeId}/details/${politiqueId}`
    }

    const maxNodeValue = max([].concat(...families.map(f => f.children)), f => f.total);
    const total = sum(families, f => f.total);

    console.log('families', families)
    console.log('families total %d | max %d', total, maxNodeValue)

    return (<div className="bubble-chart-cluster">
        {families
            .sort((a, b) => b.total - a.total)
            .map(family => (<BubbleChartNode key={`rd-CH${family.id}`}
                                             node={family}
                                             maxNodeValue={maxNodeValue}
                                             onClick={(family, node) => page(getNodeUrl(node))}
                                             DISPLAY_MODE={DISPLAY_MODE_ROOT}
                                             getNodeUrl={getNodeUrl}
                                             InnerTooltip={InnerTooltip} />))}
    </div>)
}
