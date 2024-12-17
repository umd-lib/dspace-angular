# DRUM Angular UI

This is a fork of the dspace-angular project to implement a customized frontend
for [DRUM](https://github.com/umd-lib/DSpace/tree/drum-main)

## Documentation

The original dspace-angular documentation is in the "README.md" file.

## Prerequisite

* Node v18.x or v20.x
* npm >= v5.x
* yarn == v1.x
* Ensure that the DRUM API is up and running by following the instructions at
  <https://github.com/umd-lib/DSpace/tree/drum-main>

## Development Setup

This repository uses the "GitHub Flow" branching model, with "drum-main" as the
main branch for DRUM development.

1) Clone the Git repository and switch to the directory:

    ```zsh
    $ git clone -b drum-main git@github.com:umd-lib/dspace-angular.git drum-ui
    $ cd drum-ui
    ```

2) Create the dev config file

    ```zsh
    $ cat <<EOF > config/config.dev.yml
    # Angular Universal server settings
    # NOTE: these must be 'synced' with the 'dspace.ui.url' setting in your backend's local.cfg.
    ui:
      ssl: true
      host: drum-local.lib.umd.edu
      port: 4000
      nameSpace: /

    # The REST API server settings
    # NOTE: these must be 'synced' with the 'dspace.server.url' setting in your backend's local.cfg.
    rest:
      ssl: true
      host: api.drum-local.lib.umd.edu
      port: 443
      nameSpace: /server

    # UMD Environment Banner settings
    environmentBanner:
      text: Local Development
      foregroundColor: "#fff"
      backgroundColor: "#008000"
      enabled: true
    EOF
    ```

3) Generate the HTTPS certificate for the front-end:

    ```zsh
    $ mkcert -cert-file config/certs/drum-local.pem \
             -key-file config/certs/drum-local-key.pem \
             drum-local.lib.umd.edu
    ```

See the the "CAS and the Local Development Environment" section in the
["docs/dspace/CASAuthentication.md"](https://github.com/umd-lib/DSpace/blob/drum-main/dspace/docs/CASAuthentication.md)
file in <https://github.com/umd-lib/DSpace> for more information about this
step.

4) Install the dependencies

    ```zsh
    # install the local dependencies
    $ yarn install
    ```

    ---

    :information_source: **Note: "distutils" module error**

    When Python 3.12 or later is the default Python on the system, the
    `yarn install` command may display the following error:

    ```text
    ModuleNotFoundError: No module named 'distutils'
    ```

    DSpace has the "node-gyp" package as a dependency. When installing via
    Yarn, the package attempts to install modules using the "distutils" package,
    which was removed from standard Python v3.12 and later
    (see <https://stackoverflow.com/a/77638742>).

    This error does not meaningfully impact the application (the `yarn install`
    will indicate "Done"), but to resolve the error, run the following command:

    ```zsh
    $ brew install python-setuptools
    ```

    ---

5) Start the server in development mode

    ```zsh
    $ yarn run start:dev
    ```

    This will start the angular application in development mode which will
    watch for changes, rebuild the code, and reload the server for you.

    Then go to <https://drum-local.lib.umd.edu:4000> in your browser

## Production Docker image

The Docker image used for running DRUM in Kubernetes is created using the
"Dockerfile.prod" file.

This Docker image runs Angular using Node, relying on Kubernetes to provide
additional replicas if horizontal scaling is needed.

## Customizations

### Environment Banner

In keeping with [SSDR policy](https://confluence.umd.edu/display/LIB/Create+Environment+Banners),
an "environment banner" will be displayed at the top of each page when running
on non-production servers.

There are two ways to configure the environment banner:

### YAML format

The following is an example of configuring in a "config/config.*.yml" YAML file,
such as "config/config.dev.yml":

```yaml
# UMD Environment Banner settings
environmentBanner:
  text: Local Development
  foregroundColor: "#fff"
  backgroundColor: "#008000"
  enabled: true
```

In DSpace, the configuration from the YAML files can be overridden using either
environment variables, or a ".env" file (see the "Configuration Override"
section in <https://wiki.lyrasis.org/display/DSDOC7x/User+Interface+Configuration>.

The following environment variables can be used:

* DSPACE_ENVIRONMENTBANNER_TEXT - the text to display in the banner
* DSPACE_ENVIRONMENTBANNER_FOREGROUNDCOLOR - the foreground color for the
  banner, as a CSS color
* DSPACE_ENVIRONMENTBANNER_BACKGROUNDCOLOR - the background color for the
  banner, as a CSS color
* DSPACE_ENVIRONMENTBANNER_ENABLED - "true" (case-sensitive) enables the
  banner. Anything else (including not being provided, or blank) disables the
  banner.

For example, in a ".env" file:

```text
DSPACE_ENVIRONMENTBANNER_TEXT=Test Environment
DSPACE_ENVIRONMENTBANNER_FOREGROUNDCOLOR=#000
DSPACE_ENVIRONMENTBANNER_BACKGROUNDCOLOR=#fff100
DSPACE_ENVIRONMENTBANNER_ENABLED=true
```

### I18n Customizations

All changes to I18n assets should be made in the "UMD Customization" section
at the bottom of the default "src/assets/i18n/en.json5" file.

Existing DSpace-provided entries are overridden when added to the
"UMD Customization" section, because when multiple keys occur in the file,
the last instance of the key is used.

## Customization Markings

UMD customizations to stock DSpace code should be marked, if possible, with
a starting comment "UMD Customization" and an ending comment of
"End UMD Customization", for example, in a Java file:

```java
// UMD Customization
... New or modified code ...
// End UMD Customization
```

The following customizations *do not* need to be commented:

* Updates to the "\<version>" identifier in "pom.xml" files
* "Branding" changes in email templates such as "dspace/config/emails/" or
  the default DSpace license in "dspace/config/default.license", as these files
  do not have a convenient "comment" mechanism
* Files that do not have a "comment" mechanism, such as JSON files
* Extremely trivial whitespace changes unrelated to UMD customizations, such as
  tabs in the modified DSpace file being automatically converted to spaces by
  VS Code, or an end-of-file line.

The main goal is to make it immediately when performing DSpace version upgrades
whether a change in a file is due to an explicit UMD customization.

## Debugging using VS Code

The built-in VS Code debugger can be used in conjunction with the Chrome web
browser to debug the application. To use the debugger:

1) Add the "drum-ui" folder to VS Code.

2) Add a breakpoint in a TypeScript file.

3) In the "Run and Debug" sidebar tab, select "Launch Chrome against localhost"
   in the "RUN AND DEBUG" dropdown. Then left-click the green "play" icon, to
   the left of the dropdown. An instance of the Chrome browser will launch and
   display the application home page.

4) Perform whatever actions are necessary to trigger the breakpoint. The
   VS Code window will be displayed with the breakpoint activated.

**Note:** Breakpoints can also be selected after Chrome has been launched.
Due to lazy module loading in Angular, a breakpoint may not be immediately
"bound", if the relevant code has not been loaded. The breakpoint should
bind automatically when the code is loaded.

In the launch configuration, the line:

```json
"browserLaunchLocation": "ui"
```

is needed to prevent Chrome from displaying a "Restore" session dialog every
time Chrome starts. See <https://github.com/microsoft/vscode-js-debug/issues/723#issuecomment-866227122>

## Running the Tests

To run the TypeScript unit tests:

```zsh
$ yarn test
```

## TypeScript Linter

To run the TypeScript Linter (from the "Run lint" step in
".github/workflows/build.yml"):

```zsh
$ yarn run lint:nobuild --quiet
```
