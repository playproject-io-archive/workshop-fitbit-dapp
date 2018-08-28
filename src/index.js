const bel = require('bel')
const csjs = require('csjs-inject')

var ABI = require('./abi.json');
var Web3 = require('web3');

if(localStorage.web3 === 'dev') {
  console.log('=== dev');
  web3 = new Web3("ws://localhost:8545");
} else {
  if (typeof web3 !== 'undefined') {
    console.log('=== 1');
    web3 = new Web3(web3.currentProvider);
  } else {
    console.log('=== 2');
    // web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    web3 = new Web3("ws://localhost:8545");
  }
}

var contractAddress = "0xf900a403dfb2f56d0fe2d61525ce0ea15b50a8f6";
myContract = new web3.eth.Contract(ABI, contractAddress);

const log = console.log;

/******************************************************************************
  SETUP
******************************************************************************/
const css = csjs`
  .box {
    margin-top: 150px;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 20px;
  }
  .input {
    margin: 10px;
    width: 500px;
    font-size: 20px;
  }
  .button {
    font-size: 20px;
    width: 150px;
  }
`
const hint = "Input user ID"
const input = bel`
  <input class=${css.input} type="text" placeholder="${hint}"/>
`
if (localStorage.userId) {
  input.value = localStorage.userId
  // if (localStorage.ignorePrompt) start()
} else {
  // createInputElement();
}

createInputElement();

/******************************************************************************
  Create Element
******************************************************************************/
function createInputElement() {
  document.body.appendChild(bel`
  <div class=${css.box}>
    ${input}
    <button class=${css.button} onclick=${start}> Signup </button>
    <button class=${css.button} onclick=${getFitbitToken}"> Get Fitbit Token </button>
    <button class=${css.button} onclick=${getTotalStep}"> Get Step </button>
  </div>
`)
}

function createResultElement(result) {
  document.body.innerHTML = "";
  document.body.appendChild(bel`
  <div class=${css.box}>
    ${result}
    <button class=${css.button} onclick=${clearResult} required="required"> Clear </button>
  </div>
`)
}

const eventHandler = myContract.events.allEvents((error, data) => {
  if(error) console.error(error);
  console.log('event:', data);
})

/******************************************************************************
  Fitbit
******************************************************************************/

if (window.location.hash) {
  var fragmentQueryParameters = {};
  window.location.hash.slice(1).replace(
    new RegExp("([^?=&]+)(=([^&]*))?", "g"),
    function ($0, $1, $2, $3) { fragmentQueryParameters[$1] = $3; }
  );

  console.log('fragmentQueryParameters: ', fragmentQueryParameters);
  localStorage.fitbitAccessToken = fragmentQueryParameters.access_token;
}

var processResponse = function (res) {
  if (!res.ok) {
    throw new Error('Fitbit API request failed: ' + res);
  }

  var contentType = res.headers.get('content-type')
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return res.json();
  } else {
    throw new Error('JSON expected but received ' + contentType);
  }
}

function showTotalStep(data) {
  createResultElement(data.lifetime.total.steps);
}

function getTotalStep(event) {
  if (!localStorage.fitbitAccessToken) console.error('the fitbit access token is not found.')
  fetch(
    'https://api.fitbit.com/1/user/-/activities.json',
    {
      headers: new Headers({
        'Authorization': `Bearer ${localStorage.fitbitAccessToken}`
      }),
      mode: 'cors',
      method: 'GET'
    }
  ).then(processResponse)
    .then(showTotalStep)
    .catch(function (error) {
      console.error(error);
    });
}

function getFitbitToken(event) {
  const CLIENT_ID = '22CYSG';
  const EXPIRES_IN = 31536000;
  window.location.replace(`https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=https%3A%2F%2Falincode.github.io%2Fdevon4&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=${EXPIRES_IN}`);
}

/******************************************************************************
  Event
******************************************************************************/
function clearResult(event) {
  localStorage.clear();
  location.reload();
}

/******************************************************************************
  START
******************************************************************************/
function start(event) {
  // localStorage.ignorePrompt = true;
  localStorage.userId = input.value;

  document.body.innerHTML = '';
  getMyAddress({
    username: null,
    userId: input.value
  }); // => Step 1
}
/******************************************************************************
  Step 1
******************************************************************************/
function getMyAddress(result) {
  web3.eth.defaultAccount = web3.eth.accounts[0];
  log('loading (1/7) - getMyAddress')
  web3.eth.getAccounts((err, localAddresses) => {
    if (err) return done(err)
    result.wallet = localAddresses[0]
    getGasPrice(result);
  })
}
/******************************************************************************
  Step 2
******************************************************************************/

function getGasPrice(result) {
  log('loading (2/7) - getGasPrice')
  web3.eth.getGasPrice((err, gasPrice) => {
    if (err) return done(err)
    result.gasPrice = gasPrice;
    callAPI(result);
  })
}

/******************************************************************************
  Step 3
******************************************************************************/
function callAPI(result) {
  log('loading (3/7) - callAPI');
  myContract.methods.register(result.userId).send({ from: result.wallet, value: web3.utils.toWei("0.1", "ether") }, (err, data) => {
    if (err) return console.error(err);
    localStorage.called = true;
  })

  setTimeout(function () {
    getName();
  }, 10 * 1000);
}

function getName() {
  log('loading (4/7) - getName')
  myContract.methods.names(localStorage.userId).call((err, data) => {
    if (err) return console.error(err);
    if (data) createResultElement(data);
    // TODO for easy debug, it will be disable soon...
    window.result = data;
  })
}

/******************************************************************************
  DONE
******************************************************************************/
function done(err, result) {
  if (err) return log(new Error(err))
  const { username } = result
  if (username) {
    log(null, 'success')
    // var el = dapp(result)
    // document.body.appendChild(el)
  } else log(new Error('fail'))
}