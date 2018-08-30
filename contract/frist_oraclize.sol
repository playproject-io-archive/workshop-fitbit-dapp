pragma solidity ^0.4.0;

import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";


contract ExampleContract is usingOraclize {

    string public name;

    event NewOraclizeQuery(string description);
    
    event NewMessage(string message);

    function ExampleContract() public {
        
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