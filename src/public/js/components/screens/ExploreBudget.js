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
import { CHANGE_EXPLORATION_YEAR } from "../../constants/actions.js";

import { hierarchicalByFunction } from "../../../../shared/js/finance/memoized";
import { aggregatedDocumentBudgetaireNodeTotal } from '../../../../shared/js/finance/AggregationDataStructures'


import PageTitle from "../../../../shared/js/components/gironde.fr/PageTitle";
import DownloadSection from "../../../../shared/js/components/gironde.fr/DownloadSection";

import {makeAmountString} from "../../../../shared/js/components/MoneyAmount";

import InvestissementIcon from "../../../../../images/icons/rdfi-investissement.svg";
import FonctionnementIcon from "../../../../../images/icons/rdfi-fonctionnement.svg";

import BigNumbers from "../../../../shared/js/components/BigNumbers.js";
import StackChart from '../../../../shared/js/components/StackChart';
import BubbleChartCluster from "../../../../shared/js/components/BubbleChartCluster.js";


const RDFIcon = (rdfi) => rdfi[1] === 'F' ? FonctionnementIcon : InvestissementIcon;

export function ExploreBudget (props) {
    const { explorationYear, totals, aggregationByYear, resources } = props
    const { changeExplorationYear, rdfi } = props;
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


    const expenditures = totals.get(EXPENDITURES);
    const revenue = totals.get(REVENUE);

    // BigNumbers data
    const expenditureItems = new List([
        { id: 'DF', text: 'Dépenses de fonctionnement', description: `Regroupe…`, colorClassName:'rdfi-D rdfi-F', value: totals.get(DF) },
        { id: 'DI', text: 'Dépenses d\'investissement', description: `Regroupe…`, colorClassName:'rdfi-D rdfi-I', value: totals.get(DI) },
    ]);

    const revenueItems = new List([
        { id: 'RF', text: 'Recettes de fonctionnement', description: `Provient de…`, colorClassName:'rdfi-R rdfi-F', value: totals.get(RF) },
        { id: 'RI', text: 'Recettes d\'investissement', description: `Provient de…`, colorClassName:'rdfi-R rdfi-I', value: totals.get(RI) },
    ]);


    // Bubble data
    const currentYearrdfiTree = rdfiTreeByYear.get(explorationYear);

    // For DF, dig to a specific level
    let bubbleTreeData = (currentYearrdfiTree && RD === 'D' && FI === 'F') ?
        currentYearrdfiTree.children.find(c => c.id.includes('Gestion courante'))
        : currentYearrdfiTree


    // Build stackachart data from rdfiTree
    const years = aggregationByYear.keySeq().toArray();

    const barchartPartitionByYear = rdfiTreeByYear.map(rdfiTree => {
        // Create "level 2" data as a list
        return rdfiTree.children.map(c => {
            return {
                contentId: c.id,
                partAmount: aggregatedDocumentBudgetaireNodeTotal(c),
                label: c.label
                //url: `#!/TODO`
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
            //url: foundPart.url,
            text: foundPart.label,
            colorClassName: colorClassById.get(foundPart.contentId)
        }
    });


    return (<>
    <article className="explore-budget">
        <PageTitle text="Explorer les comptes de la ville" />

        <section className="yearly-budget" aria-label={`Les grands chiffres ${explorationYear}`} aria-describedby="yearly-budget--description">
            <h2>Les grands chiffres</h2>

            <p className="h3" id="yearly-budget--description">
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

        <section>
            <h2>Évolution et répartition du budget</h2>

            <p className="h3">Sélectionner la catégorie du budget à afficher :</p>

            <ul className="tabs tabs--rdfi" role="tablist">
                {revenueItems.concat(expenditureItems).map(item => {
                    const Icon = RDFIcon(item.id);
                    return (<li key={item.id} role="presentation">
                        <a href={`#!/explorer/${item.id}`} aria-selected={item.id === rdfi} className={item.colorClassName} onClick={() => page(`/explorer/${item.id}`)} role="tab">
                            <Icon className="icon" aria-hidden={true} />
                            {item.text}
                        </a>
                    </li>)
                })}
            </ul>
            <div className="tabpanel" role="tabpanel">
                <p className="h3" aria-hidden={true}>
                    <label htmlFor="select-tree-root">Afficher</label>
                    <select id="select-tree-root" value={rdfi} onChange={({target}) => page(`/explorer/${target.value}`)}>
                        {revenueItems.concat(expenditureItems).map(item => (
                            <option key={item.id} value={item.id}>{item.text}</option>
                        ))}
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

        <section>
            <h2>Répartition par politique</h2>

            <BubbleChartCluster tree={bubbleTreeData} />
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
            explorationYear,
            rdfi,
            resources,
        } = state;

        const documentBudgetaire = docBudgByYear.get(explorationYear);

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
            totals,
            aggregationByYear,
            rdfi,
            resources,
        };
    },
    (dispatch) => ({
        changeExplorationYear(year){
            dispatch({
                type: CHANGE_EXPLORATION_YEAR,
                year
            })
        },
    })
)(ExploreBudget);
