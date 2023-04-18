declare name "Weird Phaser";
declare description "Stereo Phaser based on SSB Modulation";
declare author "Oli Larkin (contact@olilarkin.co.uk)";
declare copyright "Oliver Larkin";
declare version "0.1";
declare licence "GPL";

import("stdfaust.lib");

hilbertef(x) = real(x), imag(x)
with {
  biquad(a1,a2,b0,b1,b2) = + ~ conv2(a1,a2) : conv3(b0,b1,b2) 
  with {
    conv3(k0,k1,k2,x) = k0*x + k1*x' + k2*x'';
    conv2(k0,k1,x) = k0*x + k1*x';
  };
  real = biquad(-0.02569, 0.260502, -0.260502, 0.02569, 1) 
        : biquad(1.8685, -0.870686, 0.870686, -1.8685, 1) ;
  imag = biquad(1.94632, -0.94657, 0.94657, -1.94632, 1) 
      : biquad(0.83774, -0.06338, 0.06338,  -0.83774, 1) ;

};

mix = 0.5;
maxfeedback = 0.7;

rate = hslider("Rate[style:knob][unit:hz][OWL:PARAMETER_A]", 0, 0., 1, 0.001);
rateScalar = hslider("RateScalar[style:knob][OWL:PARAMETER_B]", 1., 1., 40., 0.001);
offset = hslider("L-ROffset[style:knob][OWL:PARAMETER_C]", 0., 0., 1., 0.001) * 0.5;
fbk = hslider("Feedback[style:knob][OWL:PARAMETER_D]", 0., 0, 1., 0.01) : *(maxfeedback) : si.smooth(ba.tau2pole(0.005));

ssbfreqshift(x, offset) = (+ : negative) ~ (*(fbk) : clip(-1, 1))
with {
  negative(x) = real(x)*cosv - imag(x)*sinv;
  positive(x) = real(x)*cosv + imag(x)*sinv;
  real(x) = hilbert(x) : _ , !;
  imag(x) = hilbert(x) : ! , _;
  phasor = fmod(((rate*rateScalar)/float(ma.SR) : (+ : ma.decimal) ~ _)+offset, 1.) * (2*ma.PI);
  sinv = sin(phasor);
  cosv = cos(phasor);
  hilbert = hilbertef;
  clip(lo,hi) = min(hi) : max(lo);
};

weirdPhaser(l,r) = l,r <: *(1-mix), *(1-mix), ssbfreqshift(l, 0.)*mix, ssbfreqshift(r, offset)*mix :> _,_;

process = ba.bypass_fade(ma.SR/10, checkbox("bypass"), weirdPhaser);