import { creerApplication, demarrerServeur } from "./createApp";

const agent = creerApplication();
demarrerServeur(agent);

export default agent;
