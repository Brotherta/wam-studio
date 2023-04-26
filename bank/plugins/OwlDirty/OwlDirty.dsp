declare name 		"Owlgazer Dirty Reverb";
declare version 	"1.0.0";
declare author 		"Xavier Godart";
declare copyright 	"(c) Empirical Noises 2017";

import("stdfaust.lib");

owlgazer(mix,decay,hicut,gain) =
    _,_ <:
    (
        _,_ <:
        (si.bus(N*2) :> networkline)~(feedbackline)
        :> distorsion,distorsion : fi.lowpass(2, hicut),fi.lowpass(2, hicut) : *(mix),*(mix)
    ),
    (*(1-mix),*(1-mix)) :>
    _,_
with {
    N = 4;
    earlyAPNb = 3;
    MAXDELAY = 8192;

    clip(lo,hi) = min(hi) : max(lo);
    cubic(x) = x - x*x*x/3;
    preGain = pow(10, gain*2);
    postVolume = 1-gain;
    distorsion = *(preGain) : clip(-1,1) : cubic : fi.dcblocker : *(postVolume);

    delays = (2401, 3125, 6561, 14641);
    delayval(i) = ba.take(i+1,delays);

    earlyreflections(i) = seq(j, earlyAPNb,
        fi.allpass_fcomb(2048, delayval(j+1), -allpassfb)
    )
    with{
        allpassfb = 0.6;
        delays = (243, 343, 625, 727, 1331, 2403, 3119);
        delayval(x) = ba.take(x+1, delays);
    };

    latereflections(i) = de.fdelay(MAXDELAY, delayval(i));

    networkline = par(i,N,
        _ :
        earlyreflections(i) :
        latereflections(i) :
        _/sqrt(N)
    ) : _,_,fi.highpass(1, 90),_;

    feedbackline = ro.hadamard(N) : par(i,N,*(decay));
};

owlgazer_ui = owlgazer(mix,decay,hicut,gain)
with {
    decay = hslider("DECAY[style:knobs]", 0.7, 0.5, 1.00, 0.01) : *(0.5) : +(0.5);
    hicut = hslider("TONE[OWL:B][style:knobs]", 4000, 900, 8000, 0.01);
    gain = hslider("DRIVE[style:knobs]", 0, 0, 0.7, 0.1);
    mix = hslider("MIX[style:knobs]", 0.75, 0, 1, 0.01);
};

process = ba.bypass_fade(0, checkbox("bypass"), owlgazer_ui);
