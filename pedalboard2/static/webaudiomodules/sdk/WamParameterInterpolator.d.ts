import { WamParameterInterpolator } from './types';

declare const getWamParameterInterpolator: (moduleId?: string) => typeof WamParameterInterpolator;

export default getWamParameterInterpolator;
