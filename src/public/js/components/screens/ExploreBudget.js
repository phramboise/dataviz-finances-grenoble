import { Map as ImmutableMap, List } from "immutable";

import React, {Component} from "react";
import { connect } from "react-redux";

import { sum } from "d3-array";
import page from "page";

import {
    RF,
    RI,
    DF,
    DI,
    EXPENDITURES,
    REVENUE
} from "../../../../shared/js/finance/constants";
import { CHANGE_EXPLORATION_YEAR, CHANGE_POLITIQUE_VIEW } from "../../constants/actions.js";

import { hierarchicalByFunction, hierarchicalByPolitique } from "../../../../shared/js/finance/memoized";
import { aggregatedDocumentBudgetaireNodeTotal } from '../../../../shared/js/finance/AggregationDataStructures'
import { getElementById } from '../../../../shared/js/finance/visitHierarchical.js';


import PageTitle from "../../../../shared/js/components/gironde.fr/PageTitle";
import DownloadSection from "../../../../shared/js/components/gironde.fr/DownloadSection";

import {makeAmountString} from "../../../../shared/js/components/MoneyAmount";

import InvestissementIcon from "../../../../../images/icons/rdfi-investissement.svg";
import FonctionnementIcon from "../../../../../images/icons/rdfi-fonctionnement.svg";
import AggregatedViewIcon from "../../../../../images/icons/aggregation.svg";
import DetailedViewIcon from "../../../../../images/icons/details.svg";

import BigNumbers from "../../../../shared/js/components/BigNumbers.js";
import StackChart from '../../../../shared/js/components/StackChart';
import BubbleChartCluster from "../../../../shared/js/components/BubbleChartCluster.js";
import DetailsTable from "../../../../shared/js/components/DetailsTable.js";


const RDFIcon = (rdfi) => rdfi.includes('FONCTIONNEMENT') ? FonctionnementIcon : InvestissementIcon;

export function ExploreBudget (props) {
    const { explorationYear, totals, aggregationByYear, resources } = props
    const { changeExplorationYear, financeDetailId, contentElement, rdfi } = props;
    const { changePolitiqueView, FinanceUserView, politiqueView } = props;
    const [RD, FI] = [ rdfi[0], rdfi[1] ];

    const rdfiTreeByYear = aggregationByYear.map(aggregationTree => {
        const rdTree = (RD === 'D' ?
            aggregationTree.children.find(c => c.id.includes('DEPENSE')) :
            aggregationTree.children.find(c => c.id.includes('RECETTE'))
        )

        return rdTree && (FI === 'I' ?
            rdTree.children.find(c => c.id.includes('INVESTISSEMENT')) :
            rdTree.children.find(c => c.id.includes('FONCTIONNEMENT'))
        );
    })
    const currentYearrdfiTree = rdfiTreeByYear.get(explorationYear);

    const expenditures = totals.get(EXPENDITURES);
    const revenue = totals.get(REVENUE);

    // BigNumbers data
    const expenditureItems = new List([
        { id: 'DEPENSE FONCTIONNEMENT', text: 'Dépenses de fonctionnement', description: `Regroupe…`, colorClassName:'rdfi-D rdfi-F', value: totals.get(DF) },
        { id: 'DEPENSE INVESTISSEMENT', text: 'Dépenses d\'investissement', description: `Regroupe…`, colorClassName:'rdfi-D rdfi-I', value: totals.get(DI) },
    ]);

    const revenueItems = new List([
        { id: 'RECETTE FONCTIONNEMENT', text: 'Recettes de fonctionnement', description: `Provient de…`, colorClassName:'rdfi-R rdfi-F', value: totals.get(RF) },
        { id: 'RECETTE INVESTISSEMENT', text: 'Recettes d\'investissement', description: `Provient de…`, colorClassName:'rdfi-R rdfi-I', value: totals.get(RI) },
    ]);


    // Bubble data
    const bubbleTreeData = contentElement && hierarchicalByPolitique(contentElement)

    // Build stackachart data from rdfiTree
    const years = aggregationByYear.keySeq().toArray();

    const barchartPartitionByYear = rdfiTreeByYear.map(rdfiTree => {
        // Create "level 2" data as a list
        return (rdfiTree.id.includes(financeDetailId) ? rdfiTree : rdfiTree.children.find(({id}) => id.includes(financeDetailId))).children.map(c => {
            return {
                contentId: c.id,
                partAmount: aggregatedDocumentBudgetaireNodeTotal(c),
                label: c.label,
                url: `#!/explorer/${c.id.replace(/^Budget Montreuil /, '')}`
            }
        })
    })

    const colorClassById = new Map()
    let legendItemIds = [];
    if(barchartPartitionByYear.get(explorationYear)){
        barchartPartitionByYear.get(explorationYear).forEach(({contentId}, i) => {
            colorClassById.set(contentId, `rdfi-${RD} rdfi-${FI} area-color-${i+1}`)
        })

        legendItemIds = new Set(barchartPartitionByYear
            .map(partition => partition.map(part => part.contentId)).valueSeq().toArray().flat())
    }

    const legendItems = [...legendItemIds].map(id => {
        let foundPart;

        barchartPartitionByYear.find(partition => {
            foundPart = partition.find(p => p.contentId === id )
            return foundPart;
        })

        return {
            id: foundPart.contentId,
            className: foundPart.contentId,
            url: currentYearrdfiTree.id.includes(financeDetailId) ? `#!/explorer/${foundPart.contentId.replace(/^Budget Montreuil /, '')}` : undefined,
            text: foundPart.label,
            colorClassName: colorClassById.get(foundPart.contentId)
        }
    });


    return (<>
    <article className="explore-budget">
        <PageTitle text="Explorer les comptes de la ville" />

        <section id="summary" className="yearly-budget" aria-label={`Les grands chiffres ${explorationYear}`} aria-describedby="yearly-budget--description">
            <h2>Les grands chiffres</h2>

            <p className="h4" id="yearly-budget--description">
                <label htmlFor="select-year">Afficher les recettes et dépenses de</label>
                <select id="select-year" value={explorationYear} onChange={(event) => changeExplorationYear(Number(event.target.value))}>
                {years.map(year => <option key={year} value={year}>l'année {year}</option>)}
                </select>
            </p>

            <div className="side-by-side" role="table">
                <BigNumbers items={revenueItems} label="revenus" iconFn={RDFIcon} />
                <BigNumbers items={expenditureItems} label="dépenses" iconFn={RDFIcon} />
            </div>
        </section>

        <section id="evolution">
            <h2>Évolution et répartition du budget</h2>

            <p className="h4">Sélectionner la catégorie du budget à afficher :</p>

            <ul className="tabs tabs--rdfi" role="tablist">
                {revenueItems.concat(expenditureItems).map(item => {
                    const Icon = RDFIcon(item.id);
                    return (<li key={item.id} role="presentation">
                        <a href={`#!/explorer/${item.id}`} aria-selected={financeDetailId.includes(item.id)} className={item.colorClassName} onClick={() => page(`/explorer/${item.id}`)} role="tab">
                            <Icon className="icon" aria-hidden={true} />
                            {item.text}
                        </a>
                    </li>)
                })}
            </ul>
            <div className="tabpanel" role="tabpanel">
                <p className="h4" aria-hidden={true}>
                    <label htmlFor="select-tree-root">Afficher</label>
                    <select id="select-tree-root" value={financeDetailId} onChange={({target}) => page(`/explorer/${target.value}`)}>
                        {revenueItems.concat(expenditureItems).map(item => {
                            if (currentYearrdfiTree && financeDetailId.includes(item.id)) {
                                return (<>
                                    <option key={item.id} value={item.id} className="selected">Toutes les {item.text.toLocaleLowerCase()}</option>
                                    <optgroup label={`Certaines ${item.text.toLocaleLowerCase()}`}>
                                        {currentYearrdfiTree.children.map(node => (
                                            <option key={node.id.replace(/^Budget Montreuil /, '')} value={`${node.id.replace(/^Budget Montreuil /, '')}`}>{node.label}</option>
                                        ))}
                                    </optgroup>
                                </>);
                            }
                            else {
                                return (<option key={item.id} value={item.id}>{item.text}</option>);
                            }
                        })}
                    </select>
                </p>

                {
                    currentYearrdfiTree ?
                        <StackChart
                            xs={ years }
                            ysByX={barchartPartitionByYear.map(partition => partition.map(part => part.partAmount))}
                            selectedX={ explorationYear }
                            legendItems={ legendItems }
                            yValueDisplay={makeAmountString}
                            contentId={currentYearrdfiTree.id}
                            onSelectedXAxisItem={changeExplorationYear}
                            WIDTH={500}
                            HEIGHT={250}
                            BRICK_SPACING={2}
                            MIN_BRICK_HEIGHT={1}
                            BRICK_RADIUS={0}
                            BRICK_DISPLAY_VALUE={false}
                        /> :
                        undefined
                }
            </div>
        </section>

        <section className="discrete" id="politiques">
            <h2>Répartition par politique publique</h2>

            <p className="intro">
                Qu’est-ce que c’est les politiques et sous-politiques publique ?
                Le Lorem Ipsum est simplement du faux texte employé dans la composition
                et la mise en page avant impression.
            </p>

            <ul className="inline-tabs" role="tablist">
                <li role="presentation">
                    <button aria-selected={politiqueView === 'aggregated'} className="link" role="tab" onClick={() => changePolitiqueView('aggregated')}>
                        <AggregatedViewIcon className="icon icon--small" />
                        vue agrégée
                    </button>
                </li>
                <li role="presentation">
                    <button aria-selected={politiqueView === 'tabular'} className="link" role="tab" onClick={() => changePolitiqueView('tabular')}>
                        <DetailedViewIcon className="icon icon--small" />
                        vue détaillée
                    </button>
                </li>
                <li role="presentation">
                    <input type="checkbox" checked={false} id="hr-checkbox" />
                    <label htmlFor="hr-checkbox">voir la part des ressources humaines</label>
                </li>
            </ul>
            <div className="tabpanel" role="tabpanel">
                <FinanceUserView families={bubbleTreeData}
                                 element={contentElement}
                                 onNodeClick={(family, node) => changePolitiqueView('tabular')}/>
            </div>
        </section>
    </article>
    <DownloadSection {...resources} />
    </>);
}

export default connect(
    state => {
        const {
            docBudgByYear,
            aggregationByYear,
            financeDetailId,
            explorationYear,
            politiqueView,
            resources,
        } = state;

        const documentBudgetaire = docBudgByYear.get(explorationYear);
        const aggregationTree = aggregationByYear.get(explorationYear)
        const rdfi = financeDetailId.replace(/^Budget Montreuil /, '').split(' ').map(id => id[0]).slice(0, 2);

        const FinanceUserView = politiqueView === 'aggregated' ? BubbleChartCluster : DetailsTable;
        const contentElement = documentBudgetaire && getElementById(aggregationTree, 'Budget Montreuil ' + financeDetailId);

        let totals = new ImmutableMap();
        if (documentBudgetaire) {
            totals = new ImmutableMap({
                [REVENUE]: sum(documentBudgetaire.rows.filter(r => r.CodRD === 'R').map(r => r.MtReal).toArray()),
                [EXPENDITURES]: sum(documentBudgetaire.rows.filter(r => r.CodRD === 'D').map(r => r.MtReal).toArray()),
                [DF]: hierarchicalByFunction(documentBudgetaire, DF).total,
                [DI]: hierarchicalByFunction(documentBudgetaire, DI).total,
                [RF]: hierarchicalByFunction(documentBudgetaire, RF).total,
                [RI]: hierarchicalByFunction(documentBudgetaire, RI).total
            });
        }

        return {
            explorationYear,
            contentElement,
            totals,
            aggregationByYear,
            financeDetailId,
            FinanceUserView,
            politiqueView,
            rdfi,
            resources,
        };
    },
    (dispatch) => ({
        changeExplorationYear(year){
            dispatch({ type: CHANGE_EXPLORATION_YEAR, year })
        },
        changePolitiqueView(view){
            dispatch({ type: CHANGE_POLITIQUE_VIEW, view })
        },
    })
)(ExploreBudget);
