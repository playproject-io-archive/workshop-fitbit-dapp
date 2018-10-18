# README

<https://ipfs.io/ipfs/QmdKK319Veha83h6AYgQqhx9YRsJ9MJE7y33oCXyZ4MqHE>
<http://docs.python-requests.org/en/master/api/>

```
import "github.com/Arachnid/solidity-stringutils/strings.sol";
using strings for *;

string _query = "json(QmdKK319Veha83h6AYgQqhx9YRsJ9MJE7y33oCXyZ4MqHE).user.displayName";
string _method = "GET";
string _url = "https://api.fitbit.com/1/user/-/profile.json";
string _kwargs = strConcat(
			"{'headers': {'content-type': 'json', 'Authorization': 'Bearer ",
			_access_token,
			"'}}"
			);

bytes32 queryId = oraclize_query("computation",
            [ _query,
             _method,
             _url,
             _kwargs]
        );
```