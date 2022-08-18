# INTRODUCTION

This documentation having information about all commands available in `gtm-utils` cli application.

## COMMAND

setup - Setup uigtm in remote computer using uigtm settings of this computer

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
  $ gtm-utils setup
```

</br>
<hr style="height:2px; border-width:0; background-color:#ddd">

## COMMAND

export - Export uigtm projects and it's settings

## SYNOPSIS

```
gtm-utils export
```

## DESCRIPTION

- This command removes a test module directory with `dirname` inside `/csunit/tests` directory. `dirname` must be in lowercase, otherwise command will convert it to lowercase.

  Also update `/csunit/tests/home/index.js` file by removing `dirname` in `testModules` variable.

- If user pass `-f [filenames]` option, command not remove test module directory, instead removes test files with minimal required code snippet inside `/csunit/tests/<dirname>` directory and created file naming convention is `<filename>.test.js`.

## OPTIONS

_-d, --dir \<dirname\>_ \
&emsp;Test module directory name.

_-f, --file \<filenames...\>_ \
&emsp;Test file names (input is an array).

## EXAMPLES

- Remove directory for test module `license`.

```
  $ gtm-utils export
```

</br>
<hr style="height:2px; border-width:0; background-color:#ddd">

## COMMAND

gtm-utils import - Import uigtm projects and it's settings

## SYNOPSIS

```
gtm-utils import
```

## DESCRIPTION

This command collects all test-suite methods for all test modules inside `/csunit/tests/modules` directory, generates `/csunit/src/export/testmodules.js` file and put all test-suite methods inside this file. If `/csunit/src/export/testmodules.js` already exists then command overwrite the file with new contents.

## EXAMPLES

- Generate package.

```
  $ gtm-utils import
```

</br>
<hr style="height:2px; border-width:0; background-color:#ddd">

## COMMAND

remove - Remove specified directories from uigtm projects

## SYNOPSIS

```
gtm-utils remove
```

## DESCRIPTION

This command collects all test modules name inside `/csunit/tests` directory and dump them in shell's console log.

## EXAMPLES

- Get list of test module's name.

```
  $ gtm-utils remove
```
