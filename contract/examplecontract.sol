pragma solidity ^0.4.0;

import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";


contract ExampleContract is usingOraclize {

    uint public userId;

    event NewOraclizeQuery(string description);

    function ExampleContract() public {
        update();
    }

    function __callback(bytes32 myid, string result) public {
        if (msg.sender != oraclize_cbAddress()) revert();
        NewOraclizeQuery(result);
        userId = parseInt(result, 10);
    }

    function update() public payable {
        NewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
        oraclize_query("URL", "json(https://jsonplaceholder.typicode.com/todos/1).userId");
    }
}