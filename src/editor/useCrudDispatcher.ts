// src/hooks/useCrudDispatcher.ts
import { Dispatch } from "react";
import { Act, Lst } from "@/core/types";

export const useCrudDispatcher = (dispatch: Dispatch<Act>) => {
  const add = (list: Lst, item: any) =>
    dispatch({ type: "crud", list, op: "add", item });

  const update = (list: Lst, slug: string, updates: any) =>
    dispatch({ type: "crud", list, op: "update", slug, item: updates });

  const remove = (list: Lst, slug: string) =>
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
