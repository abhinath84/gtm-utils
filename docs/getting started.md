# Getting started

## How to install _gtm-utils_ application

Follow below steps to install `gtm-utils` on your machine:

- Install `node.js` version `v16.14.0` or above if it's not present on you machine.
  You can download `node.js` from [here](https://nodejs.org/en/download/)

  NOTE: Execute `node --version` command to verify node installed or not.

- Install `npm` by executing command: `npm install -g npm@latest`.

  NOTE: Execute `npm --version` command to verify npm installed or not.

- Download `gtm-utils.zip` from [v1.0.0](https://github.com/abhinath84/gtm-utils/releases/tag/V1.0.0).
- Create a new folder & unzip downloaded zip file.
- Open a new command terminal (shell).
- Navigate to unzip folder in the terminal.
- write `npm install` & hit enter.
- write `npm link` & hit enter.
- Open another shell & execute `gtm-utils --version` command. It'll show application version and you are good to go.

## How to run `setup` command

### Pre-requisite

To setup uigtm in remote machine, you have to do below pre-requisites:

- Share directory where uigtm projects will store in remote machine with write permission. That folder's share name must be `projects`.

  Example: on remote computer uigtm project directory name would be `D:\ptc\uigtm` and shared directory name would be `\\anath2d\projects`.

- Share `HOME` _environment_ variable directory in remote machine with write permission.

  Example: Remote `HOME` _environment_ variable directory: `D:\ptc\abc` and shared directory name will be `\\anath2d\abc`.

  > NOTE: once uigtm setup in remote machine is done, unshare `HOME` _environment_ variable directory.

### Run

- Open an command terminal(i.e, Windows Powershell, cygwin etc).
- Write `gtm-utils setup` command & hit enter.
- Will ask following questions and answer them one-by-one & hit enter

  > Remote hostname
  >
  > Remote 'HOME' environment directory name
  >
  > Path for projects in remote host
  >
  > Path for projects in remote host
  >
  > Want to copy x86e_win64?
  >
  > Want to copy 'run' folder?
  >
  > Want to copy 'testrun' folder?

![setup](./images/setup.png)

- Once execution is successful, Please open UIGTM on remote machine & start using it.

### Reference

- You can watch this [demo](./video/gtm_utils_setup.mp4).
  <a href="./video/gtm_utils_setup.mp4)" target="_blank">demo</a>
