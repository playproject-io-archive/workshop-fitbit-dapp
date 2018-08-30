pragma solidity ^0.4.0;

import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";
import "github.com/Arachnid/solidity-stringutils/strings.sol";

contract ExampleContract is usingOraclize {

    using strings for *;

    modifier noEther { if (msg.value > 0) throw; _; }
	modifier onlyOwner { if (msg.sender != owner) throw; _; }
	modifier onlyOraclize {	if (msg.sender != oraclize_cbAddress()) throw; _; }
    
    uint constant oraclizeGas = 500000000;

    mapping (bytes32 => oraclizeCallback) public oraclizeCallbacks;

    enum OraclizeState { ForGetUserName, ForGetUserSteps }

    event NewOraclizeQuery(string tag, string description);
    
    event OraclizeQueryId(string methodName, bytes32 queryId);

    event LOG_OraclizeCallbackName(
		string userId,
		bytes32 queryId,
		string name,
		bytes proof
	);
	
	event LOG_OraclizeCallbackStep(
		string userId,
		bytes32 queryId,
		uint step,
		bytes proof
	);
	
	struct Sponsor {
	    string name;
	    uint amount;
	}
	
    struct oraclizeCallback {
        string userId;
        OraclizeState oState;
    }
    
    address public owner;

    function ExampleContract()  {
        // OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);
        oraclize_setCustomGasPrice(4000000000);
        oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
        owner = msg.sender;
    }

    function __callback(bytes32 _queryId, string _result, bytes _proof) onlyOraclize {
        NewOraclizeQuery("__callback:", _result);
        oraclizeCallback memory o = oraclizeCallbacks[_queryId];
 
        if (o.oState == OraclizeState.ForGetUserName) {
            LOG_OraclizeCallbackName(o.userId, _queryId, _result, _proof);
            callback_ForGetUserName(o.userId, _queryId, _result, _proof);
		} else {
		    LOG_OraclizeCallbackStep(o.userId, _queryId, parseInt(_result), _proof);
            callback_ForGetUserStep(o.userId, _queryId, _result, _proof);
        }
    }

    function callback_ForGetUserName(string _userId, bytes32 _queryId, string _result, bytes _proof) {
        oraclizeCallback memory o = oraclizeCallbacks[_queryId];
    }
    
    function callback_ForGetUserStep(string _userId, bytes32 _queryId, string _result, bytes _proof) {
        oraclizeCallback memory o = oraclizeCallbacks[_queryId];
    }
    
    function request(string _query, string _method, string _url, string _kwargs, string _userId, OraclizeState state) payable {

        bytes32 queryId = oraclize_query("computation",
            [_query,
            _method,
            _url,
            _kwargs]
        );
        
        OraclizeQueryId("request:", queryId);
        
        oraclizeCallbacks[queryId] = oraclizeCallback(_userId, state);
    }
    
    function requestProfile(string _access_token, string _userId) payable {
        string memory header = strConcat(
			"{'headers': {'content-type': 'json', 'Authorization': 'Bearer ",
			_access_token,
			"'}}"
			);
		NewOraclizeQuery("requestProfile:", header);
        
        request("json(QmdKK319Veha83h6AYgQqhx9YRsJ9MJE7y33oCXyZ4MqHE).user.displayName",
                "GET",
                "https://api.fitbit.com/1/user/-/profile.json",
                header,
                _userId,
                OraclizeState.ForGetUserName);
    }
    
    function requestActivities(string _access_token, string _userId) payable {
        string memory header = strConcat(
			"{'headers': {'content-type': 'json', 'Authorization': 'Bearer ",
			_access_token,
			"'}}"
			);
		NewOraclizeQuery("requestActivities:", header);
        
        request("json(QmdKK319Veha83h6AYgQqhx9YRsJ9MJE7y33oCXyZ4MqHE).lifetime.total.steps",
                "GET",
                "https://api.fitbit.com/1/user/-/activities.json",
                header,
                _userId,
                OraclizeState.ForGetUserSteps);
    }

    function test() public pure returns (string) {
        return "test";
    }

}