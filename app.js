var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var mongoose = require('mongoose');
var CronJob = require('cron').CronJob;
var request = require('request');

require('dotenv').config();

const MONGOURL = process.env.MONGODB_URI || 'mongodb://localhost/good_list';
mongoose.connect(MONGOURL, { useNewUrlParser: true }, err => {
  console.error(err || `Connected to MongoDB: ${MONGOURL}`);
});

var routes = require('./routes/index');

var app = express();
// app.listen(process.env.PORT || 80, '127.0.0.1');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// route
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

new CronJob('0 0 23 * * *', function () {
  request.get(process.env.PRODUCT_URL + '/startScraping', (err, response) => {

  })
}, null, true, 'Asia/Hong_Kong');

new CronJob('0 * * * * *', function () {
  request.get(process.env.PRODUCT_URL + '/getstatus', (err, response) => {
    console.log("download", JSON.parse(response.body).message);
  })
}, null, true, 'Asia/Hong_Kong');

module.exports = app;