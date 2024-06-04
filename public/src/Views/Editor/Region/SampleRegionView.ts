import { Graphics } from "pixi.js";
import { HEIGHT_TRACK } from "../../../Env";
import SampleRegion from "../../../Models/Region/SampleRegion";
import EditorView from "../EditorView";
import RegionView from "./RegionView";

/**
 * Class that extends PIXI.Container.
 * It will contain the PIXI.Graphics that represents the waveform of the current region.
 */
export default class SampleRegionView extends RegionView<SampleRegion> {

    constructor(editor: EditorView, trackId: number, region: SampleRegion) {
        super(editor,trackId,region);
    }

  

    /**
     * Draws the waveform of the track.
     *
     * @param color - The color in HEX format (#FF00FF).
     * @param region - The region that will contain the buffer to draw.
     */
    override drawContent(target: Graphics, color: string, region: SampleRegion){
        let range = region.width;
        this.scale.x = 1;

        let colorHex = +("0x" + color.slice(1));
        target.clear();
        // use some color transparency as regions can overlap
        target.beginFill(colorHex, 0.8);

        let amp = (HEIGHT_TRACK-1) / 2;
        for (let channel = 0; channel < region.buffer.numberOfChannels; channel++) {
            let data = region.buffer.getChannelData(channel);
            let step = Math.round(data.length / range);

            for (let i = 0; i < range; i++) {
                let min = 1.0;
                let max = -1.0;
                for (let j = 0; j < step; j++) {
                    let dataum = data[i * step + j];
                    if (dataum < min) min = dataum;
                    if (dataum > max) max = dataum;
                }
                const rectWidth = 1;
                let rectHeight = Math.max(1, (max-min) * amp);

                // MB: we need to clip the rectangle so that if does not go over track dimensions
                if(rectHeight < HEIGHT_TRACK) {
                    target.drawRect(i, (1+min) * amp, rectWidth, rectHeight);
                } else {
                    rectHeight = HEIGHT_TRACK;
                    target.drawRect(i, 0 * amp, rectWidth, rectHeight);
                }
            }
        }
    }

}