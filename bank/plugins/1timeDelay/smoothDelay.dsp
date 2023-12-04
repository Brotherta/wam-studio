declare name 	"smoothDelay";
declare author 	"Yann Orlarey";
declare copyright "Grame";
declare version "1.0";
declare license "STK-4.3";

//--------------------------process----------------------------
//
// 	A stereo smooth delay with a feedback control
//  
//	This example shows how to use sdelay, a delay that doesn't
//  click and doesn't transpose when the delay time is changed
//-------------------------------------------------------------

import("stdfaust.lib");

delay = par(i, 2, voice)
	with 
	{ 
		voice 	= (+ : de.sdelay(N, interp, dtime));
		N 		= int(2^19); 
		interp 	= hslider("interpolation[unit:ms][style:knob]",10,1,100,0.1)*ma.SR/1000.0; 
        dtime = hslider("delay[unit:ms][style:knob]", 0, 0, 500, 0.1)*ma.SR/1000.0;
	};

process = ba.bypass_fade(ma.SR/10, checkbox("bypass"), delay);


