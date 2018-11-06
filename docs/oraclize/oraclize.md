# Oraclize

### Official Resources
* [Remix - Solidity IDE](https://remix.oraclize.it/#plugintitle=Oraclize&pluginurl=https://remix-plugin.oraclize.it)
* [oraclize/ethereum-examples](https://github.com/oraclize/ethereum-examples/tree/master/solidity)
* [Tutorial - Getting started with Oraclize on Ethereum - YouTube](https://www.youtube.com/watch?v=v2Skr_m0J2E&feature=youtu.be)
* [oraclize/ethereum-api - gitter](https://gitter.im/oraclize/ethereum-api)
* [Oraclize Documentation](http://docs.oraclize.it/#general-concepts-query)
* [UrlRequests.sol](https://github.com/oraclize/ethereum-examples/blob/master/solidity/computation-datasource/url-requests/UrlRequests.sol#L43-L51)
* [Oraclize - the provably honest oracle service](http://app.oraclize.it/service/monitor)
* [oraclize/docs - Pricing](https://github.com/oraclize/docs/blob/master/source/includes/_pricing.md)

### Article

* [Query fee too high on mainnet](https://github.com/oraclize/ethereum-api/issues/10)
* [Estimate Gas when using Oraclize - Code intoxicated](https://cristian.io/post/estimate-gas/)
* [Using APIs in Your Ethereum Smart Contract with Oraclize](https://medium.com/coinmonks/using-apis-in-your-ethereum-smart-contract-with-oraclize-95656434292e)
* [Oracle系列一: Human Oracle – Taipei Ethereum Meetup – Medium](https://medium.com/taipei-ethereum-meetup/oracle%E7%B3%BB%E5%88%97%E4%B8%80-human-oracle-cb7ed8268030)
* [johnhckuo/Oraclize-Tutorial](https://github.com/johnhckuo/Oraclize-Tutorial)
* [【区块链】使用Oraclize让智能合约调用外部数据 - CSDN博客](https://blog.csdn.net/ns2250225/article/details/80498838)

### Example Usage

**example 1**
```
pragma solidity ^0.4.0;
import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

contract ExampleContract is usingOraclize {
    string public name;
    event NewOraclizeQuery(string description);
    event NewMessage(string message);
    function ExampleContract() public {
        /// initialization
    }
    function __callback(bytes32 myid, string _result) public {
        if (msg.sender != oraclize_cbAddress()) revert();
        name = _result;
        NewOraclizeQuery(_result);
        NewMessage(_result);
    }
    function callAPItoGetUserName() public payable {
        NewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
        oraclize_query("URL", "json(https://jsonplaceholder.typicode.com/users/1).name");
    }
}
```

**example 2**
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

### ethereum-bridge

Independent bridge to link any Ethereum network with the Oraclize engine

* [oraclize/ethereum-bridge](https://github.com/oraclize/ethereum-bridge)

```
npm i ethereum-bridge -g
ethereum-bridge -a 9 -H 127.0.0.1 -p 8545 --dev

// or

git clone https://github.com/oraclize/ethereum-bridge
node bridge -H localhost:8545 -a 9 --dev
```


### Encrypted Queries

https://docs.oraclize.it/#ethereum-advanced-topics-encrypted-queries

```
curl https://api.oraclize.it/v1/utils/encryption/encrypt -X POST -H "Content-Type: application/json" --data '{"message": "ENCRYPTED MESSAGE"}'
```

```
{"result": "BMZRD5bjqUc8LBHWZ5o8T7OMkTZ+OpWhgdHkI3yk5PkjSOJ6ZQpTQvdGQbiZlotPZDO9XVlF0A6Q0kelAealMILqQtu5Es6KEBgNbihYmDOMpOetVjUNeWxKx5+Rc5lTy+I=", "success": true}
```

```
curl https://api.oraclize.it/v1/utils/encryption/decrypt -X POST -H "Content-Type: application/json" --data '{"message": "BK9Wn0pfCkawzl4IQLTEbo0NJkgUsnE1nrDmw0mtWl2hWRDgekclBlgc3eUaTF2OvnaCIvWNm+lAgusGRnVttf+TqQiFiJAtk5yZU2UU2jTNdd5I82T3/WyCPJvqiwnE51Q="}'
```

```
{"success": true}
```

#### other example

```
curl https://api.oraclize.it/v1/utils/encryption/encrypt -X POST -H "Content-Type: application/json" --data '{"message":"json(https://api.postcodes.io/postcodes).status"}'

curl https://api.oraclize.it/v1/utils/encryption/encrypt -X POST -H "Content-Type: application/json" --data '{"message" : "[\"OX49 5NU\", \"M32 0JG\", \"NE30 1DP\"]"}'
```

### Mise

* [Best Hex to String Converter Online to Convert Hex to Text (Hexadecimal to Text)](https://codebeautify.org/hex-string-converter)
* oraclize_setProof
* ProofShield
