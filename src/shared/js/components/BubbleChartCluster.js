import React from 'react';

import { hierarchicalByFunction } from "../finance/memoized.js";
import {aggregatedDocumentBudgetaireNodeTotal} from "../finance/AggregationDataStructures.js"

import {max} from "d3-array";

import MoneyAmount from "./MoneyAmount.js";
import BubbleChartNode from "./BubbleChartNode.js";

const rdfi = (node) => {
    let rdfi = '';

    rdfi += ([' RECETTE ', ' DEPENSE' ].find(type => node.id.includes(type)) || 'X').trim()[0]
    rdfi += ([' FONCTIONNEMENT ', 'INVESTISSEMENT '].find(type => node.id.includes(type)) || 'X').trim()[0]

    return rdfi;
}

export default function BubbleChartCluster({tree}){

    if (!tree) {
        return null;
    }

    // PROBLEM This is super-hardcoded
    const families = tree
        .children
        .map(node1 => {
            return {
                id: node1.id,
                label: node1.label,
                total: aggregatedDocumentBudgetaireNodeTotal(node1),
                rdfi: rdfi(node1),
                children: node1.children.map(node2 => {
                    console.log(node2)
                    return {
                        id: node2.id,
                        label: node2.label,
                        // total: aggregatedDocumentBudgetaireNodeTotal(node2),
                        rdfi: rdfi(node2)
                    }
                })
            }
        })
        .sort((a, b) => b.total - a.total)

    console.log('families', families)
    const maxNodeValue = max([].concat(...families.map(f => f.children)), f => f.total);

    return (<div className="bubble-chart-cluster">
        {families.map((node) => (<BubbleChartNode key={`rd-CH${node.id}`} node={node} maxNodeValue={maxNodeValue} />))}
    </div>)
}
