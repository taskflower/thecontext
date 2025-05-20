// src/hooks/useCrudDispatcher.ts
import { Dispatch } from "react";


export const useCrudDispatcher = (dispatch: Dispatch<any>) => {
  const add = (list: any, item: any) =>
    dispatch({ type: "crud", list, op: "add", item });

  const update = (list: any, slug: string, updates: any) =>
    dispatch({ type: "crud", list, op: "update", slug, item: updates });

  const remove = (list: any, slug: string) =>
    dispatch({ type: "crud", list, op: "delete", slug });

  const setSection = (
    section: "app" | "workspace" | "scenario",
    workspace?: string,
    scenario?: string
  ) =>
    dispatch({ type: "setSection", section, workspace, scenario });

  const setError = (error: string | null) =>
    dispatch({ type: "setError", error });

  const markClean = () => dispatch({ type: "markClean" });

  return { add, update, remove, setSection, setError, markClean };
};
