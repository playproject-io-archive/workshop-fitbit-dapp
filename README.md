# devon4

* [Oraclize Documentation](https://docs.oraclize.it/#ethereum-quick-start-simple-query)
* [oraclize/ethereum-examples](https://github.com/oraclize/ethereum-examples/)
* [Remix error : The constructor should be payable if you send value](https://ethereum.stackexchange.com/questions/35112/remix-error-the-constructor-should-be-payable-if-you-send-value?rq=1)

## Run it

```
npm i
npm start
```

## build & publish

```sh
npm run build
git add -A && git commit -m "bundle"
git push
```

## Flow

* winners
* funders
* players
* fundersOfAmount
* playersOfAmount
* NumPlayers
* numFunders

### Player

* sign()

```
struct Player {
  address addr;
  uint amount;
  string userId;
  uint createdAt;
  uint beginStep;
  uint endStep;
  bool withdrew;
}
```

* playerWithdrawal(): player check is winner.

### Funder

* fund(): it could fund many times, not only one.

```
struct Funder {
    address addr;
    uint amount;
    uint createdAt;
    string name;
    // string url;
}
```

### Admin

* done()
  * calculatorWinners
  * playersWithdrawal
