# dpc-connections-user-checker

Instructions:

This sample application lists all the Communities which can be viewed by the ID you provide, and also shows
various metrics for each Community.

For a Java version of the same application, see [here](https://github.com/dcacy/dpc-community-usage-checker-liberty).


View demo at <a target="top" href="https://dpc-community-usage-checker.mybluemix.net">https://dpc-community-usage-checker.mybluemix.net</a>

## Getting started

1. Copy the file `connections-sample.properties` to `connections.properties`

1. Edit the file to provide your Connections server's host name, and an ID and password.

1. Download `date.format.js` from [https://gist.github.com/jhbsk/4690754](https://gist.github.com/jhbsk/4690754) and copy it to the `WebContent/js` directory.

1. Download `jquery.loadmask.min.js` from [https://github.com/wallynm/jquery-loadmask](https://github.com/wallynm/jquery-loadmask) and copy it to the `WebContent/js` directory.

1. Install the dependencies your application needs:

  ```none
  npm install
  ```

6. Start the application locally:

  ```none
  npm start
  ```

7. Point your browser to [http://localhost:3001](http://localhost:3001).
