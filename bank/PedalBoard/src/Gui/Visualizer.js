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
    let w = this.analyser.fftSize / 2

    let raw = new Float32Array(w)
    let texture = BABYLON.RawTexture.CreateRTexture(
      raw,
      w,
      1,
      this.scene,
      false,
      undefined,
      undefined,
      undefined,
      undefined,
      true
    )
    texture.hasAlpha = true

    BABYLON.Effect.ShadersStore["customFragmentShader"] = 
    /*glsl*/`
      varying vec2 vUV;
      uniform sampler2D textureSampler;
      
      // Parameters
      uniform vec2 screenSize;

      const vec4 firstColor = vec4(1.0,0.0,0.0,1.0); //red
      const vec4 middleColor = vec4(0.0,1.0,0.0,1.0); // green
      const vec4 endColor = vec4(0.0,0.0,1.0,1.0); // blue

      float getIntensity(vec2 xy, float size, float width, float dimension){
        float wave_y = texture2D(textureSampler, vec2(xy.x/dimension, 0.5)).r;
        float intensity= xy.y-((wave_y-0.5)*size+0.5);
        intensity*=intensity*width;
        if(intensity<0.001){
          intensity= 1.0-intensity/0.001;
        }
        else intensity=0.0;
        return intensity;
      }
      
      void main( void ){
          vec2 xy = gl_FragCoord.xy / screenSize.xy;
          float wave_y = texture2D(textureSampler, vec2(xy.x, 0.5)).r;

          float main_intensity=getIntensity(xy, 1.0, 1.0, 1.0);
          float second_intensity=getIntensity(xy, 1.0, 5.0, 4.0)*0.8;
          float total_intensity=max(main_intensity,second_intensity/2.0);
          if(total_intensity>0.0){
            float h = 0.5; // adjust position of middleColor
            gl_FragColor = max(
              mix(mix(firstColor, middleColor, (xy.x/h)), mix(middleColor, endColor, (xy.x - h)/(1.0 - h)), step(h, xy.x))*main_intensity,
              vec4(second_intensity,second_intensity,second_intensity,1.0)
            );
            wave_y*=2.0;
            gl_FragColor*=vec4(wave_y, wave_y, wave_y, 1.0);
          }
          else{
            gl_FragColor = vec4(0.0,0.0,0.0,1.0);
          }
      }
    `

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
      for (let i = 0; i < w; i++) raw[i]= (this.dataArrayAlt[i]/255+raw[i])/2
      texture.update(raw);
    };
  }

  createScene() {
    const scene = this.scene = new BABYLON.Scene(this.engine);
    scene.autoClear = false; 
    scene.autoClearDepthAndStencil = false; 
  

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
