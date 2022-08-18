# Getting started

## How to install _gtm-utils_ application

Follow below steps to install `gtm-utils` on your machine:

- (OPTIONAL) Install `node.js` version `v16.14.0` or above if it's not present on you machine.
  You can download `node.js` from [here](https://nodejs.org/en/download/)
  NOTE: check `node.js` is installed or not by executing `node --version` command.

- (OPTIONAL) Install `npm` if not present. you can install it by executing command: `npm install -g npm@latest`.
  NOTE: check `npm` is installed or not by executing `npm --version` command.

- Execute following command to install `gtm-utils` application:
  `npm install git+https://github.com/abhinath84/gtm-utils.git`

- Open another shell & execute `gtm-utils --version` command. It'll show application version and you are good to go.

You can watch this [demo](./video/gtm_utils_install.mp4).

## How to run `setup` command

### Pre-requisite

To setup uigtm in remote machine, you have to do below pre-requisites:

- Share directory where uigtm projects will store in remote machine with write permission. That folder's share name must be `projects`.
  Example: Remote uigtm project directory: `D:\ptc\uigtm` and shared directory name will be `\\anath2d\projects`.

- Share `HOME` _environment_ variable directory in remote machine with write permission.
  Example: Remote `HOME` _environment_ variable directory: `D:\ptc\HOME` and shared directory name will be `\\anath2d\HOME`.

  > NOTE: once uigtm setup in remote machine is done, unshare `HOME` _environment_ variable directory.

- Install `gtm-utils` application. You can follow [How to install _gtm-utils_ application](#how-to-install-gtm-utils-application).

### Run

- Open an command terminal(i.e, Windows Powershell, cygwin etc).
- Write `gtm-utils setup` command & hit enter.
- It will ask following questions, Please answer those questions one-by-one & hit enter

  > Remote hostname
  > Path for projects in remote host
  > Path for projects in remote host
  > Want to copy x86e_win64?

- It will execute the command.
- Once execution is successful, Please open UIGTM on remote machine & start using it.

### Reference

- You can watch this [demo](./video/gtm_utils_setup.mp4).
