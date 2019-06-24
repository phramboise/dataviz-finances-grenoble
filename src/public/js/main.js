import { createStore } from 'redux';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Record, Map as ImmutableMap, List, Set as ImmutableSet } from 'immutable';
import { csv } from 'd3-fetch';
import page from 'page';

import {assets, FINANCE_DATA, AGGREGATED_ATEMPORAL, AGGREGATED_TEMPORAL, CORRECTIONS_AGGREGATED} from './constants/resources';
import reducer from './reducer';

import {LigneBudgetRecord, DocumentBudgetaire} from 'document-budgetaire/Records.js';
import csvStringToCorrections from '../../shared/js/finance/csvStringToCorrections.js';
import {childToParent, elementById} from '../../shared/js/finance/flatHierarchicalById.js';

import Breadcrumb from '../../shared/js/components/Breadcrumb';
import ExploreBudget from './components/screens/ExploreBudget';

import { HOME } from './constants/pages';
import {
    FINANCE_DATA_RECIEVED, CORRECTION_AGGREGATION_RECEIVED,
    ATEMPORAL_TEXTS_RECEIVED, TEMPORAL_TEXTS_RECEIVED,
    FINANCE_DETAIL_ID_CHANGE, CHANGE_EXPLORATION_YEAR,
    CHANGE_POLITIQUE_VIEW,
} from './constants/actions';


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
        text: 'Accueil',
        url: '/'
    },
    {
        text: 'Vie citoyenne',
        url: '/vie-citoyenne/la-municipalite/'
    },
    {
        text: 'Finances et marchés publics',
        url: '/vie-citoyenne/finances-et-marches-publics/'
    },
]);

const logError = (error) => console.error(error.message, error.trace);

const StoreRecord = Record({
    docBudgByYear: undefined,
    aggregationByYear: undefined,
    corrections: undefined,
    explorationYear: undefined,
    // ImmutableMap<id, FinanceElementTextsRecord>
    textsById: undefined,
    financeDetailId: undefined,
    politiqueView: undefined,
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
        aggregationByYear: new ImmutableMap(),
        explorationYear: undefined,
        financeDetailId: undefined,
        textsById: ImmutableMap([[HOME, {label: 'Accueil'}]]),
        politiqueView: 'aggregated',
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
    })
    .catch(logError);


const docBudgsP = fetch(assets[FINANCE_DATA]).then(resp => resp.json())
    .then(({documentBudgetaires, aggregations}) => {
        documentBudgetaires = documentBudgetaires.map(db => {
            db.rows = new ImmutableSet(db.rows.map(LigneBudgetRecord))
            return DocumentBudgetaire(db)
        })

        const mostRecentYear = documentBudgetaires.map(({Exer}) => Exer).sort((a, b) => a-b).pop()

        store.dispatch({
            type: CHANGE_EXPLORATION_YEAR,
            year: mostRecentYear,
        });

        store.dispatch({
            type: FINANCE_DATA_RECIEVED,
            documentBudgetaires,
            aggregations
        });

        return documentBudgetaires;
    })
    .catch(logError);


csv(assets[AGGREGATED_ATEMPORAL])
    .then(textList => {
        store.dispatch({
            type: ATEMPORAL_TEXTS_RECEIVED,
            textList
        });
    })
    .catch(logError);

csv(assets[AGGREGATED_TEMPORAL])
    .then(textList => {
        store.dispatch({
            type: TEMPORAL_TEXTS_RECEIVED,
            textList
        });
    })
    .catch(logError);



/**
 *
 * Routing
 *
 */

page('/', () => page.redirect('/explorer'));
page('/explorer/:financeDetailId?', ({params: {financeDetailId='DEPENSE FONCTIONNEMENT'}}) => {
    store.dispatch({ type: FINANCE_DETAIL_ID_CHANGE, financeDetailId })

    ReactDOM.render(
        React.createElement(
            Provider,
            { store },
            React.createElement(ExploreBudget)
        ),
        CONTAINER_ELEMENT
    );


    const breadcrumb = DEFAULT_BREADCRUMB.push({
        text: 'Recettes et dépenses open data',
        url: '#!/explorer'
    });

    ReactDOM.render(<Breadcrumb items={breadcrumb} />, BREADCRUMB_CONTAINER );
});

//
// page('/finance-details/:contentId', ({params: {contentId}}) => {
//     console.log('in route', '/finance-details', contentId)
//     scrollTo(0, 0);
//
//     store.dispatch({
//         type: FINANCE_DETAIL_ID_CHANGE,
//         financeDetailId: contentId
//     })
//
//     ReactDOM.render(
//         React.createElement(
//             Provider,
//             { store },
//             React.createElement(FinanceElement)
//         ),
//         CONTAINER_ELEMENT
//     );
//
//     /*const breadcrumbData = [];
//
//     let currentContentId = contentId.startsWith('M52-') ?
//         contentId.slice(7) :
//         contentId;
//
//     while(currentContentId){
//         if(currentContentId !== 'Total'){
//             breadcrumbData.push({
//                 text: elementById.get(currentContentId).label,
//                 url: `#!/finance-details/${currentContentId}`
//             })
//         }
//         currentContentId = childToParent.get(currentContentId);
//     }
//
//     breadcrumbData.push({
//         text: 'Explorer',
//         url: `#!/explorer`
//     })
//
//     const breadcrumb = DEFAULT_BREADCRUMB.concat(breadcrumbData.reverse());
//
//     ReactDOM.render( React.createElement(Breadcrumb, { items: breadcrumb }), BREADCRUMB_CONTAINER );*/
//
// });

page('*', (ctx) => {
    console.error('Page introuvable %o', ctx);
});

page.base(location.pathname);
page.strict(true);

page({ hashbang: true });
