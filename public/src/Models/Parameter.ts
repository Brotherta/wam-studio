

export default class Parameter {

    parameterName: string;

    max: number;
    min: number;

    currentMax: number;
    currentMin: number;

    discreteStep: number;

    constructor( parameterName: string, max: number, min: number, discreteStep: number) {
        this.parameterName = parameterName;
        this.max = max;
        this.min = min;
        this.currentMax = max;
        this.currentMin = min;
        this.discreteStep = discreteStep;
    }
}