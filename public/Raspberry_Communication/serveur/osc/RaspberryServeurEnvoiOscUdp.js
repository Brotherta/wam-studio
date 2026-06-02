const dgram = require("dgram");
const { PORT_OSC_UDP_PAR_DEFAUT } = require("../configuration/RaspberryServeurConstantes");
const {
  normaliserAdresseOsc,
  parserArgumentsOsc,
  encoderPaquetOsc,
} = require("./RaspberryServeurEncodeurOsc");

/**
 * Envoie un message OSC en UDP vers un Raspberry.
 * @returns {Promise<{ ipAddress: string, port: number, address: string, args: unknown[] }>}
 */
async function envoyerMessageOscEnUdp(targetIp, targetPort, oscMessage, oscValue) {
  const port = Number.isFinite(Number(targetPort)) ? Number(targetPort) : PORT_OSC_UDP_PAR_DEFAUT;
  const args = parserArgumentsOsc(oscValue);
  const packet = encoderPaquetOsc(oscMessage, args);
  const socket = dgram.createSocket("udp4");
  return new Promise((resolve, reject) => {
    socket.send(packet, 0, packet.length, port, targetIp, (err) => {
      socket.close();
      if (err) {
        reject(err);
        return;
      }
      resolve({
        ipAddress: targetIp,
        port,
        address: normaliserAdresseOsc(oscMessage),
        args,
      });
    });
  });
}

module.exports = {
  envoyerMessageOscEnUdp,
};
