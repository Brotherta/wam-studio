declare name "Stereo Frequency Shifter";
declare description "Stereo Frequency Shifting";
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

freqshift(x, shift) = negative(x), positive(x)
with {
  negative(x) = real(x)*cosv - imag(x)*sinv;
  positive(x) = real(x)*cosv + imag(x)*sinv;
  real(x) = hilbert(x) : _ , !;
  imag(x) = hilbert(x) : ! , _;
  
  phasor(x) = fmod((x/float(ma.SR) : (+ : ma.decimal) ~ _), 1.)  * (ma.PI * 2);

  sinv = sin(phasor(shift));
  cosv = cos(phasor(shift));

  hilbert = hilbertef;
};

ssb(shift, x) = freqshift(x, shift) : _ , !; 


shift = hslider("Shift[style:knob][unit:hz][OWL:PARAMETER_A]", 0.0, -1., 1, 0.001);
shift_scalar = hslider("ShiftScalar[style:knob][OWL:PARAMETER_B]", 1., 1., 100, 0.1);
lr_offset = hslider("L-ROffset[style:knob][OWL:PARAMETER_C]", 0., 0., 1., 0.00001);
mix = hslider("Mix[style:knob][OWL:PARAMETER_D]",0.5,0,1,0.01) : si.smooth(ba.tau2pole(0.005));

shift_amount = shift*shift_scalar;
stereoFreqShift(l, r) = l, r <: *(1-mix), *(1-mix), ssb(shift_amount,l)*mix, ssb(shift_amount+lr_offset,r)*mix :> _,_;

process = ba.bypass_fade(ma.SR/10, checkbox("bypass"), stereoFreqShift);