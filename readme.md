`gtm-utils` is a `node.js` based CLI application which provide commands to do stuff related to UIGTM.

## Installation

Follow below steps to install `gtm-utils` on your machine:

- (OPTIONAL) Install `node.js` version `v16.14.0` or above if it's not present on you machine.
  You can download `node.js` from [here](https://nodejs.org/en/download/)
  NOTE: check `node.js` is installed or not by executing `node --version` command.

- (OPTIONAL) Install `npm` if not present. you can install it by executing command: `npm install -g npm@latest`.
  NOTE: check `npm` is installed or not by executing `npm --version` command.

- Execute following command to install `gtm-utils` application:
  `npm install git+https://github.com/abhinath84/gtm-utils.git`

- Open another shell & execute `gtm-utils --version` command. It'll show application version and you are good to go.

# Commands

setup - Create a test module or test files

## SYNOPSIS

```
gtm-utils setup
```

## DESCRIPTION

- This command creates a test module directory with `dirname` inside `/csunit/tests` directory. `dirname` must be in lowercase, otherwise command will convert it to lowercase. This command add following test structure to newly created `dirname` directory and fill those files with minimal required code snippet.

```
/csunit/tests/<dirname>
   |-- index.html
   |-- index.js
   |-- <dirname>.test.js
```

&emsp;&emsp;&emsp;Also update `/csunit/tests/home/index.js` file by adding `dirname` in `testModules` variable.

- If user pass `-f [filenames]` option, command not create a new test module directory, instead creates test files with minimal required code snippet inside `/csunit/tests/<dirname>` directory.Created file naming convention is `<filename>.test.js`.

## EXAMPLES

- Create directory for test module `license`.

```
  $ csunit add -d license
  $ csunit add --dir license

  $ csunit a -d license
  $ csunit a -dir license
```

- Create test file for `lease` for `license` test module.

```
  $ csunit add --dir license --file lease
  $ csunit add -d license --file lease
  $ csunit add --dir license -f lease

  $ csunit a --dir license --file lease
  $ csunit a -d license --file lease
  $ csunit a --dir license -f lease
```

- Create test files for `appbundle` & `entitlement` for `license` test module.

```
  $ csunit add --dir license --file lease entitlement
  $ csunit add -d license --file lease entitlement
  $ csunit add --dir license -f lease entitlement

  $ csunit a --dir license --file lease entitlement
  $ csunit a -d license --file lease entitlement
  $ csunit a --dir license -f lease entitlement
```

</br>
<hr style="height:2px; border-width:0; background-color:#ddd">
