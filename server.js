const express = require('express');
const path = require('path'); // Required for path.join
const bcrypt = require('bcrypt');
const logger = require('./utils/logger');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes');
const masterRoutes = require('./routes/masterRoutes');
const eventRoutes = require('./routes/eventRoutes');
const shopRoutes = require('./routes/shopRoutes');
const errorHandler = require('./utils/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const auth = require('./middleware/auth');

const app_title = "TIME TANGO";
const app = express();

app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render("index", {title: app_title, groupid: "default", func: "me"});
});
app.get('/login', (req, res) => {
  res.render('login', {title: app_title});
});
//app.get('/home/:func?/:groupid?', (req, res) => {
//app.get('/home/{/:func}{/:groupid}', (req, res) => {
app.get('/home{/:groupid}{/:func}', (req, res) => {
  // home/default goto index template
  // console.log( "Home ");
  // console.log( req.params );
  // console.log( "Home 2");
  var groupid = "";
  if( req.params.groupid ){
    groupid = req.params.groupid;
  }
  var func = "";
  if( req.params.func ){
    func = req.params.func;
  }
  console.log("Function " + func +" group="+ groupid);
  res.render("index", {title: app_title, groupid: groupid, func: func});
});
app.use('/api', masterRoutes);
app.use('/api', userRoutes);
app.use('/api', eventRoutes);
app.use('/api', shopRoutes);
app.use(requestLogger);
app.use(errorHandler);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});