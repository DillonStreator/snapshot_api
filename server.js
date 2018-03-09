var express = require('express');
var app = express();
const Nightmare = require('nightmare')
const nightmare = Nightmare();

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

// set the view engine to ejs
app.set('view engine', 'ejs');

// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));

app.use(express.json());
app.use(express.urlencoded());

// set the home page route
app.get('/', function(req, res) {
	// ejs render automatically looks in the views folder
	res.render('index');
});

app.post('/getProduct', function(req, res) {

  console.log('scanned-upc: ',req.body['scanned-upc']);
  let data = {};

  nightmare
    .goto('https://upcfoodsearch.com')
    .type('#s', req.body['scanned-upc'])
    .click('#searchsubmit')
    .wait('#myChart')
    .evaluate(() => {
      let evaulations = {};
      evaulations.product_title = document.querySelector('h1').innerHTML;
      evaulations.labels = window.data._chartjs.listeners[0].chart.config.data.labels;
      evaulations.backgroundColors = window.data._chartjs.listeners[0].chart.config.data.datasets[0].backgroundColor;
      let chartItems = {};
      let items = window.data;
      for (let i = 0; i < items.length; i++) {
          if ( !items[i.toString()] ) {
              chartItems[evaulations.labels[i]] = 0;
          } else {
              chartItems[evaulations.labels[i]] = items[i.toString()];
          }
      }
      evaulations.piePieces = chartItems;
      return evaulations;
    })
    .end()
    .then(res => {
      console.log('We  had a successful search.. here are the results:', res);
      data = res;
      sendData();
    })
    .catch(error => {
      console.log('Dropped into catch block');
    })

    function sendData() {
      res.send(JSON.stringify(data));
    }

})

app.listen(port, function() {
	console.log('Our app is running on http://localhost:' + port);
});