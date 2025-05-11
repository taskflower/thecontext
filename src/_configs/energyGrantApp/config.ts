// src/_configs/energyGrantApp/config.ts
import { AppConfig } from "../../core/types";
import { energyGrantWorkspace } from "./workspaces/energygrant.workspace";
import { contactOperatorScenario } from "./scenarios/contact-operator.scenario";
import { findContractorScenario } from "./scenarios/find-contractor.scenario";
import { contractorMarketScenario } from "./scenarios/contractor-market.scenario";
import { findAuditorScenario } from "./scenarios/find-auditor.scenario";
import { auditorMarketScenario } from "./scenarios/auditor-market.scenario";
import { beneficiaryOrdersScenario } from "./scenarios/beneficiary-orders.scenario";
import { portfolioScenario } from "./scenarios/portfolio.scenario";

const config: AppConfig = {
  name: "Program Dotacji Energetycznych",
  description: "Platforma łącząca beneficjentów, wykonawców i audytorów w programie dotacji energetycznych",
  tplDir: "energygrant",
  workspaces: [energyGrantWorkspace],
  scenarios: [
    contactOperatorScenario,
    findContractorScenario,
    contractorMarketScenario,
    findAuditorScenario,
    auditorMarketScenario,
    beneficiaryOrdersScenario,
    portfolioScenario
  ],
};

export default config;