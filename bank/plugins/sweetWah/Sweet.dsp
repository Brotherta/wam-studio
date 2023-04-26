// Wah-wah with lfo modulation
import("stdfaust.lib");
 
lfo =
os.oscrs(freq) + 1.0 : *(0.5)
// os.lf_rawsaw(freq) + 1.0 : *(0.5)
   with {
     freq  = hslider("Frequency[unit:Hz][OWL:PARAMETER_C][style:knob]", 4, 0, 12, 0.001);
   };
 
// mono wah-wah based on crybaby
wahwah = ve.crybaby(wah) with {
  lo = hslider("Low[OWL:PARAMETER_A][style:knob]",0.8,0,1,0.01);
  hi = hslider("High[OWL:PARAMETER_B][style:knob]",0.8,0,1,0.01);
  wah = lo*lfo + hi*(1.0-lfo);
};
 
fxctrl(w,Fx) =  _ <: (Fx : *(w)), *(1-w) +> _;
 
sweepwah = fxctrl(wet, wahwah)
   with {
       wet = hslider("Mix[OWL:PARAMETER_D][style:knob]",0.5,0,1,0.01);
   };
 
process = ba.bypass_fade(ma.SR/10, checkbox("bypass"), sweepwah);