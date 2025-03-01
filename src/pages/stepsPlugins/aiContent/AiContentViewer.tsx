// src/pages/stepsPlugins/aiContent/AiContentViewer.tsx
import { ViewerProps } from "../types";
import { ContentGenerator } from "./VIEWER/ContentGenerator";


export default function AiContentViewer(props: ViewerProps) {
  return <ContentGenerator {...props} />;
}