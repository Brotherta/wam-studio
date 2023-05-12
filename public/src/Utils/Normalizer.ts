


export function verifyString(toVerify: string | null) {
    if (toVerify == null || toVerify == '') {
        alert("Not empty please !");
        return false;
    }
    if (!/^[a-zA-Z]+$/.test(toVerify)) {
        alert("Only letters please (a-Z)");
        return false;
    }
    if (toVerify.length > 16) {
        alert("No more than 16 chars please...");
        return false;
    }
    return true;
}

export function getMinMax(param: String) {
    if (param.includes("Equalizer")) {
        let type = param.split(" ")[3];
        if (type == "enabled") return undefined;
        type = type.split("_")[2];
        switch (type) {
            case "Q":
                return {min: -60, max: 40};
            case "detune":
                return {min: 0, max: 0};
            case "gain":
                return {min: -60, max: 40};
            case "frequency":
                return {min: 0, max: 24000};
        }
    }
    return undefined;
}

export function normalizeValue(value: string, min: number | undefined, max: number | undefined, minValue: number, maxValue: number, type: string) {
    let nodeRange = maxValue - minValue;
    let normalizedValue = minValue + (nodeRange * parseFloat(value) / 100);

    if (type == "float") {
        normalizedValue = parseFloat(normalizedValue.toFixed(2));
    }
    else if (type == "integer") {
        normalizedValue = Math.round(normalizedValue);
    }

    let istart = minValue ;
    let istop = maxValue
    let ostart = (min !== undefined) ? min : minValue;
    let ostop = (max) !== undefined ? max : maxValue;

    return ostart + (ostop - ostart) * ((normalizedValue - istart) / (istop - istart));
}