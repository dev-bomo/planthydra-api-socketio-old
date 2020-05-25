var dispatcher = require('../shared/dispatcher');
var Messages = require('../shared/messages');
const appInsights = require("applicationinsights");

var Socket = function (sk) {

    // this comes with a specific ID, when getting the dispatcher message it should check that 
    // it's the correct recipient based on the deviceToken and only then emit
    var socket = sk;
    var trackingClient = appInsights.defaultClient;
    var devTok;

    console.log('a user connected');
    trackingClient.trackMetric({ name: 'DeviceConnected', value: 1 });

    socket.on('disconnect', function () {
        dispatcher.dispatch(Messages.InternalComms.deviceOffline, devTok);
        trackingClient.trackMetric({ name: 'DeviceDisconnected', value: 1 });
    });

    socket.on('setDevTok', function (data) {
        if (data.dt) {
            devTok = data.dt;
        } else {
            devTok = data;
        }
        dispatcher.dispatch(Messages.InternalComms.deviceOnline, devTok);
    });

    socket.on('hourlySensorData', function (data) {
        var hd;
        if (data.dt) {
            hd = data.dt;
        } else {
            hd = data;
        }

        dispatcher.dispatch(Messages.InternalComms.setSensorData, hd);
    });

    var checkAndContinue = function (deviceToken) {
        if (!devTok) {
            trackingClient.trackEvent({ name: 'ClientWODevTok', value: 1 });
            return false;
        }

        if (deviceToken !== devTok) {
            return false;
        }

        return true;
    }

    var onCancelWatering = function ({ level, deviceToken }) {

        if (!checkAndContinue(deviceToken)) {
            return;
        }

        socket.emit('cancelWatering', level);
        trackingClient.trackMetric({ name: 'CancelWatering', value: 1 });
    };

    var onWaterNow = function ({ duration, level, deviceToken }) {
        if (!checkAndContinue(deviceToken)) {
            return;
        }

        socket.emit('waterNow', level + ':' + duration);
        trackingClient.trackMetric({ name: 'WaterNow', value: 1 });
    };

    dispatcher.addListener(Messages.SocketActions.waterNow, onWaterNow);
    dispatcher.addListener(Messages.SocketActions.cancelWatering, onCancelWatering);

    return this;
};

module.exports = Socket;