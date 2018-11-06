# First dapp

```js
const bel = require('bel')
const csjs = require('csjs-inject')

var ABI = require('./abi.json'); // @TODO: ABI of relevant contract
var Web3 = require('web3');

if (typeof web3 !== 'undefined') {
  console.log('=== injected web');
  web3 = new Web3(web3.currentProvider);
} else {
  console.log('=== ethereum node running on localhost');
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

var contractAddress = "0xed7e9d57efe6ee00114a311dae07bb1692999458";
myContract = new web3.eth.Contract(ABI, contractAddress);
var methodName = 'getData' // @TODO: contract method name to execute
var args = [] // @TODO: all arguments to pass to contract method parameters

myContract.methods[methodName](...args).call((err, data) => {
  if (err) return console.error(err);
  console.log(data);
})
```
