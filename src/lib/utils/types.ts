"use strict";

export type SetupInputs = {
  hostname: string;
  homeDir: string;
  projectPath: string;
  localLibsPath: string;
  copyX86e: boolean;
  copyRun: boolean;
  copyTestrun: boolean;
};

export type ExportInput = {
  exportInWorkingDir: boolean;
  destination: string;
};

export type ImportInput = {
  source: string;
  projectPath: string;
  copyX86e: boolean;
};
