declare name 		"Owlgazer Shimmer Reverb";
declare version 	"1.0.0";
declare author 		"Xavier Godart";
declare copyright 	"(c) Empirical Noises 2017";

import("stdfaust.lib");

owlgazer(mix,decay,hicut,pitchmix) =
    _,_ <:
    (
        _,_ <:
        (si.bus(N*2) :> networkline)~(feedbackline)
        :> *(mix),*(mix)
    ),
    (*(1-mix),*(1-mix)) :>
    _,_
with {
    N = 4;
    earlyAPNb = 2;
    MAXDELAY = 8192;

    delays = (2401.0, 3125.0, 6561.0, 14641.0);
    delayval(i) = ba.take(i+1,delays);

    pitchshifter(delay, pitch, amount) = _ <: de.delay(MAXDELAY, delay)*(1-amount),(ef.transpose(delay,delay,pitch)*amount) :> _;
    earlyreflections = seq(i, earlyAPNb,
        fi.allpass_comb(2048, delayval(i), -allpassfb)
    )
    with{
        allpassfb = 0.6;
        delays = (729.0, 1331.0, 625.0, 343.0);
        delayval(j) = ba.take(j+1, delays);
    };

    latereflections(i) = _ <:
            de.fdelay(MAXDELAY, delayval(i))*(i!=3),
            pitchshifter(MAXDELAY + delayval(i),12,pitchmix)*(i==3) :>
        _;

    networkline = par(i,N,
        _ :
        earlyreflections :
        latereflections(i) :
        _/sqrt(N)
    ) : fi.lowpass(1, hicut),fi.highpass(1, 90),fi.lowpass(1, hicut),_;

    feedbackline = ro.hadamard(N) : par(i,N,*(decay));
};

owlgazer_ui = owlgazer(mix,decay,hicut,pitchmix)
with {
    decay = hslider("DECAY[style:knobs]", 0.7, 0.5, 1.00, 0.01) : *(0.5) : +(0.5);
    hicut = hslider("TONE[style:knobs]", 4000, 900, 8000, 0.01);
    pitchmix = hslider("SHIMMER[style:knobs]", 0.3, 0, 0.7, 0.01);
    mix = hslider("MIX[style:knobs]", 0.75, 0, 1, 0.01);
};


process = ba.bypass_fade(0, checkbox("bypass"), owlgazer_ui);

