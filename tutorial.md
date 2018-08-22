# Tutorial

### via oraclize get data

```
pragma solidity ^0.4.0;
import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

contract KrakenPriceTicker is usingOraclize {

    string public ETHXBT;
    uint constant CUSTOM_GASLIMIT = 150000;

    event LogConstructorInitiated(string nextStep);
    event newOraclizeQuery(string description);
    event newKrakenPriceTicker(string price);


    function KrakenPriceTicker() {
        oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
        LogConstructorInitiated("Constructor was initiated. Call 'update()' to send the Oraclize Query.");
    }

    function __callback(bytes32 myid, string result, bytes proof) {
        if (msg.sender != oraclize_cbAddress()) revert();
        ETHXBT = result;
        newKrakenPriceTicker(ETHXBT);
    }

    function update() payable {
        if (oraclize_getPrice("URL", CUSTOM_GASLIMIT) > this.balance) {
            newOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
            newOraclizeQuery("Oraclize query was sent, standing by for the answer..");
            oraclize_query("URL", "json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0", CUSTOM_GASLIMIT);
        }
    }
}
```

### First dapp

```
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

 myContract.methods.name().call((err, data) => {
    if (err) return console.error(err);
    console.log(data);
  })
```