var dispatcher = require('../shared/dispatcher');
var Messages = require('../shared/messages');
var request = require('request-promise');
const appInsights = require("applicationinsights");

var InternalHTTPClient = function (sp) {

    // initialize the node http client here
    var serverPath = sp;
    var trackingClient = appInsights.defaultClient;

    var onDeviceOffline = function (deviceToken) {
        var options = {
            method: 'POST',
            uri: serverPath + 'deviceOffline',
            body: {
                'deviceToken': deviceToken
            },
            json: true
        };

        request(options).then(function (parsedBody) {
            // nothing to do here, this is just left as an example
        }).catch(function (err) {
            trackingClient.trackException({ exception: err, measurements: { 'IApiErr-DeviceOffline': 1 } });
        });
    }

    var onDeviceOnline = function (deviceToken) {
        var options = {
            method: 'POST',
            uri: serverPath + 'deviceOnline',
            body: {
                'deviceToken': deviceToken
            },
            json: true
        };

        request(options).catch(function (err) {
            trackingClient.trackException({ exception: err, measurements: { 'IApiErr-DeviceOnline': 1 } });
        });
    }

    var onSetSensorData = function (data) {
        var options = {
            method: 'POST',
            uri: serverPath + 'setSensorData',
            body: {
                'sensorData': data
            },
            json: true
        };

        request(options).catch(function (err) {
            trackingClient.trackException({ exception: err, measurements: { 'IApiErr-SetSensorData': 1 } });
        });
    }

    dispatcher.addListener(Messages.InternalComms.deviceOffline, onDeviceOffline);
    dispatcher.addListener(Messages.InternalComms.deviceOnline, onDeviceOnline);
    dispatcher.addListener(Messages.InternalComms.setSensorData, onSetSensorData);

    return this;
};

module.exports = InternalHTTPClient;