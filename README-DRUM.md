# DRUM Angular UI

This is a fork of the dspace-angular project to implement a customized frontend
for [DRUM](https://github.com/umd-lib/DSpace/tree/drum-develop)

## Documentation

The original dspace-angular documentation:

- [README.md]

## Prerequisite

- Node v12.x, v14.x or v16.x
- npm >= v5.x
- yarn == v1.x
- Ensure that the DRUM API is up and running by following the instructions at [https://github.com/umd-lib/DSpace/tree/drum-develop]

## Development Setup

1. Clone the Git repository and switch to the directory:

    ```bash
    git clone -b drum-develop git@github.com:umd-lib/dspace-angular.git drum-ui
    cd drum-ui
    ```

2. Create the dev config file

    ```bash
    cat <<EOF > config/config.dev.yml
    # Angular Universal server settings
    # NOTE: these must be 'synced' with the 'dspace.ui.url' setting in your backend's local.cfg.
    ui:
      ssl: false
      host: localhost
      port: 4000
      nameSpace: /

    # The REST API server settings
    # NOTE: these must be 'synced' with the 'dspace.server.url' setting in your backend's local.cfg.
    rest:
      ssl: false
      host: localhost
      port: 8080
      nameSpace: /server

    # UMD Environment Banner settings
    environmentBanner:
      text: Local Development
      foregroundColor: "#fff"
      backgroundColor: "#008000"
      enabled: true
    EOF
    ```

3. Install the dependencies

    ```bash
    # install the local dependencies
    yarn install
    ```

4. Start the server in development mode

    ```bash
    yarn run start:dev
    ```

    This will start the angular application in development mode which will
    watch for changes, rebuild the code, and reload the server for you.

    Then go to [http://localhost:4000] in your browser
