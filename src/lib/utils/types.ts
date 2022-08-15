"use strict";

export type SetupInputs = {
  hostname: string;
  projectPath: string;
  copyX86e: boolean;
};

export type ExportInput = {
  exportInWorkingDir: boolean;
  destination: string;
};

export type ImportInput = {
  source: string;
  copyX86e: boolean;
};
