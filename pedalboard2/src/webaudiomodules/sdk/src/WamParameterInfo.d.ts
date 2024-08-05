import { WamParameterInfo } from '../../api';

declare const getWamParameterInfo: (moduleId?: string) => typeof WamParameterInfo;

export default getWamParameterInfo;
