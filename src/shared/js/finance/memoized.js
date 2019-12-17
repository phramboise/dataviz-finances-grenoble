import memoize from 'lodash.memoize';

import _hierarchicalByFunction from './hierarchicalByFunction.js';
import _hierarchicalByPolitique from './hierarchicalByPolitique.js';

import objectId from '../objectId';

function hierarchMemoizeResolver(o, RDFI){
    return objectId(o) + RDFI;
}

export const hierarchicalByFunction = memoize(_hierarchicalByFunction, hierarchMemoizeResolver);
export const hierarchicalByPolitique = memoize(_hierarchicalByPolitique);
