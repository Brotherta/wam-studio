import { WamParameterInfo } from '@webaudiomodules/api';

declare const getWamParameterInfo: (moduleId?: string) => typeof WamParameterInfo;

export default getWamParameterInfo;
