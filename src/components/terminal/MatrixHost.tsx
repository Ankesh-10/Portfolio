"use client";
import dynamic from "next/dynamic";
import { useTerminal } from "./TerminalProvider";

// The rain canvas is only downloaded the first time someone types `matrix`.
const MatrixRain = dynamic(() => import("./MatrixRain").then((m) => m.MatrixRain));

export function MatrixHost() {
  const { matrix } = useTerminal();
  return matrix ? <MatrixRain /> : null;
}
