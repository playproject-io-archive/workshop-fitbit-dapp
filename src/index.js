const bel = require('bel')
const csjs = require('csjs-inject')

var ABI = require('./abi.json');
var Web3 = require('web3');

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

var contractAddress = "0x692a70d2e424a56d2c6c27aa97d1a86395877b3a";
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

/******************************************************************************
  START
******************************************************************************/
function start(event) {
  localStorage.ignorePrompt = true
  document.body.innerHTML = ''
  getMyAddress({
    user: null
  }) // => Step 1
}
/******************************************************************************
  Step 1
******************************************************************************/
function getMyAddress(result) {
  log(null, 'loading (1/7) - getMyAddress')
  web3.eth.getAccounts((err, localAddresses) => {
    if (err) return done(err)
    result.wallet = localAddresses[0]
    callAPI(result) // => Step 2
  })
}
/******************************************************************************
  Step 2
******************************************************************************/
function callAPI(result) {
  log(null, 'loading (2/7) - callAPI')
  console.dir(myContract);
  myContract.methods.test().call({ from: result.wallet }, (err, data) => {
    if (err) return console.error(err);
    console.log('data:', data);
    result.user = data
  })
}

/******************************************************************************
  DONE
******************************************************************************/
function done(err, result) {
  if (err) return log(new Error(err))
  const { user } = result
  if (user) {
    log(null, 'success')
    // var el = dapp(result)
    // document.body.appendChild(el)
  } else log(new Error('fail'))
}