import { Record } from 'immutable';
import { markdown as md } from '../../shared/js/components/Markdown';

import {
    FINANCE_DETAIL_ID_CHANGE, FINANCE_DATA_RECIEVED, CORRECTION_AGGREGATION_RECEIVED,
    ATEMPORAL_TEXTS_RECEIVED, TEMPORAL_TEXTS_RECEIVED,
    CHANGE_EXPLORATION_YEAR, CHANGE_CURRENT_YEAR,
    CHANGE_POLITIQUE_VIEW,
} from './constants/actions';

const FinanceElementTextsRecord = Record({
    label: undefined,
    atemporal: undefined,
    temporal: undefined
});


export default function reducer(state, action) {
    const {type} = action;

    switch (type) {
        case FINANCE_DATA_RECIEVED:{
            const {documentBudgetaires, aggregations} = action;

            let newState = state;

            for(const db of documentBudgetaires){
                newState = newState.setIn(['docBudgByYear', db.Exer], db);
            }

            for(const {year, aggregation} of aggregations){
                newState = newState.setIn(['aggregationByYear', year], aggregation);
            }

            return newState
        }
        case CORRECTION_AGGREGATION_RECEIVED: {
            const {corrections} = action;
            return state.set('corrections', corrections);
        }
        case FINANCE_DETAIL_ID_CHANGE:
            return state.merge({
                financeDetailId: action.financeDetailId,
                politiqueId: action.politiqueId
            });
        case ATEMPORAL_TEXTS_RECEIVED: {
            let textMap = state.get('textsById');

            action.textList.forEach(({id, label = '', description = ''}) => {
                // sometimes, humans leave a space somewhere
                id = id.trim();

                const financeElementTexts = textMap
                    .get(id, new FinanceElementTextsRecord())
                    .set('atemporal', md.render(description))
                    .set('label', label.trim());
                textMap = textMap.set(id, financeElementTexts);
            });

            return state.set('textsById', textMap);
        }
        case TEMPORAL_TEXTS_RECEIVED: {
            let textMap = state.get('textsById');

            action.textList.forEach(({id, text = ''}) => {
                // sometimes, humans leave a space somewhere
                id = id.trim();

                const financeElementTexts = textMap
                    .get(id, new FinanceElementTextsRecord())
                    .set('temporal', md.render(text));
                textMap = textMap.set(id, financeElementTexts);
            });

            return state.set('textsById', textMap);
        }

        // action.view should be either 'tabular' or 'aggregated'
        case CHANGE_POLITIQUE_VIEW: {
            return state.set('politiqueView', action.view);
        }

        case CHANGE_EXPLORATION_YEAR: {
            const {year} = action;
            return state.set('explorationYear', year);
        }
        case CHANGE_CURRENT_YEAR: {
            const {year} = action;
            return state.set('currentYear', year);
        }
        case '@@redux/INIT':
            return state
        default:
            console.warn('Unhandled action type', type);
            return state;
    }
}
