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

const contractAddress = "0x9fd2980b9225d2c106deb310095997866e64fa94";
const CONTRACT_GAS = 800000;
const CONTRACT_PRICE = 40000000000;
const MINIMIZE_SIGNUP_AMOUNT = "0.1";

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
    grid-column-end: 2;
    grid-row-start: 1;
    grid-row-end: 3;
  }
  .box2 {
    grid-column-start: 2;
    grid-column-end: 4;
    grid-row-start: 1;
    grid-row-end: 3;
    text-align: center;
  }
  .box3 {
    grid-column-start: 1;
    grid-column-end: 2;
    grid-row-start: 3;
    grid-row-end: 5;
  }
  .box4 {
    grid-column-start: 1;
    grid-column-end: 2;
    grid-row-start: 5;
    grid-row-end: 7;
  }
  .box5 {
    grid-column-start: 2;
    grid-column-end: 4;
    grid-row-start: 3;
    grid-row-end: 4;
    color: #00529B;
    background-color: #BDE5F8;
    padding: 20px;
  }
  .box6 {
    grid-column-start: 2;
    grid-column-end: 4;
    grid-row-start: 4;
    grid-row-end: 6;
    color: #4F8A10;
    background-color: #DFF2BF;
    padding: 20px;
  }
  .box7 {
    grid-column-start: 2;
    grid-column-end: 4;
    grid-row-start: 6;
    grid-row-end: 7;
    background-color: #FFBABA;
    padding: 20px;
  }
  .box8 {
    grid-column-start: 2;
    grid-column-end: 4;
    grid-row-start: 8;
    grid-row-end: 9;
    text-align: center;
    margin-top: 20px;
  }
  .input {
    margin: 10px;
    width: 50px;
    font-size: 20px;
  }
  .button {
    margin-top: 10px;
    font-size: 20px;
    width: 200px;
    background-color: #4CAF50;
    color: white;
  }
  .shortButton {
    margin-top: 10px;
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

function funderAreaElement(result) {
  if (result.funders[0].length == 0) return;
  return bel`<div class="${css.box4}">Funder : <ul>
    ${result.funders[0].map(function (item, index) {
    return bel`<li>${item} : ${web3.utils.fromWei(result.funders[1][index], "ether")} ETH
    </li>`
    })}
  </ul></div>`
}

// player

function playerRefundButton(result) {
  if (!result.isAvailableRefund) return;
  return bel`
    <button class=${css.shortButton} onclick=${playerRefund}"> Refund </button>
  `;
}

function betAreaElement(result) {
  if (result.isSigned){
    return bel`
    <div class="${css.box5}">
      You successfully <span class="${css.highlight}">joined</span> the contest.<br>
      Your current amount of steps ${result.step}. 
      ${playerRefundButton(result)}
    </div>`;
  } else {
    return bel`
    <div class="${css.box5}">
      I bet that I can reach 10.000 steps each day! (GOAL: 300.000 steps a month)<br>
      <button class=${css.shortButton} onclick=${bet}> Bet</button> (joining fee ${MINIMIZE_SIGNUP_AMOUNT} ETH)
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
  <div class="${css.box6}">
    I want to sponsor this contest with ${fundAmountElement} ETH!<br>
    Name you want to be added to our sponsorship board. ${fundNameElement}<br>
    <button class=${css.shortButton} onclick=${fund}> Fund </button> (min 0.5 ETH)
  </div>
`

function debugAreaElement(result) {
  if (localStorage.debug == "true") {
    return bel`
    <div class="${css.box8}">
      <button class=${css.shortButton} onclick=${getFitbitToken}"> Get Token </button> 
      <button class=${css.shortButton} onclick=${getProfile}"> Get Profile </button> 
      <button class=${css.shortButton} onclick=${getTotalStep}"> Get Step </button> 
      <button class=${css.shortButton} onclick=${clearResult}"> Clear </button><br><br>
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

function contestDoneButton(result) {
  if (result.status == 0) {
    return bel`
    <button class=${css.button} onclick=${contestDone}"> Step1: contest end </button>
  `;
  }
  return;
}

function withdrawalButton(result) {
  if (result.status == 1) {
    return bel`
    <button class=${css.button} onclick=${award}"> Step2: Award</button>
  `;
  }
}

function adminAreaElement(result) {
  if (!result.isOwner) return;
  return bel`
  <div class="${css.box7}">
    ${contestDoneButton(result)}
    ${withdrawalButton(result)}
  </div>`;
}

function render(result) {
  document.body.appendChild(bel`
  <div class=${css.box} id="app">
    <div class="${css.box1}">
      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/ETHEREUM-YOUTUBE-PROFILE-PIC.png"/><br/>
    </div>
    <div class=${css.box2}>
      Please choose the <span class="${css.highlight}">Rinkeby test chain.</span> You could get test coin from <a href="https://faucet.rinkeby.io/">here</a>.
      <br><br>
      <div>
        <b>Welcome</b> to the Fitbit wellness contest.<br>
        The price money is shared equally between all participate<br>
        who manage to walk 300.000 steps in the next 30 days (10.000 steps per day)
      </div>
    </div>
    <div class="${css.box3}">
      Total players: ${result.numPlayers} <br>
      Total fees: ${web3.utils.fromWei(result.playersOfAmount, "ether")} ETH. <br><br>
      Total funders: ${result.numFunders} <br>
      Total prize amount: ${web3.utils.fromWei(result.fundersOfAmount, "ether")} ETH. <br><br>
    </div>
    ${funderAreaElement(result)}
    ${betAreaElement(result)}
    ${fundAreaElement}
    ${adminAreaElement(result)}
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
    if (event === 'LOG_OraclizeCallbackStep') console.log('callback data:', returnValues);
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

function getActivities(result, cb) {
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
    .then(function(data) {
      result.endStep = data.lifetime.total.steps;
      cb(result);
    })
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
  window.open(`https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=activity%20profile&expires_in=${EXPIRES_IN}`, '_blank');

  // window.location.replace(`https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=https%3A%2F%2Falincode.github.io%2Fdevon4&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=${EXPIRES_IN}`);
}

/******************************************************************************
  Event
******************************************************************************/

// player

function playerRefund(event) {
  myContract.methods.playerRefund().send({ from: localStorage.wallet }, (err, data) => {
    if (err) return console.error(err);
    console.log('>>> player refund done.');
  })
}

function bet(event) {
  if (parseFloat(localStorage.balance) < parseFloat(MINIMIZE_SIGNUP_AMOUNT)) {
    alert("you don't have enough ether.");
    return;
  }

  const token = localStorage.fitbitAccessToken;
  if (!token) {
    localStorage.continueBetAmount = MINIMIZE_SIGNUP_AMOUNT;
    localStorage.continueEvent = 1;
    getFitbitToken();
    return;
  }

  encryptHeader(token, function(error, header){
    console.log(header);
    signup(header, MINIMIZE_SIGNUP_AMOUNT);
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
  myContract.methods.contestDone().send({ from: localStorage.wallet }, (err, data) => {
    if (err) return console.error(err);
    console.log('>>> contestDone done');
  })
}

function award(event) {
  myContract.methods.award().send({ from: localStorage.wallet}, (err, data) => {
    if (err) return console.error(err);
    console.log('>>> award done.');
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
    default:
      break;
  }
}

function getMyAddress(result) {
  web3.eth.defaultAccount = web3.eth.accounts[0];
  log('loading (1/14) - getMyAddress')
  web3.eth.getAccounts((err, localAddresses) => {
    if (!localAddresses) return errorRender('You must be have MetaMask or local RPC endpoint.');
    if (!localAddresses[0]) return errorRender('You need to login MetaMask.');
    if (err) return done(err);
    localStorage.wallet = localAddresses[0];
    result.wallet = localAddresses[0];
    getBalance(result);
  })
}

function getBalance(result) {
  log('loading (2/14) - getBalance')
  web3.eth.getBalance(result.wallet, (err, wei) => {
    if (err) return done(err);
    const balance = web3.utils.fromWei(wei, 'ether');
    localStorage.balance = balance
    result.balance = balance;
    getNumPlayers(result);
  })
}

function getNumPlayers(result) {
  log('loading (3/14) - getNumPlayers')
  myContract.methods.getNumPlayers().call((err, data) => {
    if (err) return errorRender('Please switch to Rinkeby test chain!');
    result.numPlayers = parseInt(data, 10);
    getPlayersOfAmount(result);
  })
}

function getPlayersOfAmount(result) {
  log('loading (4/14) - getPlayersOfAmount')
  myContract.methods.getPlayersOfAmount().call((err, data) => {
    if (err) return console.error(err);
    result.playersOfAmount = data;
    getNumFunders(result);
  })
}

function getNumFunders(result) {
  log('loading (5/14) - getNumFunders')
  myContract.methods.getNumFunders().call((err, data) => {
    if (err) return console.error(err);
    result.numFunders = parseInt(data, 10);
    getFundersOfAmount(result);
  })
}

function getFundersOfAmount(result) {
  log('loading (6/14) - getFundersOfAmount')
  myContract.methods.getFundersOfAmount().call((err, data) => {
    if (err) return console.error(err);
    result.fundersOfAmount = data;
    getFunders(result);
  })
}

function getFunders(result) {
  log('loading (7/14) - getFunders')
  myContract.methods.getFunders().call((err, data) => {
    if (err) return console.error(err);
    result.funders = data;
    getStatus(result);
  })
}

function getStatus(result) {
  log('loading (8/14) - getStatus')
  myContract.methods.getStatus().call((err, data) => {
    if (err) return console.error(err);
    result.status = parseInt(data);
    isSigned(result);
  })
}

function isSigned(result) {
  log('loading (9/14) - isSigned')
  myContract.methods.isSigned(result.wallet).call((err, data) => {
    if (err) return console.error(err);
    result.isSigned = data;
    data ? getBeginStep(result) : isOwner(result);
  })
}

function getBeginStep(result) {
  log('loading (10/14) - getBeginStep')
  myContract.methods.getBeginStep(result.wallet).call((err, data) => {
    if (err) return console.error(err);
    result.beginStep = parseInt(data);
    getEndStep(result);
  })
}

function getEndStep(result) {
  log('loading (11/14) - getEndStep')
  getActivities(result, getContestStep);
}

function getContestStep(result) {
  log('loading (12/14) - getContestStep');
  result.step = (result.beginStep > result.endStep) ? 0 : result.endStep - result.beginStep;
  isAvailableRefund(result);
}

function isAvailableRefund(result) {
  log('loading (13/14) - isAvailableRefund');
  myContract.methods.isAvailableRefund().call((err, data) => {
    if (err) return console.error(err);
    result.isAvailableRefund = data;
    isOwner(result);
  })
  
}

function isOwner(result) {
  log('loading (14/14) - isOwner')
  myContract.methods.isOwner(result.wallet).call((err, data) => {
    if (err) return console.error(err);
    result.isOwner = data;

    console.log('result: ', result);
    continueProcess();
    render(result);
  })
}

start();
