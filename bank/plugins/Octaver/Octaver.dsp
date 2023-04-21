declare name 		"pitch-shifter";
declare version 	"1.0";
declare author 		"Grame";
declare license 	"BSD";
declare copyright 	"(c)GRAME 2006";

 //----------------------------
 // very simple real time pitch shifter
 //----------------------------

import("stdfaust.lib");

ps(nbSemiTones) = ef.transpose(4000, 
    4000,
    nbSemiTones
);

// add dry wet control
stereodrywet (monofx) = _,_ <: *(1-dw), *(1-dw), monofx*dw, monofx*dw :> _,_
	with {
		dw = hslider("Dry/Wet[OWL:PARAMETER_D][style:knob]",0.5,0,1,0.01) : si.smoo;
	};

process1 = stereodrywet(ps(12)*gainUp+ps(-12)*gainDown) with {
    gainUp = hslider("Up[name:Up][style:knob]", 1, 0, 1, 0.01)  : si.smoo;
    gainDown = hslider("Down[name:Down][style:knob]", 1, 0, 1, 0.01)  : si.smoo;
};

process = ba.bypass_fade(ma.SR/10, checkbox("bypass"), process1);
