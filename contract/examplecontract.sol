pragma solidity ^0.4.0;

import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";
import "github.com/Arachnid/solidity-stringutils/strings.sol";

contract ExampleContract is usingOraclize {

    using strings for *;

    modifier noEther { if (msg.value > 0) throw; _; }
	modifier onlyOwner { if (msg.sender != owner) throw; _; }
	modifier onlyOraclize {	if (msg.sender != oraclize_cbAddress()) throw; _; }
    
    uint constant oraclizeGas = 500000000;

    string constant oraclize_UsersBaseUrl =
		"json(https://jsonplaceholder.typicode.com/users/";

    string public result;

    mapping (bytes32 => oraclizeCallback) public oraclizeCallbacks;
    mapping (uint => string) public names;

    enum oraclizeState { ForGetUserName, ForGetUserOtherData }

    event NewOraclizeQuery(string order, string description);

    event LOG_OraclizeCallback(
		uint userId,
		bytes32 queryId,
		string result,
		bytes proof
	);
	
    struct oraclizeCallback {
        uint userId;
        oraclizeState oState;
    }
    
    address public owner;


    function ExampleContract() public {
        oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
        owner = msg.sender;
    }

    function __callback(bytes32 _queryId, string _result, bytes _proof) onlyOraclize {
        NewOraclizeQuery("1-2", _result);
        result = _result;
        oraclizeCallback memory o = oraclizeCallbacks[_queryId];
        LOG_OraclizeCallback(o.userId, _queryId, _result, _proof);

        if (o.oState == oraclizeState.ForGetUserName) {
            callback_ForGetUserName(o.userId, _result, _proof);
		} else {
            callback_ForGetUserOtherData(_queryId, _result, _proof);
        }
    }

    function callback_ForGetUserName(uint _userId, string _result, bytes _proof) {
        names[_userId] = _result;
    }

    function callback_ForGetUserOtherData(bytes32 _queryId, string _result, bytes _proof) internal {
        oraclizeCallback memory o = oraclizeCallbacks[_queryId];
		uint userId = o.userId;
    }
    
    function register(string _userId) public payable {
        string memory oraclize_url = strConcat(
			oraclize_UsersBaseUrl,
			_userId,
			").name"
			);
			
        NewOraclizeQuery("1-1", "Oraclize query was sent, standing by for the answer..");
        // bytes32 queryId = oraclize_query("URL", oraclize_url, oraclizeGas);
        bytes32 queryId = oraclize_query("URL", oraclize_url);
        oraclizeCallbacks[queryId] = oraclizeCallback(parseInt(_userId), oraclizeState.ForGetUserName);
    }
    
    function getName(string _userId) view returns (string) {
        return names[parseInt(_userId)];
    }

    function test() public pure returns (string) {
        return "test";
    }

}