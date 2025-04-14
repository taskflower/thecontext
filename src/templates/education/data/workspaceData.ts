// src/templates/education/data/workspaceData.ts
import { BaseWorkspaceData } from "../../baseTemplate";
import { getLearningScenario } from "./scenarios/learningScenario";
import { getQuizScenario } from "./scenarios/quizScenario";
import { getProjectScenario } from "./scenarios/projectScenario";
import { getInitialContext } from "./initialContext";

export function getEducationWorkspaceData(): BaseWorkspaceData {
  return {
    id: "workspace-education",
    name: "EduSprint - Nauka w Pigułce",
    description: "Przestrzeń do nauki przedmiotów szkolnych z pomocą sztucznej inteligencji",
    scenarios: [
      getLearningScenario(),
      getQuizScenario(),
      getProjectScenario()
    ],
    templateSettings: {
      layoutTemplate: "default",
      scenarioWidgetTemplate: "card-list",
      defaultFlowStepTemplate: "basic-step",
      theme: "light",
    },
    initialContext: getInitialContext(),
  };
}