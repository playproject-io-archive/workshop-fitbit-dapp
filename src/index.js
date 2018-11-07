var hasCustomPort = location.href.split('//')[1].indexOf(':')
var isLocalhost = location.href.indexOf('localhost') !== -1
if (hasCustomPort && !isLocalhost) { // update url to use localhost
  location.href = new URL(location.pathname, 'https://localhost:9966').href
  throw new Error('reload page with using "localhost"')
}

const bel = require('bel')
const csjs = require('csjs-inject')

var ABI = require('./abi.json');
var Web3 = require('web3');

// 0. temp email: https://www.mailinator.com/
// 1. make test account: https://www.fitbit.com/signup
// 2. signup as dev: https://dev.fitbit.com/login
// 3. register app: https://dev.fitbit.com/apps/new
const CLIENT_ID = '22D5DZ';
// @NOTE only works if `https://dev.fitbit.com/apps/details/${CLIENT_ID}` has set Callback URL to `location.href` too
const REDIRECT_URL = location.href
const DEFAULT_ADDRESS = "0xa35f44a199015081d86da841ba8e14ece52e840c";
const contractAddress = localStorage.contract || DEFAULT_ADDRESS;
const CONTRACT_GAS = 800000;
const CONTRACT_PRICE = 40000000000;
const MINIMIZE_SIGNUP_AMOUNT = "0.1";
const GOAL_STEPS = 300000
const NETWORK = 'ropsten';

async function web3Init() {
  if (ethereum) {
    web3 = new Web3(ethereum);
    try {
      // https://bit.ly/2QQHXvF
      console.log('ethereum.enable()');
      const accounts = await ethereum.enable();
      web3.eth.defaultAccount = accounts[0];
    } catch (error) {}
  } else if (web3) {
    console.log('load web3.currentProvider');
    web3 = new Web3(web3.currentProvider);
  } else {
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
  }
}

web3Init();

const myContract = new web3.eth.Contract(ABI, contractAddress);
const log = console.log;

/******************************************************************************
  SETUP
******************************************************************************/
const css = csjs `
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
  .longInput {
    margin: 10px;
    width:  500px;
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
  return bel `<div class="${css.box4}">Sponsorship Board : <ul>
    ${result.funders[0].map(function (item, index) {
    return bel`<li>${item} : ${web3.utils.fromWei(result.funders[1][index], "ether")} ETH
    </li>`
    })}
  </ul></div>`
}

// player

function playerRefundButton(result) {
  if (!result.isAvailableRefund) return;
  return bel `
    <button class=${css.shortButton} onclick=${playerRefund}"> Refund </button>
  `;
}

function playSubTitle(result) {
  if (result.goalStep == GOAL_STEPS) {
    return bel `<div>I bet that I can reach 10.000 steps each day! (GOAL: 300.000 steps a month)</div>`
  } else {
    return bel `<div>I bet that I can reach ${result.goalStep} steps! </div>`
  }
}

function betSubTitle(result) {
  if (result.initStep) return bel `<div>Your current amount of steps ${result.step}.</div`;
}

function betAreaElement(result) {
  if (result.isSigned) {
    return bel `
    <div class="${css.box5}">
      You successfully <span class="${css.highlight}">joined</span> the contest.<br>
      ${betSubTitle(result)}
      ${playerRefundButton(result)}
    </div>`;
  } else {
    return bel `
    <div class="${css.box5}">
      ${playSubTitle(result)}
      <button class=${css.shortButton} onclick=${bet}> Bet</button> (joining fee ${MINIMIZE_SIGNUP_AMOUNT} ETH)
    </div>
    `
  }
}

// funder

const fundAmountElement = bel `<input class=${css.input} type="text"/>`;
const fundNameElement = bel `<input class=${css.input} type="text"/>`;

const fundAreaElement = bel `
  <div class="${css.box6}">
    I want to sponsor this contest with ${fundAmountElement} ETH!<br>
    Name you want to be added to our sponsorship board. ${fundNameElement}<br>
    <button class=${css.shortButton} onclick=${fund}> Sponsor </button> (min 0.5 ETH)
  </div>
`

const contractElement = bel `
  <input class="${css.longInput}" type="text" name="address" placeholder="Please enter AwardToken contract addres"/>
`

function debugAreaElement(result) {
  if (window.location.hash.indexOf("#clear") != -1) {
    restoreContract();
  }
  if (window.location.hash.indexOf("#dev") != -1) {
    return bel `
    <div class="${css.box8}">
      ${contractElement}
      <button class=${css.button} onclick=${updateContract}"> Update Address </button><br>
      <button class=${css.button} onclick=${getFitbitToken}"> Get Token </button>
      <button class=${css.button} onclick=${getProfile}"> Get Profile </button>
      <button class=${css.button} onclick=${getTotalStep}"> Get Step </button> <br>
      <button class=${css.button} onclick=${restoreContract}"> Restore Contract </button>
      <button class=${css.button} onclick=${hideDebug}"> Hide Debug </button>
      <button class=${css.button} onclick=${clearCache}"> Clear </button><br>
      <a href="https://${NETWORK}.etherscan.io/address/${contractAddress}">etherscan</a>
    </div>`;
  } else {
    return;
  }
}

function errorRender(errorMessage) {
  console.error(errorMessage);
  document.body.appendChild(bel `
  <div class=${css.error} id="app">
    ${errorMessage}
  </div>
 `)
}

function timeRemindMessage(result) {
  const diffAt = (result.endAt - result.now);
  return niceTimeFormat(diffAt);
}

function niceTimeFormat(s) {
  if (s < 60) {
    return "a few seconds";
  } else if (s < 3600 && s >= 60) {
    return Math.floor(s / 60) + " minutes";
  } else if (s >= 3600 && s <= 86400) {
    return Math.floor(s / 3600) + " hours";
  } else {
    return Math.floor(s / 86400) + " days";
  }
}

function contestDoneButton(result) {
  if (result.status == 0) {
    if (result.endAt > result.now) {
      return bel `<div>
                    waiting for ${timeRemindMessage(result)}. <br>
                    <button class=${css.button}> Step1: contest end </button>
                </div>`;
    } else {
      return bel `<button class=${css.button} onclick=${contestDone}"> Step1: contest end </button>`;
    }
  }
  return;
}

function withdrawalButton(result) {
  if (result.status == 1) return bel `<button class=${css.button} onclick=${award}"> Step2: Award</button>`;
}

function adminAreaElement(result) {
  if (!result.isOwner) return;
  return bel `
  <div class="${css.box7}">
    ${contestDoneButton(result)}
    ${withdrawalButton(result)}
  </div>`;
}

function welcomeSubTitle(result) {
  if (result.goalStep != GOAL_STEPS) {
    return bel `<div>who manage to walk ${result.goalStep} steps in the next ${niceTimeFormat(result.duration)}</div>`
  } else {
    return bel `<div>who manage to walk 300.000 steps in the next 30 days (10.000 steps per day)</div>`
  }
}

function welcomeSubTitle2(result) {
  if (result.now < result.endAt) return bel `<div>The Fitbit Contest ends in ${timeRemindMessage(result)}.</div>`;
}

function render(result) {
  document.body.appendChild(bel `
  <div class=${css.box} id="app">
    <div class="${css.box1}">
      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/ETHEREUM-YOUTUBE-PROFILE-PIC.png"/><br/>
    </div>
    <div class=${css.box2}>
      Please choose the <span class="${css.highlight}">${NETWORK} test chain.</span> You can get test coins from metamasks deposit button on ropsten when clicking faucet.
      <br><br>
      <div>
        <h2><b>Welcome</b> to the Fitbit wellness contest.</h2>
        The price money is shared equally between all participate<br>
        ${welcomeSubTitle(result)}
        ${welcomeSubTitle2(result)}
      </div>
    </div>
    <div class="${css.box3}">
      Total players: ${result.numPlayers} <br>
      Total fees: ${web3.utils.fromWei(result.playersOfAmount, "ether")} ETH. <br><br>
      Total sponsors: ${result.numFunders} <br>
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

if (typeof web3 == 'undefined') {
  const eventHandler = myContract.events.allEvents((error, data) => {
    if (error) console.error(error);
    let {
      event,
      returnValues
    } = data;
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
    function ($0, $1, $2, $3) {
      fragmentQueryParameters[$1] = $3;
    }
  );

  log('fragmentQueryParameters: ', fragmentQueryParameters);
  if (fragmentQueryParameters.access_token) {
    localStorage.userId = fragmentQueryParameters.user_id;
    localStorage.fitbitAccessToken = fragmentQueryParameters.access_token;
  }
}

function processResponse (res) {
  if (!res.ok) {
    localStorage.clear();
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
      'https://api.fitbit.com/1/user/-/profile.json', {
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
      'https://api.fitbit.com/1/user/-/activities.json', {
        headers: new Headers({
          'Authorization': `Bearer ${localStorage.fitbitAccessToken}`
        }),
        mode: 'cors',
        method: 'GET'
      }
    ).then(processResponse)
    .then(function (data) {
      result.currentStep = data.lifetime.total.steps;
      cb(result);
    })
    .catch(function (error) {
      console.error(error);
      cb(result);
    });
}

function showTotalStep(data) {
  console.log('step:', data.lifetime.total.steps);
}

function getTotalStep(event) {
  if (!isExistToken()) console.error('the fitbit access token is not found.')
  fetch(
      'https://api.fitbit.com/1/user/-/activities.json', {
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
  const EXPIRES_IN = (event == 1) ? (60 * 60 * 24 * 40) : (60 * 60 * 24 * 60);
  const uri = REDIRECT_URL
  const redirectUri = encodeURIComponent(uri);
  window.location.target = "_blank";
  const url = `https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=activity%20profile&expires_in=${EXPIRES_IN}`;
  window.location.href = url
  return;
}

/******************************************************************************
  Smart Contract Event
******************************************************************************/

// Generate filter options
const options = {
  // filter: {
  //   _from: process.env.WALLET_FROM,
  //   _to: process.env.WALLET_TO,
  //   _value: process.env.AMOUNT
  // },
  fromBlock: 'latest'
}

myContract.events.NewFundLog(options, async (error, event) => {
  if (error) {
    console.log(error)
    return
  }
  console.log('NewFundLog: ', event.returnValues);
  redirectHome();
  return
});

myContract.events.NewPlayerLog(options, async (error, event) => {
  if (error) {
    console.log(error)
    return
  }
  console.log('NewPlayerLog: ', event.returnValues);
  if (localStorage.wallet == event.returnValues.addr) redirectHome();
  return
});

myContract.events.OraclizeCallbackStep(options, async (error, event) => {
  if (error) {
    console.log(error)
    return
  }
  console.log('OraclizeCallbackStep: ', event.returnValues);
  if (localStorage.wallet == event.returnValues.addr) redirectHome();
  return
});

myContract.events.NoticeContestDone(options, async (error, event) => {
  if (error) {
    console.log(error)
    return
  }
  console.log('NoticeContestDone: ', event.returnValues);
  if (localStorage.wallet == event.returnValues.addr) redirectHome();
  return
});

myContract.events.NoticeAward(options, async (error, event) => {
  if (error) {
    console.log(error)
    return
  }
  console.log('NoticeAward: ', event.returnValues);
  if (localStorage.wallet == event.returnValues.addr) redirectHome();
  return
});

/******************************************************************************
  DOM Event
******************************************************************************/

// === player ===
function playerRefund(event) {
  myContract.methods.playerRefund().send({
    from: localStorage.wallet
  }, (err, data) => {
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
  if (!token) return getFitbitToken(1)

  encryptHeader(token, function (error, header) {
    console.log(header);
    signup(header, MINIMIZE_SIGNUP_AMOUNT);
  });
}

function signup(header, betAmount) {
  const options = {
    from: localStorage.wallet,
    gas: CONTRACT_GAS,
    gasPrice: CONTRACT_PRICE,
    value: web3.utils.toWei(betAmount, "ether")
  };
  myContract.methods.signup(header, localStorage.userId).send(options, (err, data) => {
    if (err) return console.error(err);
    console.log('>>> signup ok.');
  })
}

// === funder ===
function fund(event) {
  let fundAmount = fundAmountElement.value;
  let name = fundNameElement.value;
  if (parseFloat(fundAmount) < MINIMIZE_SIGNUP_AMOUNT) alert("The amount can't low than ", MINIMIZE_SIGNUP_AMOUNT);
  if (parseFloat(localStorage.balance) < parseFloat(fundAmount)) {
    alert("you don't have enough ether.");
    return;
  }
  myContract.methods.fund(name).send({
    from: localStorage.wallet,
    gas: CONTRACT_GAS,
    gasPrice: CONTRACT_PRICE,
    value: web3.utils.toWei(fundAmount, "ether")
  }, (err, data) => {
    if (err) return console.error(err);
    console.log('>>> fund ok.');
  })
}

// === owner ===
function contestDone(event) {
  myContract.methods.contestDone().send({
    from: localStorage.wallet
  }, (err, data) => {
    if (err) return console.error(err);
    console.log('>>> contestDone done');
  })
}

function award(event) {
  myContract.methods.award().send({
    from: localStorage.wallet
  }, (err, data) => {
    if (err) return console.error(err);
    console.log('>>> award done.');
    redirectHome();
  })
}

// === debug ===
function restoreContract(event) {
  delete localStorage.contract;
  redirectHome();
}

function hideDebug(event) {
  redirectHome();
}

function clearCache(event) {
  localStorage.clear();
  redirectHome();
}

function updateContract(event) {
  localStorage.contract = contractElement.value;
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
  encrypt({
    "message": header
  }, function (data) {
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

function redirectHome() {
  location.target = "_blank";
  if (location.href.indexOf("github") != -1) {
    location.href = REDIRECT_URL
  } else {
    location.href = 'http://192.168.0.173:9966/';
  }
}

function done(err, result) {
  if (err) return log(new Error(err))
  const {
    username
  } = result
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
  log('loading (1/9) - getMyAddress')
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
  log('loading (2/9) - getBalance')
  web3.eth.getBalance(result.wallet, (err, wei) => {
    if (err) return done(err);
    const balance = web3.utils.fromWei(wei, 'ether');
    localStorage.balance = balance
    result.balance = balance;
    getFunders(result);
  })
}

function getFunders(result) {
  log('loading (3/9) - getFunders')
  myContract.methods.getFunders().call((err, data) => {
    if (err) return errorRender(`Please switch to ${NETWORK} test chain!`);
    result.funders = data;
    getContestPayload1(result);
  })
}

function getContestPayload1(result) {
  log('loading (4/9) - getContestPayload1')
  myContract.methods.getContestPayload1(result.wallet).call((err, data) => {
    if (err) return console.error(err);
    result.numPlayers = parseInt(data[0], 10);
    result.playersOfAmount = data[1];
    result.numFunders = parseInt(data[2], 10);
    result.fundersOfAmount = data[3];
    result.status = parseInt(data[4], 10);

    if (!localStorage.fitbitAccessToken) result.isSigned = false
    else result.isSigned = data[5]; // @TODO: contract tells about "isSigned = true", but localhost localStorage does not contain FITBIT TOKEN

    getContestPayload2(result);
  })
}

function getContestPayload2(result) {
  log('loading (5/9) - getContestPayload2')
  myContract.methods.getContestPayload2().call((err, data) => {
    if (err) return errorRender(`Please switch to ${NETWORK} test chain!`);
    result.goalStep = parseInt(data[0], 10);
    result.duration = parseInt(data[1], 10);
    result.startAt = parseInt(data[2], 10);
    result.endAt = parseInt(data[3], 10);
    result.now = parseInt(data[4], 10);
    result.isSigned ? getContestPayload3(result) : isOwner(result);
  })
}

function getContestPayload3(result) {
  log('loading (6/9) - getContestPayload3')
  myContract.methods.getContestPayload3(result.wallet).call((err, data) => {
    if (err) return errorRender(`Please switch to ${NETWORK} test chain!`);
    result.beginStep = parseInt(data[0]);
    result.endStep = parseInt(data[1]);
    result.isAvailableRefund = data[2];
    result.initStep = data[3];
    getCurrentStep(result);
  })
}

function getCurrentStep(result) {
  log('loading (7/9) - getEndStep')
  getActivities(result, getContestStep);
}

function getContestStep(result) {
  log('loading (8/9) - getContestStep');
  result.step = (result.now > result.endAt) ? result.endStep - result.beginStep : result.currentStep - result.beginStep;
  isOwner(result);
}

function isOwner(result) {
  log('loading (9/9) - isOwner');
  myContract.methods.isOwner(result.wallet).call((err, data) => {
    if (err) return console.error(err);
    result.isOwner = data;
    console.log('result: ', result);
    render(result);
  })
}

start();
