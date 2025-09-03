import("stdfaust.lib");

// Polyphonic MIDI Parameters
freq = hslider("freq", 440, 20, 20000, 0.01);
gain = hslider("gain", 0, 0, 1, 0.01);
gate = hslider("gate", 0, 0, 1, 1);

// UI Components
ui_power = checkbox("h:MAIN/h:[0]POWER/ON");
ui_lfo_rate = vslider("h:MAIN/h:[1]LFO/[0]RATE", 0.4, 0, 1, 0.01);
ui_lfo_delay = vslider("h:MAIN/h:[1]LFO/[1]DELAY TIME", 0, 0, 1, 0.01);
ui_lfo_mode = vslider("h:MAIN/h:[1]LFO/v:[2]TRIG/[0]TRIG MODE[style:radio{'AUTO':0;'MAN':1}]", 0, 0, 1, 1);
ui_lfo_button = button("h:MAIN/h:[1]LFO/v:[2]TRIG/[1]LFO");
ui_dco_lfo = vslider("h:MAIN/h:[2]DCO/[0]LFO", 0, 0, 1, 0.01);
ui_dco_pwm = vslider("h:MAIN/h:[2]DCO/[1]PWM", 0.5, 0.01, 0.99, 0.01);
ui_dco_mode = vslider("h:MAIN/h:[2]DCO/[2]MODE[style:radio{'LFO':0;'MANUAL':1;'ENV':2}]", 1, 0, 2, 1);
ui_dco_osc1 = checkbox("h:MAIN/h:[2]DCO/[3]RECT");
ui_dco_osc2 = checkbox("h:MAIN/h:[2]DCO/[4]SAW");
ui_dco_osc3 = checkbox("h:MAIN/h:[2]DCO/[5]SUB");
ui_dco_sub = vslider("h:MAIN/h:[2]DCO/[6]SUB OSC", 0, 0, 1, 0.01);
ui_dco_noise = vslider("h:MAIN/h:[2]DCO/[7]NOISE", 0, 0, 1, 0.01);
ui_hpf_freq = vslider("h:MAIN/h:[3]HPF/FREQ", 0, 0, 10, 0.01);
ui_vcf_freq = vslider("h:MAIN/h:[4]VCF/[0]FREQ", 1, 0, 1, 0.01);
ui_vcf_res = vslider("h:MAIN/h:[4]VCF/[1]RES", 1, 0, 1, 0.01);
ui_vcf_polar = vslider("h:MAIN/h:[4]VCF/[2]POLAR[style:radio{'UP':0;'DOWN':1}]", 0, 0, 1, 1);
ui_vcf_env = vslider("h:MAIN/h:[4]VCF/[3]ENV", 0, 0, 1, 0.01);
ui_vcf_lfo = vslider("h:MAIN/h:[4]VCF/[4]LFO", 0, 0, 1, 0.01);
ui_vcf_kybd = vslider("h:MAIN/h:[4]VCF/[5]KYBD", 1, 0, 1, 0.01);
ui_vca = vslider("h:MAIN/h:[5]VCA/MODE[style:radio{'ENV':0;'GATE':1}]", 0, 0, 1, 1);
ui_env_a = vslider("h:MAIN/h:[6]ENV/[0]A", 0, 0, 1, 0.01);
ui_env_d = vslider("h:MAIN/h:[6]ENV/[1]D", 0, 0, 1, 0.01);
ui_env_s = vslider("h:MAIN/h:[6]ENV/[2]S", 1, 0, 1, 0.01);
ui_env_r = vslider("h:MAIN/h:[6]ENV/[3]R", 0, 0, 1, 0.01);

// Modifiers
lfo1 = os.lf_triangle(ui_lfo_rate * 20);
lfo2 = lfo1 * 0.5 + 0.5;
lfo_trigger = en.asr(ui_lfo_delay, 1, 0, (ui_lfo_mode == 0) * gate + (ui_lfo_mode == 1) * ui_lfo_button);
env = en.adsr(ui_env_a, ui_env_d, ui_env_s, ui_env_r, gate);

// Modules
dco = osc1 + osc2 + osc3 + noise : *(gain) with {
    freq_dco = freq * (1 + lfo1 * lfo_trigger * ui_dco_lfo * 0.2);
    pwm = pwm_lfo * (ui_dco_mode == 0) + ui_dco_pwm * (ui_dco_mode == 1) + pwm_env * (ui_dco_mode == 2) with {
        pwm_lfo = ui_dco_pwm * lfo2;
        pwm_env = 0.5 + (ui_dco_pwm - 0.5) * env;
    };
    osc1 = ui_dco_osc1 * os.pulsetrain(freq_dco, pwm);
    osc2 = ui_dco_osc2 * os.sawtooth(freq_dco);
    osc3 = ui_dco_osc3 * os.pulsetrain(freq_dco / 2, pwm) : *(ui_dco_sub);
    noise = no.noise * ui_dco_noise;
};

vca = *((ui_vca == 0) * env + (ui_vca == 1) * gate);

hpf = fi.highpass(2, ui_hpf_freq * 1980 + 20 : si.smoo);

vcf = fi.resonlp(fc_env, q, 1) with {
    fc_base = freq * ui_vcf_freq * 50 * ui_vcf_kybd + 50 * (ui_vcf_freq * 100 + 1) * (1 - ui_vcf_kybd) : *(1 + lfo1 * ui_vcf_lfo);
    fc_env_up = fc_base + env * ui_vcf_env * (20000 - fc_base);
    fc_env_down = fc_base - env * ui_vcf_env * fc_base;
    fc_env = fc_env_up * (ui_vcf_polar == 0) + fc_env_down * (ui_vcf_polar == 1) : si.smoo : max(1);
    q = 1 + ui_vcf_res * 30;
};

process = ui_power * dco : hpf : vcf : vca : *(0.3) <: _, _;