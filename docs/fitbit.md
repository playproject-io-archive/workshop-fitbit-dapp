# fitbit

* [Fitbit Development: Using OAuth 2.0](https://dev.fitbit.com/build/reference/web-api/oauth2/)
* [create Fitbit app account](https://dev.fitbit.com/apps/new)
  * choose client app
* [Fitbit Apps](https://dev.fitbit.com/apps)
* [Swagger UI](https://dev.fitbit.com/build/reference/web-api/explore/)

### example

* [jeremiahlee/fitbit-web-demo](https://github.com/jeremiahlee/fitbit-web-demo/blob/master/boot.js)
* [thegameofcode/passport-fitbit-oauth2](https://github.com/thegameofcode/passport-fitbit-oauth2)


### helper tools
* [URL Encoder &amp; Decoder - Free Online Text Conversion](http://www.togglecase.com/url_encode_decode)
* [ngrok - secure introspectable tunnels to localhost](https://ngrok.com/)
```
ngrok http 9966
```

### Example Contract
```js
var fitbitAccessToken;
var CLIENT_ID = '22CYSG';
var EXPIRES_IN = 31536000;

if (!window.location.hash) {
  window.location.replace(`https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=https%3A%2F%2Falincode.github.io%2Fdevon4&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=${EXPIRES_IN}`);
} else {
  var fragmentQueryParameters = {};
  window.location.hash.slice(1).replace(
    new RegExp("([^?=&]+)(=([^&]*))?", "g"),
    function ($0, $1, $2, $3) { fragmentQueryParameters[$1] = $3; }
  );

  fitbitAccessToken = fragmentQueryParameters.access_token;
  document.body.innerHTML = fragmentQueryParameters;
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

var getProfile = function(profile) {
  console.log(profile.user.age);
  return profile;
}

fetch(
  'https://api.fitbit.com/1/user/-/profile.json',
  {
    headers: new Headers({
      'Authorization': 'Bearer ' + fitbitAccessToken
    }),
    mode: 'cors',
    method: 'GET'
  }
).then(processResponse)
  .then(getProfile)
  .catch(function (error) {
    console.error(error);
  });
```

### Example Data for `https://api.fitbit.com/1/user/-/activities.json`
```
[{
    "anonymous": false,
    "inputs": [{
        "indexed": false,
        "name": "tag",
        "type": "string"
      },
      {
        "indexed": false,
        "name": "condition",
        "type": "bool"
      }
    ],
    "name": "LOG",
    "type": "event"
  },
  {
    "constant": false,
    "inputs": [{
        "name": "myid",
        "type": "bytes32"
      },
      {
        "name": "result",
        "type": "string"
      }
    ],
    "name": "__callback",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{
        "name": "_queryId",
        "type": "bytes32"
      },
      {
        "name": "_result",
        "type": "string"
      },
      {
        "name": "_proof",
        "type": "bytes"
      }
    ],
    "name": "__callback",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "award",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "contestDone",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{
      "name": "_name",
      "type": "string"
    }],
    "name": "fund",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [{
        "indexed": false,
        "name": "userId",
        "type": "string"
      },
      {
        "indexed": false,
        "name": "queryId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "step",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "proof",
        "type": "bytes"
      }
    ],
    "name": "LOG_OraclizeCallbackStep",
    "type": "event"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "playerRefund",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{
        "name": "_query",
        "type": "string"
      },
      {
        "name": "_method",
        "type": "string"
      },
      {
        "name": "_url",
        "type": "string"
      },
      {
        "name": "_encryptHeader",
        "type": "string"
      },
      {
        "name": "_userId",
        "type": "string"
      }
    ],
    "name": "request",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{
        "name": "_encryptHeader",
        "type": "string"
      },
      {
        "name": "_userId",
        "type": "string"
      }
    ],
    "name": "requestActivities",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{
        "name": "_encryptHeader",
        "type": "string"
      },
      {
        "name": "_userId",
        "type": "string"
      }
    ],
    "name": "signup",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "updateAllUserStep",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getAllFunders",
    "outputs": [{
      "name": "",
      "type": "address[]"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getBalance",
    "outputs": [{
      "name": "amount",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{
      "name": "addr",
      "type": "address"
    }],
    "name": "getBeginStep",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{
      "name": "addr",
      "type": "address"
    }],
    "name": "getContestStep",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{
      "name": "addr",
      "type": "address"
    }],
    "name": "getEndStep",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{
      "name": "addr",
      "type": "address"
    }],
    "name": "getFunder",
    "outputs": [{
        "name": "",
        "type": "string"
      },
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getFunders",
    "outputs": [{
        "name": "",
        "type": "string[]"
      },
      {
        "name": "",
        "type": "uint256[]"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getFundersOfAmount",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getNumFunders",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getNumPlayers",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getPlayersOfAmount",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getStatus",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getTotalAmount",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getWinnerWithdrawalAmount",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "isAvailableRefund",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "isOnTime",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{
      "name": "addr",
      "type": "address"
    }],
    "name": "isOwner",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{
      "name": "addr",
      "type": "address"
    }],
    "name": "isSigned",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "owner",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
]
```
