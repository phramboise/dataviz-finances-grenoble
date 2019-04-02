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

export default class BubbleChartCluster extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            RorD: 'D',
            F: true,
            I: true,
            activeElement: null
        }

        this.toggle = this.toggle.bind(this);
    }

    toggle (RDFI) {
        const stateValue = this.state[RDFI];
        this.setState({ [RDFI]: !stateValue });
    }

    render() {
        const {recetteTree, dépenseTree} = this.props;
        const {RorD, F, I} = this.state;
        const RD = RorD ? 'R' : 'D';

        if (!recetteTree || !dépenseTree) {
            return null;
        }
       
        // PROBLEM This is super-hardcoded
        if(!(RorD === 'D' && F)){
            return null
        }

        const families = dépenseTree
            .children.find(c => c.id.includes('FONCTIONNEMENT'))
            .children.find(c => c.id.includes('Gestion courante'))
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

        console.log('families', families)

        return (<div className="bubble-chart-cluster">
            <nav className="legend-list legend-list--interactive">
                <ul>
                    <li>
                        <label>
                            <input type="radio" name="rd" value="R" onClick={() => this.setState({ RorD: 'R' })} defaultChecked={RorD === 'R'} /> recettes
                        </label>
                    </li>
                    <li>
                        <label>
                            <input type="radio" name="rd" value="D" onClick={() => this.setState({ RorD: 'D' })} defaultChecked={RorD === 'D'} /> dépenses
                        </label>
                    </li>
                </ul>

                <ul>
                    <li>
                        <label>
                            <input type="checkbox" name="fi" value="F" onClick={() => this.toggle('F')} defaultChecked={F} /> fonctionnement
                        </label>
                    </li>
                    <li>
                        <label>
                            <input type="checkbox" name="fi" value="I" onClick={() => this.toggle('I')} defaultChecked={I} /> investissement
                        </label>
                    </li>
                </ul>
            </nav>

            {families.map((node) => (<BubbleChartNode key={`rd-CH${node.id}`} node={node} />))}
        </div>)
    }
}
