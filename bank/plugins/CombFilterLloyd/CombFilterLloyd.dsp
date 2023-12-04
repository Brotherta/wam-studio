declare name "Comb Filter";
declare version "0.0";
declare author "First version Michel Buffa for Lloyd May";
declare description "Simple usage of comb filter";

import("stdfaust.lib");
import("filters.lib");

bypass = checkbox("[0] Bypass [symbol:bypass]") : >(0.5);
// in samples ?
maxdel = 2^8;

intdel = hslider("[1] Intdel [style:knob]", 2^2, 0, 2^8, 1);

del = hslider("[1] Del [style:knob]", 2^8, 2^2, 2^16, 2^8); //Not too sure what this does?

param_b0 = 0.99;

aN = hslider("[1] aN [style:knob]", 0, -0.99, 0.99, 0.01);


// fi.fb_fcomb(1024,del,1,resonance)
combprocess = _ : fb_comb(maxdel,intdel,param_b0,aN) : _;

process = ba.bypass_fade(ma.SR/10, checkbox("bypass"), combprocess);