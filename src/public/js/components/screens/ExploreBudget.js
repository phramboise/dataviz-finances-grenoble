import { Map as ImmutableMap, List } from "immutable";

import React, {Fragment, useRef, useCallback} from "react";
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
import { getElementById, flattenTree } from '../../../../shared/js/finance/visitHierarchical.js';


import PageTitle from "../../../../shared/js/components/gironde.fr/PageTitle";
import DownloadSection from "../../../../shared/js/components/gironde.fr/DownloadSection";

import MoneyAmount, {makeAmountString, percentage} from "../../../../shared/js/components/MoneyAmount";
import StackChart from '../../../../shared/js/components/StackChart';

import InvestissementIcon from "../../../../../images/icons/rdfi-investissement.svg";
import FonctionnementIcon from "../../../../../images/icons/rdfi-fonctionnement.svg";

import ByPolitiqueSection from "../HomeSectionByPolitique.js";
import EvolutionSection from "../HomeSectionEvolution.js";
import BigNumbersSection from "../HomeSectionBigNumbers.js";


const RDFIcon = (rdfi) => rdfi.includes('FONCTIONNEMENT') ? FonctionnementIcon : InvestissementIcon;
const scrollTo = (ref) => window.scrollTo({top: ref.current.offsetTop, behavior: 'smooth'});



export function ExploreBudget (props) {
    const { explorationYear, totals, aggregationByYear, resources } = props
    const { changeExplorationYear, financeDetailId, politiqueId, contentElement, rdfi } = props;
    const { politiqueView } = props;
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

    // active Big Numbers
    const bigNumbersRef = useRef(null);
    const evolutionRef = useRef(null);
    const byPolitiqueRef = useRef(null);

    // BigNumbers data
    const expenditureItems = new List([
        {
            id: 'DEPENSE/FONCTIONNEMENT',
            text: 'Dépenses de fonctionnement',
            description: `Les **dépenses de fonctionnement** comprennent toutes
                            les dépenses nécessaires au fonctionnement des services
                            de la ville, c’est-à-dire les dépenses qui reviennent régulièrement
                            chaque année. Il s’agit principalement des postes suivants :
                            dépenses de personnel, des achats de fournitures et prestations de
                            service, des frais de fonctionnement des services et
                            bâtiments municipaux mais aussi des intérêts de la
                            dette et des participations et subventions aux
                            organismes extérieures et aux associations.`,
            colorClassName:'rdfi-D rdfi-F',
            value: totals.get(DF)
        },
        {
            id: 'DEPENSE/INVESTISSEMENT',
            text: 'Dépenses d\'investissement',
            description: `Les **dépenses d'investissement** regroupent
                essentiellement les opérations se
                traduisant par une modification de la valeur
                du patrimoine de la ville : construction ou
                aménagement de bâtiments, travaux d’infrastructure
                et sur les espaces publics, achats de matériels
                et d’équipements durables mais aussi le
                remboursement en capital des emprunts et toute
                acquisition de titres de participation.`,
            colorClassName:'rdfi-D rdfi-I',
            value: totals.get(DI)
        },
    ]);

    const revenueItems = new List([
        {
            id: 'RECETTE/FONCTIONNEMENT',
            text: 'Recettes de fonctionnement',
            description: `Les **recettes de fonctionnement** regroupent
                l’ensemble des ressources nécessaires au
                fonctionnement des services de la ville.
                Ce sont principalement des recettes fiscales
                (taxe d’habitation, taxes foncières, droits de
                mutation, compensations issues des différentes
                réformes fiscales), des dotations (de l’Etat, des
                Fonds de Péréquation) et subventions
                (de différents partenaires) ou le produits des
                services rendus par la ville (restauration scolaire,
                centres de loisirs, activités culturelles, de
                santé, etc.).`,
            colorClassName:'rdfi-R rdfi-F',
            value: totals.get(RF)
        },
        {
            id: 'RECETTE/INVESTISSEMENT',
            text: 'Recettes d\'investissement',
            description: `Les **recettes d'investissement** regroupent
                différentes ressources directement affectées au
                financement des dépenses d’investissement :
                remboursement par l’Etat de la TVA payé sur
                certaines opérations d’investissement (FCTVA),
                subventions de différents partenaires, fiscalité
                spécifique (taxe d’aménagement), cessions
                d’immobilisations et en derniers recours : l’emprunt.

                _<acronym title="Nota bene">NB</acronym> : Seules les dépenses d’investissement peuvent être financées par l’emprunt._`,
            colorClassName:'rdfi-R rdfi-I',
            value: totals.get(RI)
        },
    ]);

    const topLevelElement = contentElement && revenueItems.concat(expenditureItems).find(d => contentElement.id.includes(d.id))


    // Bubble data
    const bubbleTreeData = contentElement && hierarchicalByPolitique(contentElement);

    // Build stackachart data from rdfiTree
    const years = aggregationByYear.keySeq().toArray();

    const barchartPartitionByYear = rdfiTreeByYear.map(rdfiTree => {
        const rootNode = flattenTree(rdfiTree).find(({id}) => id.includes(financeDetailId))
        // Create "level 2" data as a list
        return (rootNode.children || [rootNode]).map(c => {
            return {
                contentId: c.id,
                partAmount: aggregatedDocumentBudgetaireNodeTotal(c),
                label: c.label,
                url: `#!/explorer/${c.id}`
            }
        })
    })

    const colorClassById = new Map()
    let legendItemIds = [];
    if(barchartPartitionByYear.get(explorationYear)){
        barchartPartitionByYear.get(explorationYear).forEach(({contentId}, i) => {
            colorClassById.set(contentId, `rdfi-${RD} rdfi-${FI} area-color-${i+1}`)
        })

        legendItemIds = new Set(
            barchartPartitionByYear
                .map(partition => partition.map(part => part.contentId))
                .valueSeq()
                .toArray()
                .flat()
        )
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
            url: currentYearrdfiTree.id.includes(financeDetailId) ? `#!/explorer/${foundPart.contentId}` : undefined,
            text: foundPart.label,
            colorClassName: colorClassById.get(foundPart.contentId)
        }
    });

    const BubbleChartInnerTooltip = useCallback(({node}) => {
        return <div className={`rdfi-${RD} rdfi-${FI}`}>
            <p className='react-tooltip-type-aggregation'>
                {topLevelElement.text}
            </p>

            <p>
                {node.label}<MoneyAmount amount={node.total} />
                <small>soit {percentage(node.total, topLevelElement.value)} en {explorationYear}</small>
            </p>
        </div>
    }, [topLevelElement])


    return <Fragment>
        <article className="explore-budget">
            <PageTitle text="Explorer les comptes de la ville" />

            <BigNumbersSection {...{bigNumbersRef, RDFIcon, changeExplorationYear, explorationYear, revenueItems, expenditureItems, years}}
                onNumberClick={(item) => {scrollTo(evolutionRef); page(`/explorer/${item.id}`)}} />

            <EvolutionSection
                {...{evolutionRef, currentYearrdfiTree, RDFIcon, years, revenueItems, expenditureItems, financeDetailId}}
                onSelect={({target}) => page(`/explorer/${target.value}`)}
                onTabClick={(item) => page(`/explorer/${item.id}`)}>

                <StackChart
                    xs={years}
                    ysByX={barchartPartitionByYear.map(partition => partition.map(part => [part.contentId, part.partAmount]))}
                    selectedX={explorationYear}
                    legendItems={legendItems}
                    yValueDisplay={makeAmountString}
                    contentId={currentYearrdfiTree && currentYearrdfiTree.id}
                    onSelectedXAxisItem={changeExplorationYear}
                    onBrickClicked={contentElement && Array.isArray(contentElement.children) ? (year, itemId) => { page(`/explorer/${itemId}`); changeExplorationYear(year); } : undefined}
                    WIDTH={500}
                    HEIGHT={250 * Math.max(legendItems.length / 10, 1)}
                    BRICK_SPACING={2}
                    MIN_BRICK_HEIGHT={0.1}
                    BRICK_RADIUS={0}
                    BRICK_DISPLAY_VALUE={false}
                />
            </EvolutionSection>

            <ByPolitiqueSection {...{byPolitiqueRef, BubbleChartInnerTooltip, topLevelElement, contentElement, politiqueView, politiqueId, bubbleTreeData, changeExplorationYear, explorationYear, years, RD, FI}} />
        </article>
        <DownloadSection {...resources} />
    </Fragment>;
}

export default connect(
    state => {
        const {
            docBudgByYear,
            aggregationByYear,
            financeDetailId,
            politiqueId,
            explorationYear,
            politiqueView,
            resources,
        } = state;

        const documentBudgetaire = docBudgByYear.get(explorationYear);
        const aggregationTree = aggregationByYear.get(explorationYear)
        const rdfi = financeDetailId.split('/').map(id => id[0]).slice(0, 2);

        const contentElement = documentBudgetaire && getElementById(aggregationTree, financeDetailId);

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
            politiqueId,
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
