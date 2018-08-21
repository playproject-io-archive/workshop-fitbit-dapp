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
const hint = "Hello World"
const input = bel`
  <input class=${css.input} type="text" placeholder="${hint}"/>
`
if (localStorage.address) input.value = localStorage.address
if (localStorage.ignorePrompt) start()
else document.body.appendChild(bel`
  <div class=${css.box}>
    ${input}
    <button class=${css.button} onclick=${start}> submit </button>
  </div>
`)

// const eventHandler = myContract.events.allEvents((error, data) => {
//   if(error) console.error(error);
//   document.body.innerHTML = data;
// })

/******************************************************************************
  START
******************************************************************************/
function start(event) {
  localStorage.ignorePrompt = true
  document.body.innerHTML = ''
  getMyAddress({
    username: null
  }) // => Step 1
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
    getName(result) // => Step 2
  })
}
/******************************************************************************
  Step 2
******************************************************************************/
function getName(result) {
  log('loading (2/7) - getName')
    myContract.methods.name().call((err, data) => {
      if (err) return console.error(err);
      if (!data) callAPI(result);
      document.body.innerHTML = data;
      result.username = data
    })
}

function callAPI(result) {
  log('loading (3/7) - callAPI')
  myContract.methods.callAPItoGetUserName().send({ from: result.wallet, value: web3.utils.toWei("0.01", "ether")}, (err, data) => {
    if (err) return console.error(err);
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