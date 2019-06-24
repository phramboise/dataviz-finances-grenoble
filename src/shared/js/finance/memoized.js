import memoize from 'lodash.memoize';

import _hierarchicalByFunction from './hierarchicalByFunction.js';
import _hierarchicalByPolitique from './hierarchicalByPolitique.js';
import _hierarchicalAggregated from './hierarchicalAggregated.js';
import _m52ToAggregated from './m52ToAggregated.js';

import objectId from '../objectId';

function hierarchMemoizeResolver(o, RDFI){
    return objectId(o) + RDFI;
}

export const hierarchicalByFunction = memoize(_hierarchicalByFunction, hierarchMemoizeResolver);
export const hierarchicalByPolitique = memoize(_hierarchicalByPolitique);
export const hierarchicalAggregated = memoize(_hierarchicalAggregated);

export const m52ToAggregated = memoize(
    _m52ToAggregated,
    (instruction, correction) =>  objectId(instruction)+'-'+objectId(correction)
);
