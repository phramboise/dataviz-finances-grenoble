import React from 'react';

import { hierarchicalByFunction } from "../finance/memoized.js";
import {aggregatedDocumentBudgetaireNodeTotal} from "../finance/AggregationDataStructures.js"

import MoneyAmount from "./MoneyAmount.js";
import BubbleChartNode from "./BubbleChartNode.js";

// TODO not sure this function makes sense with aggregation
const mergeHierarchies = (...hierarchies) => {
    const levels = new Map();

    hierarchies.forEach(children => {
        children.forEach(node => {
            const {id, label, children} = node
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
        .children.toJS()
        .map(node => {
            return {
                id: node.id,
                label: node.label,
                total: aggregatedDocumentBudgetaireNodeTotal(node),
                rdfi: 'DF',
                children: node.children.map(c => {
                    return {
                        id: c.id,
                        label: c.label,
                        total: aggregatedDocumentBudgetaireNodeTotal(c),
                        rdfi: 'DF',
                        children: node.children.map(c => {
                            return {
                                id: c.id,
                                label: c.label,
                                total: aggregatedDocumentBudgetaireNodeTotal(c),
                                rdfi: 'DF'
                            }
                        })
                    }
                })
            }
        })

    return (<div className="bubble-chart-cluster">
        {families.map((node) => (<BubbleChartNode key={`rd-CH${node.id}`} node={node} />))}
    </div>)
}
