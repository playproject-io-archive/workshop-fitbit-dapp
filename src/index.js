const bel = require('bel')
const csjs = require('csjs-inject')

var ABI = require('./abi.json');
var Web3 = require('web3');

if (typeof web3 !== 'undefined') {
  console.log('=== 1');
  web3 = new Web3(web3.currentProvider);
} else {
  console.log('=== 2');
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

var contractAddress = "0xed7e9d57efe6ee00114a311dae07bb1692999458";
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
    <button class=${css.button} onclick=${start} required="required"> Signup </button>
  </div>
`)
}

function createResultElement(result) {
  document.body.appendChild(bel`
  <div class=${css.box}>
    ${result}
    <button class=${css.button} onclick=${clearResult} required="required"> Clear </button>
  </div>
`)
}

// const eventHandler = myContract.events.allEvents((error, data) => {
//   if(error) console.error(error);
//   document.body.innerHTML = data;
// })

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
    username: null
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
  // if (!localStorage.called) {
    myContract.methods.callAPItoGetUserName().send({ from: result.wallet, value: web3.utils.toWei("0.01", "ether") }, (err, data) => {
      if (err) return console.error(err);
      localStorage.called = true;
    })
  // }

  setTimeout(function () {
    getName();
  }, 10 * 1000);
}

function getName() {
  log('loading (4/7) - getName')
  myContract.methods.name().call((err, data) => {
    if (err) return console.error(err);
    createResultElement(data);
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