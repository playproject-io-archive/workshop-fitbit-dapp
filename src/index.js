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

const contractAddress = "0x33a63e496a7231d15a7fa0b315878563b3c81b94";
const CONTRACT_GAS = 400000;
const CONTRACT_PRICE = 40000000000;
const MINIMIZE_SIGNUP_AMOUNT = 0.1

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
      color: #00529B;
      background-color: #BDE5F8;
      padding-left: 20px;
  }
  .box4 { 
      grid-column-start: 2; 
      grid-column-end: 4; 
      grid-row-start: 4; 
      grid-row-end: 5;
      color: #4F8A10;
      background-color: #DFF2BF;
      padding-left: 20px;
  }
  .box5 { 
    grid-column-start: 1; 
    grid-column-end: 4; 
    grid-row-start: 6; 
    grid-row-end: 7;
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

  .info, .success, .warning, .error, .validation {
    border: 1px solid;
    margin: 10px 0px;
    padding: 15px 10px 15px 50px;
    background-repeat: no-repeat;
    background-position: 10px center;
  }
  .info {
    color: #00529B;
    background-color: #BDE5F8;
    background-image: url('https://i.imgur.com/ilgqWuX.png');
  }
  .success {
    color: #4F8A10;
    background-color: #DFF2BF;
    background-image: url('https://i.imgur.com/Q9BGTuy.png');
  }
  .warning {
    color: #9F6000;
    background-color: #FEEFB3;
    background-image: url('https://i.imgur.com/Z8q7ww7.png');
  }
  .error {
    color: #D8000C;
    background-color: #FFBABA;
    background-image: url('https://i.imgur.com/GnyDvKN.png');
  }
  .validation {
    color: #D63301;
    background-color: #FFCCBA;
    background-image: url('https://i.imgur.com/GnyDvKN.png');
  }
`

/******************************************************************************
  Create Element
******************************************************************************/

// player

const batAmountElement = bel`
  <input class=${css.input} type="text"/>
`

function batAreaElement(result) {
  if (result.isSigned){
    return bel`
    <div>
      you already <span class="${css.highlight}">signed</span> the contest. 
      <button class=${css.button} onclick=${updateStep}> update step</button>
    </div>`;
  } else {
    return bel`
    <div class="${css.box3}">
      Hi player, how much you want to bet? ${batAmountElement} ETH. <button class=${css.button} onclick=${bet}> Bet </button><br>
      (minimum is 0.1 ETH)
    </div>
    `
  }
}

// funder

const fundAmountElement = bel`
  <input class=${css.input} type="text"/>
`
const fundNameElement = bel`
  <input class=${css.input} type="text"/>
`
const fundAreaElement = bel`
  <div class="${css.box4}">
    Hi funder, please input your name ${fundNameElement} <br>
    How much you want to fund? ${fundAmountElement} ETH <button class=${css.button} onclick=${fund}> Fund </button> (minimum is 0.1 ETH)
  </div>
`

function debugAreaElement(result) {
  if (localStorage.debug == "true") {
    return bel`
    <div class="${css.box5}">
      <button class=${css.button} onclick=${getFitbitToken}"> Get Token </button>
      <button class=${css.button} onclick=${getProfile}"> Get Profile </button>
      <button class=${css.button} onclick=${getTotalStep}"> Get Step </button>
      <button class=${css.button} onclick=${clearResult}"> Clear </button><br><br>
      <a href="https://rinkeby.etherscan.io/address/${contractAddress}">etherscan</a>
    </div>`;
  } else {
    return;
  }
}

function errorRender(errorMessage) {
  console.error(errorMessage);
  document.body.appendChild(bel`
  <div class=${css.error} id="app">
    ${errorMessage}
  </div>
 `)
}

function adminAreaElement(result) {
  if (!result.isOwner) return;
  return bel`
  <div>
    <button class=${css.button} onclick=${contestDone}"> Contest Done </button>
    <button class=${css.button} onclick=${ownerWithdrawal}"> Owner Withdrawal </button>
  </div>`;
}

function stepElement(result) {
  if(!result.isSigned) return;
  return bel`
    <div>
      Your begin step is ${result.beginStep}.<br>
      Your contest step is ${result.step}.
    </div>`;
}

function render(result) {
  document.body.appendChild(bel`
  <div class=${css.box} id="app">
    <div class=${css.box1}>
      Please choose the <span class="${css.highlight}">Rinkeby test chain.</span> You could get test coin from <a href="https://faucet.rinkeby.io/">here</a>.
      <br><br>
      ${adminAreaElement(result)}
    </div>
    <div class="${css.box2}">
      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/ETHEREUM-YOUTUBE-PROFILE-PIC.png"/><br/>
      There is ${result.numPlayers} player. <br>
      Players total amount is ${web3.utils.fromWei(result.playersOfAmount, "ether")} ETH. <br><br>
      There is ${result.numFunders} funder. <br>
      Funders total amount is ${web3.utils.fromWei(result.fundersOfAmount, "ether")} ETH. <br><br>
      ${stepElement(result)}
    </div>
    ${batAreaElement(result)}
    ${fundAreaElement}
    ${debugAreaElement(result)}
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

function isExistToken() {
  return localStorage.fitbitAccessToken && localStorage.fitbitAccessToken.length > 0
}

function showProfile(data) {
  localStorage.userId = data.user.encodedId;
  console.dir(data);
}

function getProfile(event) {
  if (!isExistToken()) console.error('the fitbit access token is not found.')
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
  console.log('step:', data.lifetime.total.steps);
}

function getTotalStep(event) {
  if (!isExistToken()) console.error('the fitbit access token is not found.')
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
  // const uri = window.location.href;
  const uri = "https://alincode.github.io/devon4";
  const redirectUri = encodeURIComponent(uri);
  window.location.replace(`https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=activity%20profile&expires_in=${EXPIRES_IN}`);

  // window.location.replace(`https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=https%3A%2F%2Falincode.github.io%2Fdevon4&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=${EXPIRES_IN}`);
}

/******************************************************************************
  Event
******************************************************************************/

// player

function bet(event) {
  let betAmount = batAmountElement.value;
  if (parseFloat(batAmountElement.value) < MINIMIZE_SIGNUP_AMOUNT) alert("The amount can't low than ", MINIMIZE_SIGNUP_AMOUNT);
  if (parseFloat(localStorage.balance) < parseFloat(betAmount)) {
    alert("you don't have enough ether.");
    return;
  }

  const token = localStorage.fitbitAccessToken;
  if (!token) {
    localStorage.continueBetAmount = betAmount;
    localStorage.continueEvent = 1;
    getFitbitToken();
    return;
  }

  encryptHeader(token, function(error, header){
    console.log(header);
    signup(header, betAmount);
  });
}

function signup(header, betAmount) {
  const options = { from: localStorage.wallet, gas: CONTRACT_GAS, gasPrice: CONTRACT_PRICE, value: web3.utils.toWei(betAmount, "ether") };
  myContract.methods.signup(header, localStorage.userId).send(options, (err, data) => {
    if (err) return console.error(err);
    console.log('>>> bet ok.');
    localStorage.removeItem("continueBetAmount");
    localStorage.removeItem("continueEvent");
  })
}

function updateStep(event) {
  if (!localStorage.fitbitAccessToken) {
    localStorage.continueEvent = 2;
    getFitbitToken();
    return;
  }
  myContract.methods.playerWithdrawal(localStorage.fitbitAccessToken, "alincode").send({ from: localStorage.wallet, gas: CONTRACT_GAS, gasPrice: CONTRACT_PRICE, value: web3.utils.toWei("0.01", "ether") }, (err, data) => {
    if (err) return console.error(err);
    console.log('>>> playerWithdrawal ok.');
    localStorage.removeItem("continueEvent");
  })
}

// funder

function fund(event) {
  let fundAmount = fundAmountElement.value;
  let name = fundNameElement.value;
  if (parseFloat(fundAmount) < MINIMIZE_SIGNUP_AMOUNT) alert("The amount can't low than ", MINIMIZE_SIGNUP_AMOUNT);
  if (parseFloat(localStorage.balance) < parseFloat(fundAmount)) {
    alert("you don't have enough ether.");
    return;
  }
  myContract.methods.fund(name).send({ from: localStorage.wallet, gas: CONTRACT_GAS, gasPrice: CONTRACT_PRICE, value: web3.utils.toWei(fundAmount, "ether") }, (err, data) => {
    if (err) return console.error(err);
    console.log('>>> fund ok.');
  })
}

// owner

function contestDone(event) {
  myContract.methods.done().send({ from: localStorage.wallet}, (err, data) => {
    if (err) return console.error(err);
    console.log('>>> contest done.');
  })
}

function ownerWithdrawal(event) {
  myContract.methods.ownerWithdrawal().send({ from: localStorage.wallet}, (err, data) => {
    if (err) return console.error(err);
    console.log('>>> owner withdrawal');
  })
}

function clearResult(event) {
  localStorage.clear();
  location.reload();
}

/******************************************************************************
  Oraclize
******************************************************************************/
function encrypt(data, next) {
  const init = {
    method: 'POST',
    body: JSON.stringify(data),
  };

  fetch('https://api.oraclize.it/v1/utils/encryption/encrypt', init)
    .then(processResponse)
    .then(next)
    .catch(console.error);
}

function encryptHeader(token, next) {
  const header = `{'headers': {'content-type': 'json', 'Authorization': 'Bearer ${token}'}}`;
  encrypt({ "message" : header }, function (data) {
    // console.log(data);
    if (data.success) {
      next(null, data.result);
    } else {
      next(new Error("encrypt header fail"));
    }
  });
}

// encryptHeader("123", console.log);

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

function continueProcess() {
  switch (localStorage.continueEvent) {
    case "1":
      bet();
      break;
    case "2":
      updateStep();
      break;
    default:
      break;
  }
}

function getMyAddress(result) {
  web3.eth.defaultAccount = web3.eth.accounts[0];
  log('loading (1/10) - getMyAddress')
  web3.eth.getAccounts((err, localAddresses) => {
    if (!localAddresses) return errorRender('You must be have MetaMask or local RPC endpoint.');
    if (err) return done(err)
    localStorage.wallet = localAddresses[0];
    result.wallet = localAddresses[0];
    getBalance(result);
  })
}

function getBalance(result) {
  log('loading (2/10) - getBalance')
  web3.eth.getBalance(result.wallet, (err, wei) => {
    if (err) return done(err)
    const balance = web3.utils.fromWei(wei, 'ether');
    localStorage.balance = balance
    result.balance = balance;
    getNumPlayers(result);
  })
}

function getNumPlayers(result) {
  log('loading (3/10) - getNumPlayers')
  myContract.methods.getNumPlayers().call((err, data) => {
    if (err) return errorRender('Please switch to Rinkeby test chain!');
    result.numPlayers = parseInt(data, 10);
    getPlayersOfAmount(result);
  })
}

function getPlayersOfAmount(result) {
  log('loading (4/10) - getPlayersOfAmount')
  myContract.methods.getPlayersOfAmount().call((err, data) => {
    if (err) return console.error(err);
    result.playersOfAmount = data;
    getNumFunders(result);
  })
}

function getNumFunders(result) {
  log('loading (5/10) - getNumFunders')
  myContract.methods.getNumFunders().call((err, data) => {
    if (err) return console.error(err);
    result.numFunders = parseInt(data, 10);
    getFundersOfAmount(result);
  })
}

function getFundersOfAmount(result) {
  log('loading (6/10) - getFundersOfAmount')
  myContract.methods.getFundersOfAmount().call((err, data) => {
    if (err) return console.error(err);
    result.fundersOfAmount = data;
    isSigned(result);
  })
}

function isSigned(result) {
  log('loading (7/10) - isSigned')
  myContract.methods.isSigned(result.wallet).call((err, data) => {
    if (err) return console.error(err);
    result.isSigned = data;
    data ? getBeginStep(result) : isOwner(result);
  })
}

function getBeginStep(result) {
  log('loading (8/10) - getBeginStep')
  myContract.methods.getBeginStep(result.wallet).call((err, data) => {
    if (err) return console.error(err);
    result.beginStep = data;
    getContestStep(result);
  })
}

function getContestStep(result) {
  log('loading (9/10) - getContestStep')
  myContract.methods.getContestStep(result.wallet).call((err, data) => {
    if (err) return console.error(err);
    result.step = (data.length > 20) ? 0 : data;
    isOwner(result);
  })
}

function isOwner(result) {
  log('loading (10/10) - isOwner')
  myContract.methods.isOwner(result.wallet).call((err, data) => {
    if (err) return console.error(err);
    result.isOwner = data;
    
    console.log('result: ', result);
    continueProcess();
    render(result);
  })
}

start();