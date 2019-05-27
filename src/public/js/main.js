import { createStore } from 'redux';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Record, Map as ImmutableMap, List, Set as ImmutableSet } from 'immutable';
import { csv } from 'd3-fetch';
import page from 'page';

import {assets, COMPTES_ADMINISTRATIFS, AGGREGATED_ATEMPORAL, AGGREGATED_TEMPORAL, CORRECTIONS_AGGREGATED, MONTREUIL_NOMENCLATURE} from './constants/resources';
import reducer from './reducer';

import {LigneBudgetRecord, DocumentBudgetaire} from 'document-budgetaire/Records.js';
import csvStringToCorrections from '../../shared/js/finance/csvStringToCorrections.js';
import {childToParent, elementById} from '../../shared/js/finance/flatHierarchicalById.js';

import Breadcrumb from '../../shared/js/components/Breadcrumb';
import FinanceElement from './components/screens/FinanceElement';
import ExploreBudget from './components/screens/ExploreBudget';

import { HOME } from './constants/pages';
import {
    DOCUMENTS_BUDGETAIRES_RECEIVED, CORRECTION_AGGREGATION_RECEIVED,
    ATEMPORAL_TEXTS_RECEIVED, TEMPORAL_TEXTS_RECEIVED,
    FINANCE_DETAIL_ID_CHANGE, AGGREGATION_DESCRIPTION_RECEIVED,
    CHANGE_CURRENT_YEAR, CHANGE_EXPLORATION_YEAR,
} from './constants/actions';

import MontreuilNomenclatureToAggregationDescription from './MontreuilNomenclatureToAggregationDescription.js'


import {fonctionLabels} from '../../../build/finances/finance-strings.json';


/**
 *
 * Initialize Redux store + React binding
 *
 */
const REACT_CONTAINER_SELECTOR = '.finance-dataviz-container';
const CONTAINER_ELEMENT = document.querySelector(REACT_CONTAINER_SELECTOR);

CONTAINER_ELEMENT.setAttribute('aria-live', true);

// Breadcrumb
const BREADCRUMB_CONTAINER = document.body.querySelector('.breadcrumb-container');

const DEFAULT_BREADCRUMB = List([
    {
        text: 'Explorer les comptes',
        url: '#'
    }
]);


const StoreRecord = Record({
    docBudgByYear: undefined,
    aggregationDescription: undefined,
    corrections: undefined,
    explorationYear: undefined,
    // ImmutableMap<id, FinanceElementTextsRecord>
    textsById: undefined,
    financeDetailId: undefined,
    screenWidth: undefined,
    resources: {
        dataUrl: undefined,
        sourceCodeUrl: undefined,
    },
});

const store = createStore(
    reducer,
    new StoreRecord({
        docBudgByYear: new ImmutableMap(),
        aggregationDescription: undefined,
        explorationYear: undefined,
        financeDetailId: undefined,
        textsById: ImmutableMap([[HOME, {label: 'Accueil'}]]),
        screenWidth: window.innerWidth,
        resources: {
            dataUrl: 'https://montreuil.opendatasoft.com/explore/dataset/comptes-administratifs/',
            sourceCodeUrl: 'https://github.com/dtc-innovation/dataviz-finances-montreuil/',
        }
    })
);



store.dispatch({
    type: ATEMPORAL_TEXTS_RECEIVED,
    textList: Object.keys(fonctionLabels)
        .map(fonction => ({
            id: `M52-DF-${fonction}`,
            label: fonctionLabels[fonction]
        }))
});
store.dispatch({
    type: ATEMPORAL_TEXTS_RECEIVED,
    textList: Object.keys(fonctionLabels)
        .map(fonction => ({
            id: `M52-DI-${fonction}`,
            label: fonctionLabels[fonction]
        }))
});



/**
 *
 * Fetching initial data
 *
 */
fetch(assets[CORRECTIONS_AGGREGATED]).then(resp => resp.text())
    .then(csvStringToCorrections)
    .then(corrections => {
        store.dispatch({
            type: CORRECTION_AGGREGATION_RECEIVED,
            corrections
        });
    });


const docBudgsP = fetch(assets[COMPTES_ADMINISTRATIFS]).then(resp => resp.json())
    .then(docBudgs => {
        docBudgs = docBudgs.map(db => {
            db.rows = new ImmutableSet(db.rows.map(LigneBudgetRecord))
            return DocumentBudgetaire(db)
        })

        const mostRecentYear = docBudgs.map(({Exer}) => Exer).sort((a, b) => a-b).pop()

        store.dispatch({
            type: CHANGE_EXPLORATION_YEAR,
            year: mostRecentYear,
        });

        store.dispatch({
            type: DOCUMENTS_BUDGETAIRES_RECEIVED,
            docBudgs,
        });

        return docBudgs;
    });


csv(assets[AGGREGATED_ATEMPORAL])
    .then(textList => {
        store.dispatch({
            type: ATEMPORAL_TEXTS_RECEIVED,
            textList
        });
    });

csv(assets[AGGREGATED_TEMPORAL])
    .then(textList => {
        store.dispatch({
            type: TEMPORAL_TEXTS_RECEIVED,
            textList
        });
    });

Promise.all([ csv(assets[MONTREUIL_NOMENCLATURE]), docBudgsP ])
    .then(([aggrDesc, docBudgs]) => MontreuilNomenclatureToAggregationDescription(aggrDesc, docBudgs))
    .then(aggregationDescription => {
        console.log('aggregationDescription', aggregationDescription.toJS())

        store.dispatch({
            type: AGGREGATION_DESCRIPTION_RECEIVED,
            aggregationDescription
        });
    });



/**
 *
 * Routing
 *
 */

page('/', () => page.redirect('/explorer'));
page('/explorer', () => {
    console.log('in route', '/explorer');

    ReactDOM.render(
        React.createElement(
            Provider,
            { store },
            React.createElement(ExploreBudget)
        ),
        CONTAINER_ELEMENT
    );


    const breadcrumb = DEFAULT_BREADCRUMB.push({text: 'Explorer'});
    ReactDOM.render( React.createElement(Breadcrumb, { items: breadcrumb }), BREADCRUMB_CONTAINER );
});


page('/finance-details/:contentId', ({params: {contentId}}) => {
    console.log('in route', '/finance-details', contentId)
    scrollTo(0, 0);

    store.dispatch({
        type: FINANCE_DETAIL_ID_CHANGE,
        financeDetailId: contentId
    })

    ReactDOM.render(
        React.createElement(
            Provider,
            { store },
            React.createElement(FinanceElement)
        ),
        CONTAINER_ELEMENT
    );

    /*const breadcrumbData = [];

    let currentContentId = contentId.startsWith('M52-') ?
        contentId.slice(7) :
        contentId;

    while(currentContentId){
        if(currentContentId !== 'Total'){
            breadcrumbData.push({
                text: elementById.get(currentContentId).label,
                url: `#!/finance-details/${currentContentId}`
            })
        }
        currentContentId = childToParent.get(currentContentId);
    }

    breadcrumbData.push({
        text: 'Explorer',
        url: `#!/explorer`
    })

    const breadcrumb = DEFAULT_BREADCRUMB.concat(breadcrumbData.reverse());

    ReactDOM.render( React.createElement(Breadcrumb, { items: breadcrumb }), BREADCRUMB_CONTAINER );*/

});

page('*', (ctx) => {
    console.error('Page introuvable %o', ctx);
});

page.base(location.pathname);
page.strict(true);

page({ hashbang: true });
