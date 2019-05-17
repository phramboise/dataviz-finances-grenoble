import React from 'react';

import { hierarchicalByFunction } from "../finance/memoized.js";
import {aggregatedDocumentBudgetaireNodeTotal} from "../finance/AggregationDataStructures.js"

import {max} from "d3-array";

import MoneyAmount from "./MoneyAmount.js";
import BubbleChartNode from "./BubbleChartNode.js";

// TODO not sure this function makes sense with aggregation
const mergeHierarchies = (...hierarchies) => {
    const levels = new Map();

    hierarchies.forEach(children => {
        children.forEach(node => {
            const {id, label, children} = node
            // We get the '122' part of `M52-DF-122`
            const levelId = id.split('-').pop();

            if (!levels.has(levelId)) {
                levels.set(levelId, {
                    id: levelId,
                    label,
                    total: aggregatedDocumentBudgetaireNodeTotal(node),
                    children: [],
                });
            }

            levels.get(levelId).children = levels.get(levelId).children.concat(children.toArray());
        });
    });

    return Array.from(levels.values()).sort((a, b) => b.total - a.total);
};

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
                rdfi: 'DF',
                children: node1.children.map(node2 => {
                    return {
                        id: node2.id,
                        label: node2.label,
                        total: aggregatedDocumentBudgetaireNodeTotal(node2),
                        rdfi: 'DF'
                    }
                })
            }
        })
        .sort((a, b) => b.total - a.total)
        .toJS()

    console.log('families', families)
    const maxNodeValue = max([].concat(...families.map(f => f.children)), f => f.total);

    return (<div className="bubble-chart-cluster">
        {families.map((node) => (<BubbleChartNode key={`rd-CH${node.id}`} node={node} maxNodeValue={maxNodeValue} />))}
    </div>)
}
