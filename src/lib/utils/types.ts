"use strict";

export type GTMInput = {
  projectPath: string;
  localLibsPath: string;
  copyX86e: boolean;
  copyRun: boolean;
  copyTestrun: boolean;
  copyData: boolean;
};

export type SetupInputs = {
  hostname: string;
  homeDir: string;
  gtmInput: GTMInput;
};

export type ExportInput = {
  exportInWorkingDir: boolean;
  destination: string;
};

export type ImportInput = {
  source: string;
  gtmInput: GTMInput;
};
