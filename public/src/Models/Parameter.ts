

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

    clone() {
        let parameter = new Parameter(this.parameterName, this.max, this.min, this.discreteStep);
        parameter.currentMax = this.currentMax;
        parameter.currentMin = this.currentMin;
        return parameter;
    }
}