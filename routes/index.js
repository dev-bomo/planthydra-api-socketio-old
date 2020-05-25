var express = require('express');
var router = express.Router();
var dispatcher = require('../shared/dispatcher');
var Messages = require('../shared/messages');
var HttpStatus = require('http-status-codes');
var appInsights = require("applicationinsights");

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/cancelWatering', function (req, res, next) {
  var { deviceToken, level } = req.body;

  if (!deviceToken || !level) {
    var trackingClient = appInsights.defaultClient;
    trackingClient.trackException({
      exception: 'Improper post body on CancelWatering internal request',
      measurements: { 'IApiErr-CancelWatering': 1 }
    });
    res.status(HttpStatus.BAD_REQUEST).send('Missing:' +
      deviceToken ? '' : 'deviceToken' +
        level ? '' : 'level').end();
    return;
  }

  dispatcher.dispatch(Messages.SocketActions.cancelWatering, { level: level, deviceToken: deviceToken });
  res.sendStatus(HttpStatus.OK);
});

router.post('/waterNow', function (req, res) {
  var { deviceToken, duration, level } = req.body;

  if (!deviceToken || !duration || !level) {
    var trackingClient = appInsights.defaultClient;
    trackingClient.trackException({
      exception: 'Improper post body on WaterNow internal request',
      measurements: { 'IApiErr-WaterNow': 1 }
    });
    res.status(HttpStatus.BAD_REQUEST).send('Missing:' +
      deviceToken ? '' : ' deviceToken' +
        duration ? '' : ' duration' +
          level ? '' : ' level').end();
    return;
  }

  dispatcher.dispatch(Messages.SocketActions.waterNow, { duration: duration, level: level, deviceToken: deviceToken });
  res.sendStatus(HttpStatus.OK);
});


module.exports = router;
