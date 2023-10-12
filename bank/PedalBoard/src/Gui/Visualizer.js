//import "https://preview.babylonjs.com/babylon.js";
import "./libs/babylon.js";

/**
 * @param {URL} relativeURL
 * @returns {string}
 */
const getBasetUrl = (relativeURL) => {
  const baseURL = relativeURL.href.substring(0, relativeURL.href.lastIndexOf("/"));
  return baseURL;
};
export default class Visualizer {
  _baseURL = getBasetUrl(new URL(".", import.meta.url));

  constructor(canvas, analyser) {
    this.canvas = canvas;
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.analyser = analyser;

    this.analyser.fftSize = 4096;
    this.bufferLengthAlt = this.analyser.frequencyBinCount;
    this.dataArrayAlt = new Uint8Array(this.bufferLengthAlt);

    this.createScene();
    this.initShader();

    this.resize();

    this.engine.runRenderLoop(() => {
      if (this.canvas.on) {
        this.updateTexture();
        this.scene.render();
      }
    });
  }

  resize() {
    let resized = false;
    new ResizeObserver(() => {
      resized = true;
    }).observe(this.canvas);

    this.scene.beforeRender = () => {
      if (resized) {
        this.engine.resize();
        resized = false;
      }
    };
  }

  initShader() {
    let w = this.analyser.fftSize / 2;

    let raw = new Uint8Array(w * 255 * 4);
    let texture = BABYLON.RawTexture.CreateRGBATexture(
      raw,
      w,
      255,
      this.scene,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      true
    );
    texture.hasAlpha = true;

    BABYLON.Effect.ShadersStore["customFragmentShader"] = `
    varying vec2 vUV;
    uniform sampler2D textureSampler;
    uniform float time;
    
    // Parameters
    uniform vec2 screenSize;

    vec4 firstColor = vec4(1.0,0.0,0.0,1.0); //red
    vec4 middleColor = vec4(0.0,1.0,0.0,1.0); // green
    vec4 endColor = vec4(0.0,0.0,1.0,1.0); // blue
    
    void main( void ){
        vec2 xy = gl_FragCoord.xy / screenSize.xy;

        float h = 0.5; // adjust position of middleColor
        vec4 col = mix(mix(firstColor, middleColor, xy.x/h), mix(middleColor, endColor, (xy.x - h)/(1.0 - h)), step(h, xy.x));

        gl_FragColor = texture2D(textureSampler, xy) * col;
    }`;

    var postProcess = new BABYLON.PostProcess("Wave", "custom", ["screenSize"], null, 0.25, this.camera);
    postProcess.onApply = () => {
      let effect = postProcess._drawWrapper.effect;
      let { width, height } = this.canvas.getBoundingClientRect();
      let parentScaling = this.canvas.getBoundingClientRect().width / this.canvas.offsetWidth;
      effect.setFloat2("screenSize", width / parentScaling, height / parentScaling);
      effect.setTexture("textureSampler", texture);
    };

    this.updateTexture = () => {
      this.analyser.getByteTimeDomainData(this.dataArrayAlt);

      for (let i = 0; i < w; i++) {
        for (let j = 0; j < 255; j++) {
          let index = 4 * (w * j + i);

          let color = Math.abs(this.dataArrayAlt[i] - j) < 3 ? 255 : 0;

          raw[index + 0] = color;
          raw[index + 1] = color;
          raw[index + 2] = color;
          raw[index + 3] = 255;
        }
      }

      texture.update(raw);
    };
  }

  createScene() {
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.clearColor = new BABYLON.Color3.Black();

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);
    light.intensity = 0.7;

    this.camera = new BABYLON.ArcRotateCamera(
      "Camera",
      -Math.PI / 2,
      Math.PI / 2,
      5,
      BABYLON.Vector3.Zero(),
      this.scene
    );
  }
}
