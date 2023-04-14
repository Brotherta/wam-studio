

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