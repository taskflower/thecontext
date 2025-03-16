// Common type definitions for action creators

import { Draft } from "immer";
import { AppState } from "./types";


// The set function from immer middleware takes a function that modifies the draft state
export type SetFn = (fn: (state: Draft<AppState>) => void) => void;

// The get function returns the current state
export type GetFn = () => AppState;