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

var contractAddress = "0x99f3beb1e6aabda96f2b39dd4b5941c52317b247";
const CONTRACT_GAS = 400000;
const CONTRACT_PRICE = 40000000000;

myContract = new web3.eth.Contract(ABI, contractAddress);

const log = console.log;

/******************************************************************************
  SETUP
******************************************************************************/
const css = csjs`
  .box {
    display: grid; 
    grid-template-columns: repeat(3, 1fr); 
    grid-auto-rows: 100px; 
  }
  .box1 { 
    grid-column-start: 1; 
    grid-column-end: 4; 
    grid-row-start: 1; 
    grid-row-end: 3;
    text-align: center;
  } 
  .box2 { 
      grid-column-start: 1; 
      grid-row-start: 3; 
      grid-row-end: 5; 
  }
  .box3 { 
      grid-column-start: 2; 
      grid-column-end: 4; 
      grid-row-start: 3; 
      grid-row-end: 4; 
  }
  .box4 { 
      grid-column-start: 2; 
      grid-column-end: 4; 
      grid-row-start: 4; 
      grid-row-end: 5; 
  }
  .box5 { 
    grid-column-start: 1; 
    grid-column-end: 4; 
    grid-row-start: 5; 
    grid-row-end: 6;
    text-align: center;
  }
  .input {
    margin: 10px;
    width: 50px;
    font-size: 20px;
  }
  .button {
    font-size: 20px;
    width: 120px;
    background-color: #4CAF50;
    color: white;
  }
  .highlight {
    color: red;
  }
  img {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 5px;
    width: 150px;
  }
`

/******************************************************************************
  Create Element
******************************************************************************/

// player

const batAmountElement = bel`
  <input class=${css.input} type="text"/>
`
const batAreaElement = bel`
  <div class="${css.box3}">
    Hi player, how much you want to bet? ${batAmountElement} ETH. 
    <button class=${css.button} onclick=${bet}> Bet </button>
  </div>
`

// funder

const fundAmountElement = bel`
  <input class=${css.input} type="text"/>
`
const fundNameElement = bel`
  <input class=${css.input} type="text"/>
`
const fundAreaElement = bel`
  <div class="${css.box4}">
    Hi funder, how much you want to fund? ${fundAmountElement} ETH and what is your name ${fundNameElement}
    <button class=${css.button} onclick=${fund}> Fund </button>
  </div>
`

function errorRender(errorMessage) {
  console.error(errorMessage);
  document.body.appendChild(bel`
  <div class=${css.box} id="app">
    ${errorMessage}
  </div>
 `)
}

function render(result) {
  document.body.appendChild(bel`
  <div class=${css.box} id="app">
    <div class=${css.box1}>
      Please choose the <span class="${css.highlight}">Rinkeby test chain.</span> You could get test coin from <a href="https://faucet.rinkeby.io/">here</a>.<br>
      <a href="https://rinkeby.etherscan.io/address/${contractAddress}">etherscan</a>
    </div>
    <div class="${css.box2}">
      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/ETHEREUM-YOUTUBE-PROFILE-PIC.png"/><br/>
      There is ${result.numPlayers} player. <br>
      There is ${result.numFunders} funder. <br>
      Players total amount is ${web3.utils.fromWei(result.playersOfAmount, "ether")} ETH. <br>
      Funders total amount is ${web3.utils.fromWei(result.fundersOfAmount, "ether")} ETH. <br>
    </div>
    ${batAreaElement}
    ${fundAreaElement}
    <div class="${css.box5}">
      <button class=${css.button} onclick=${getFitbitToken}"> Get Token </button>
      <button class=${css.button} onclick=${getProfile}"> Get Profile </button>
      <button class=${css.button} onclick=${getTotalStep}"> Get Step </button>
    </div>
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

if(typeof web3 == 'undefined') {
  const eventHandler = myContract.events.allEvents((error, data) => {
    if (error) console.error(error);
    let { event, returnValues } = data;
    console.log('event:', data);
    let userId = returnValues.userId;
    if (event === 'LOG_OraclizeCallbackName') console.log('callback data:', returnValues);
    if (event === 'LOG_OraclizeCallbackStep') console.log('callback data:', returnValues);
    if (event === 'NewOraclizeQuery') console.log('oraclize log:', returnValues);
  })
}

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
  localStorage.userId = fragmentQueryParameters.user_id;
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

function showProfile(data) {
  console.dir(data);
}

function getProfile(event) {
  if (!localStorage.fitbitAccessToken) console.error('the fitbit access token is not found.')
  fetch(
    'https://api.fitbit.com/1/user/-/profile.json',
    {
      headers: new Headers({
        'Authorization': `Bearer ${localStorage.fitbitAccessToken}`
      }),
      mode: 'cors',
      method: 'GET'
    }
  ).then(processResponse)
    .then(showProfile)
    .catch(function (error) {
      console.error(error);
    });
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
function bet(event) {
  let betAmount = batAmountElement.value;
  myContract.methods.signup(localStorage.fitbitAccessToken, "alincode").send({ from: localStorage.wallet, gas: CONTRACT_GAS, gasPrice: CONTRACT_PRICE, value: web3.utils.toWei(betAmount, "ether") }, (err, data) => {
    if (err) return console.error(err);
    console.log('>>> bet ok.');
  })
}

function fund(event) {
  let fundAmount = fundAmountElement.value;
  let name = fundNameElement.value;
  myContract.methods.fund(name).send({ from: localStorage.wallet, gas: CONTRACT_GAS, gasPrice: CONTRACT_PRICE, value: web3.utils.toWei(fundAmount, "ether") }, (err, data) => {
    if (err) return console.error(err);
    console.log('>>> fund ok.');
  })
}

function clearResult(event) {
  localStorage.clear();
  location.reload();
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

/******************************************************************************
  START
******************************************************************************/
function start() {
  getMyAddress({
    fitbitAccessToken: localStorage.fitbitAccessToken
  });
}

function getMyAddress(result) {
  web3.eth.defaultAccount = web3.eth.accounts[0];
  log('loading (1/7) - getMyAddress')
  web3.eth.getAccounts((err, localAddresses) => {
    localStorage.wallet = localAddresses[0];
    if (err) return done(err)
    result.wallet = localAddresses[0];
    getNumPlayers(result);
  })
}

function getNumPlayers(result) {
  log('loading (2/7) - getNumPlayers')
  myContract.methods.getNumPlayers().call((err, data) => {
    if (err) return errorRender('Please switch to Rinkeby test chain!');
    result.numPlayers = parseInt(data, 10);
    getPlayersOfAmount(result);
  })
}

function getPlayersOfAmount(result) {
  log('loading (3/7) - getPlayersOfAmount')
  myContract.methods.getPlayersOfAmount().call((err, data) => {
    if (err) return console.error(err);
    result.playersOfAmount = data;
    getNumFunders(result);
  })
}

function getNumFunders(result) {
  log('loading (4/7) - getNumFunders')
  myContract.methods.getNumFunders().call((err, data) => {
    if (err) return console.error(err);
    result.numFunders = parseInt(data, 10);
    getTotalAmount(result);
  })
}

function getTotalAmount(result) {
  log('loading (5/7) - getTotalAmount')
  myContract.methods.getNumFunders().call((err, data) => {
    if (err) return console.error(err);
    result.totalAmount = parseInt(data, 10);
    getFundersOfAmount(result);
  })
}

function getFundersOfAmount(result) {
  log('loading (6/7) - getFundersOfAmount')
  myContract.methods.getFundersOfAmount().call((err, data) => {
    if (err) return console.error(err);
    result.fundersOfAmount = data;
    console.log(result);
    render(result);
  })
}

start();