// Auto-generated PayLoop Smart Contract ABIs and Bytecodes

export const CircleVaultArtifact = {
  abi: [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_contributionAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_cycleDuration",
        "type": "uint256"
      },
      {
        "internalType": "address[]",
        "name": "_admins",
        "type": "address[]"
      },
      {
        "internalType": "uint256",
        "name": "_requiredApprovals",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "member",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "cycleId",
        "type": "uint256"
      }
    ],
    "name": "Contributed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "creditScore",
        "type": "address"
      }
    ],
    "name": "CreditScoreSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "lendingPool",
        "type": "address"
      }
    ],
    "name": "LendingPoolSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "LoanDisbursed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "LoanRepaid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "loopToken",
        "type": "address"
      }
    ],
    "name": "LoopTokenSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "member",
        "type": "address"
      }
    ],
    "name": "MemberAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "member",
        "type": "address"
      }
    ],
    "name": "MemberRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "admin",
        "type": "address"
      }
    ],
    "name": "WithdrawalApproved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "WithdrawalExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "WithdrawalProposed",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_member",
        "type": "address"
      }
    ],
    "name": "addMember",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "admins",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      }
    ],
    "name": "approveWithdrawal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "contribute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "contributionAmount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "creditScore",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentCycleId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "cycleDuration",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address payable",
        "name": "_borrower",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "disburseLoan",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      }
    ],
    "name": "executeWithdrawal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAdmins",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMembers",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getProposalsCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasApproved",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isAdmin",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isMember",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "lastContributionCycle",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lendingPool",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "loopToken",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "members",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextDeadline",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "proposals",
    "outputs": [
      {
        "internalType": "address payable",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "reason",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "approvalCount",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "executed",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address payable",
        "name": "_recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_reason",
        "type": "string"
      }
    ],
    "name": "proposeWithdrawal",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_member",
        "type": "address"
      }
    ],
    "name": "removeMember",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_borrower",
        "type": "address"
      }
    ],
    "name": "repayLoan",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "requiredApprovals",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_creditScore",
        "type": "address"
      }
    ],
    "name": "setCreditScore",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_lendingPool",
        "type": "address"
      }
    ],
    "name": "setLendingPool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_loopToken",
        "type": "address"
      }
    ],
    "name": "setLoopToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "totalContributions",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
],
  bytecode: "0x60806040523480156200001157600080fd5b50604051620026d1380380620026d1833981016040819052620000349162000434565b33806200005c57604051631e4fbdf760e01b8152600060048201526024015b60405180910390fd5b6200006781620002fc565b506000825111620000cc5760405162461bcd60e51b815260206004820152602860248201527f436972636c655661756c743a206174206c65617374206f6e652061646d696e206044820152671c995c5d5a5c995960c21b606482015260840162000053565b600081118015620000de575081518111155b6200013c5760405162461bcd60e51b815260206004820152602760248201527f436972636c655661756c743a20696e76616c696420726571756972656420617060448201526670726f76616c7360c81b606482015260840162000053565b60016200014a8682620005bd565b50600284905560038390556200016183426200069f565b600455600c819055600160095560005b8251811015620002f0576000838281518110620001925762000192620006bb565b6020026020010151905060006001600160a01b0316816001600160a01b0316036200020b5760405162461bcd60e51b815260206004820152602260248201527f436972636c655661756c743a20696e76616c69642061646d696e206164647265604482015261737360f01b606482015260840162000053565b6001600160a01b0381166000908152600b602052604090205460ff1615620002765760405162461bcd60e51b815260206004820152601c60248201527f436972636c655661756c743a206475706c69636174652061646d696e00000000604482015260640162000053565b600a805460018181019092557fc65a7bb8d6351c1cf70c95a316cc6a92839c986682d98bc35f958f4883f9d2a80180546001600160a01b039093166001600160a01b0319909316831790556000918252600b6020526040909120805460ff1916909117905580620002e781620006d1565b91505062000171565b505050505050620006ed565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f191681016001600160401b03811182821017156200038d576200038d6200034c565b604052919050565b600082601f830112620003a757600080fd5b815160206001600160401b03821115620003c557620003c56200034c565b8160051b620003d682820162000362565b9283528481018201928281019087851115620003f157600080fd5b83870192505b84831015620004295782516001600160a01b0381168114620004195760008081fd5b82529183019190830190620003f7565b979650505050505050565b600080600080600060a086880312156200044d57600080fd5b85516001600160401b03808211156200046557600080fd5b818801915088601f8301126200047a57600080fd5b8151818111156200048f576200048f6200034c565b6020620004a5601f8301601f1916820162000362565b8281528b82848701011115620004ba57600080fd5b60005b83811015620004da578581018301518282018401528201620004bd565b50600082848301015280995050808a0151975050506040880151945060608801519150808211156200050b57600080fd5b506200051a8882890162000395565b925050608086015190509295509295909350565b600181811c908216806200054357607f821691505b6020821081036200056457634e487b7160e01b600052602260045260246000fd5b50919050565b601f821115620005b857600081815260208120601f850160051c81016020861015620005935750805b601f850160051c820191505b81811015620005b4578281556001016200059f565b5050505b505050565b81516001600160401b03811115620005d957620005d96200034c565b620005f181620005ea84546200052e565b846200056a565b602080601f831160018114620006295760008415620006105750858301515b600019600386901b1c1916600185901b178555620005b4565b600085815260208120601f198616915b828110156200065a5788860151825594840194600190910190840162000639565b5085821015620006795787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b634e487b7160e01b600052601160045260246000fd5b80820180821115620006b557620006b562000689565b92915050565b634e487b7160e01b600052603260045260246000fd5b600060018201620006e657620006e662000689565b5060010190565b611fd480620006fd6000396000f3fe6080604052600436106101fd5760003560e01c80635fa0b65f1161010d578063a230c524116100a0578063b22d62f31161006f578063b22d62f314610671578063ca6d56dc14610691578063d7bb99ba146106b1578063f2fde38b146106b9578063fae7aa75146106d957600080fd5b8063a230c524146105eb578063a59a99731461061b578063aaacdda01461063b578063aed5773d1461065157600080fd5b806398e527d3116100dc57806398e527d31461058b57806399c1aadc146105a05780639eab5253146105b65780639eceddea146105cb57600080fd5b80635fa0b65f14610515578063715018a61461052b5780637ed3deba146105405780638da5cb5b1461056d57600080fd5b80632358d5a81161019057806331ae450b1161015f57806331ae450b1461047d57806339da31521461049f578063435fa77c146104bf5780635bec4cb4146104df5780635daf08ca146104f557600080fd5b80632358d5a8146103c257806324d7806c1461040d57806324f13a761461043d5780632cdfb41d1461045d57600080fd5b8063113aa8b1116101cc578063113aa8b11461034157806314bfd6d014610361578063190ef1e61461039957806320517984146103ac57600080fd5b8063013cf08b1461028a57806301ad3fa6146102c457806306fdde03146102ff5780630b1ca49a1461032157600080fd5b36610285573360009081526006602052604090205460ff1615610283573360009081526007602052604081208054349290610239908490611a6f565b909155505060095460405133917ffa35a310d7113dddce1c275da946348e9aaebf9050b00b372033c4d84b0bd6eb9161027a91348252602082015260400190565b60405180910390a25b005b600080fd5b34801561029657600080fd5b506102aa6102a5366004611a88565b6106f9565b6040516102bb959493929190611ae7565b60405180910390f35b3480156102d057600080fd5b506102f16102df366004611b3c565b60086020526000908152604090205481565b6040519081526020016102bb565b34801561030b57600080fd5b506103146107d2565b6040516102bb9190611b60565b34801561032d57600080fd5b5061028361033c366004611b3c565b610860565b34801561034d57600080fd5b5061028361035c366004611b3c565b610a5e565b34801561036d57600080fd5b5061038161037c366004611a88565b610b18565b6040516001600160a01b0390911681526020016102bb565b6102836103a7366004611b3c565b610b42565b3480156103b857600080fd5b506102f160045481565b3480156103ce57600080fd5b506103fd6103dd366004611b73565b601160209081526000928352604080842090915290825290205460ff1681565b60405190151581526020016102bb565b34801561041957600080fd5b506103fd610428366004611b3c565b600b6020526000908152604090205460ff1681565b34801561044957600080fd5b50610283610458366004611a88565b610bb2565b34801561046957600080fd5b506102f1610478366004611ba3565b610dc5565b34801561048957600080fd5b5061049261103a565b6040516102bb9190611c2c565b3480156104ab57600080fd5b50600e54610381906001600160a01b031681565b3480156104cb57600080fd5b506102836104da366004611b3c565b61109c565b3480156104eb57600080fd5b506102f160035481565b34801561050157600080fd5b50610381610510366004611a88565b611156565b34801561052157600080fd5b506102f160025481565b34801561053757600080fd5b50610283611166565b34801561054c57600080fd5b506102f161055b366004611b3c565b60076020526000908152604090205481565b34801561057957600080fd5b506000546001600160a01b0316610381565b34801561059757600080fd5b506010546102f1565b3480156105ac57600080fd5b506102f1600c5481565b3480156105c257600080fd5b5061049261117a565b3480156105d757600080fd5b506102836105e6366004611a88565b6111da565b3480156105f757600080fd5b506103fd610606366004611b3c565b60066020526000908152604090205460ff1681565b34801561062757600080fd5b50600d54610381906001600160a01b031681565b34801561064757600080fd5b506102f160095481565b34801561065d57600080fd5b50600f54610381906001600160a01b031681565b34801561067d57600080fd5b5061028361068c366004611c79565b61138e565b34801561069d57600080fd5b506102836106ac366004611b3c565b61149f565b610283611625565b3480156106c557600080fd5b506102836106d4366004611b3c565b6118e6565b3480156106e557600080fd5b506102836106f4366004611b3c565b611924565b6010818154811061070957600080fd5b60009182526020909120600590910201805460018201546002830180546001600160a01b03909316945090929161073f90611ca5565b80601f016020809104026020016040519081016040528092919081815260200182805461076b90611ca5565b80156107b85780601f1061078d576101008083540402835291602001916107b8565b820191906000526020600020905b81548152906001019060200180831161079b57829003601f168201915b50505050600383015460049093015491929160ff16905085565b600180546107df90611ca5565b80601f016020809104026020016040519081016040528092919081815260200182805461080b90611ca5565b80156108585780601f1061082d57610100808354040283529160200191610858565b820191906000526020600020905b81548152906001019060200180831161083b57829003601f168201915b505050505081565b336000908152600b602052604090205460ff166108985760405162461bcd60e51b815260040161088f90611cdf565b60405180910390fd5b6001600160a01b03811660009081526006602052604090205460ff166109005760405162461bcd60e51b815260206004820152601960248201527f436972636c655661756c743a206e6f742061206d656d62657200000000000000604482015260640161088f565b6001600160a01b0381166000908152600660205260408120805460ff191690555b600554811015610a2657816001600160a01b03166005828154811061094857610948611d22565b6000918252602090912001546001600160a01b031603610a14576005805461097290600190611d38565b8154811061098257610982611d22565b600091825260209091200154600580546001600160a01b0390921691839081106109ae576109ae611d22565b9060005260206000200160006101000a8154816001600160a01b0302191690836001600160a01b0316021790555060058054806109ed576109ed611d4b565b600082815260209020810160001990810180546001600160a01b0319169055019055610a26565b80610a1e81611d61565b915050610921565b506040516001600160a01b038216907f6e76fb4c77256006d9c38ec7d82b45a8c8f3c27b1d6766fffc42dfb8de68449290600090a250565b610a666119dc565b6001600160a01b038116610ace5760405162461bcd60e51b815260206004820152602960248201527f436972636c655661756c743a20696e76616c6964206c656e64696e6720706f6f6044820152686c206164647265737360b81b606482015260840161088f565b600d80546001600160a01b0319166001600160a01b0383169081179091556040517f1222804283c650162c0f858b42dcc4564e940f0cc2b3f001bcd6af8aa00a2f3090600090a250565b600a8181548110610b2857600080fd5b6000918252602090912001546001600160a01b0316905081565b600d546001600160a01b03163314610b6c5760405162461bcd60e51b815260040161088f90611d7a565b806001600160a01b03167fc200a1f31dd659e356e0f112c82558e25f49f7b0f84438691cd96f5cb355882334604051610ba791815260200190565b60405180910390a250565b6010548110610c035760405162461bcd60e51b815260206004820181905260248201527f436972636c655661756c743a20696e76616c69642070726f706f73616c204944604482015260640161088f565b600060108281548110610c1857610c18611d22565b60009182526020909120600590910201600481015490915060ff1615610c505760405162461bcd60e51b815260040161088f90611dc4565b600c5481600301541015610cb85760405162461bcd60e51b815260206004820152602960248201527f436972636c655661756c743a20696e73756666696369656e742061646d696e20604482015268617070726f76616c7360b81b606482015260840161088f565b4781600101541115610d2a5760405162461bcd60e51b815260206004820152603560248201527f436972636c655661756c743a20696e73756666696369656e74207661756c74206044820152743130b630b731b2903337b91032bc32b1baba34b7b760591b606482015260840161088f565b60048101805460ff191660019081179091558154908201546040516001600160a01b039092169181156108fc0291906000818181858888f19350505050158015610d78573d6000803e3d6000fd5b50805460018201546040519081526001600160a01b039091169083907fd6cddb3d69146e96ebc2c87b1b3dd0b20ee2d3b0eadf134e011afb434a3e56e69060200160405180910390a35050565b336000908152600b602052604081205460ff16610df45760405162461bcd60e51b815260040161088f90611cdf565b6001600160a01b038516610e4a5760405162461bcd60e51b815260206004820152601e60248201527f436972636c655661756c743a20696e76616c696420726563697069656e740000604482015260640161088f565b47841115610eaa5760405162461bcd60e51b815260206004820152602760248201527f436972636c655661756c743a20696e73756666696369656e74207661756c742060448201526662616c616e636560c81b606482015260840161088f565b6000601080549050905060106040518060a00160405280886001600160a01b0316815260200187815260200186868080601f016020809104026020016040519081016040528093929190818152602001838380828437600092018290525093855250506001602080850182905260409485018490528654808301885596845292839020855160059097020180546001600160a01b0319166001600160a01b039097169690961786559184015191850191909155508101519091906002820190610f739082611e6f565b50606082015160038201556080909101516004909101805491151560ff199283161790556000828152601160209081526040808320338452909152908190208054909216600117909155516001600160a01b0387169082907fd85d4ce0c62bd7452b45d327c08a620e1c4064db16e998b43dceeac5ac6fc6b790610ffc90899089908990611f2f565b60405180910390a3604051339082907f7ab1df95613019ba98da0113a7adf5073c9fa62d93b5f202502115266aadc06a90600090a395945050505050565b6060600a80548060200260200160405190810160405280929190818152602001828054801561109257602002820191906000526020600020905b81546001600160a01b03168152600190910190602001808311611074575b5050505050905090565b6110a46119dc565b6001600160a01b03811661110c5760405162461bcd60e51b815260206004820152602960248201527f436972636c655661756c743a20696e76616c6964206372656469742073636f7260448201526865206164647265737360b81b606482015260840161088f565b600e80546001600160a01b0319166001600160a01b0383169081179091556040517fcf8682d10e5b6b8f31681b69dbc3021d2171ab654d500f7c8b53d49dd8afab9390600090a250565b60058181548110610b2857600080fd5b61116e6119dc565b6111786000611a09565b565b60606005805480602002602001604051908101604052809291908181526020018280548015611092576020028201919060005260206000209081546001600160a01b03168152600190910190602001808311611074575050505050905090565b336000908152600b602052604090205460ff166112095760405162461bcd60e51b815260040161088f90611cdf565b601054811061125a5760405162461bcd60e51b815260206004820181905260248201527f436972636c655661756c743a20696e76616c69642070726f706f73616c204944604482015260640161088f565b60006010828154811061126f5761126f611d22565b60009182526020909120600590910201600481015490915060ff16156112a75760405162461bcd60e51b815260040161088f90611dc4565b600082815260116020908152604080832033845290915290205460ff16156113255760405162461bcd60e51b815260206004820152602b60248201527f436972636c655661756c743a20616c726561647920617070726f76656420627960448201526a103a3434b99030b236b4b760a91b606482015260840161088f565b60038101805490600061133783611d61565b90915550506000828152601160209081526040808320338085529252808320805460ff1916600117905551909184917f7ab1df95613019ba98da0113a7adf5073c9fa62d93b5f202502115266aadc06a9190a35050565b600d546001600160a01b031633146113b85760405162461bcd60e51b815260040161088f90611d7a565b478111156114215760405162461bcd60e51b815260206004820152603060248201527f436972636c655661756c743a20696e73756666696369656e74207661756c742060448201526f3130b630b731b2903337b9103637b0b760811b606482015260840161088f565b6040516001600160a01b0383169082156108fc029083906000818181858888f19350505050158015611457573d6000803e3d6000fd5b50816001600160a01b03167fc31bb806fcba2c023d34eac91b760422818e0446743a8ea9759932f9282c3ead8260405161149391815260200190565b60405180910390a25050565b336000908152600b602052604090205460ff166114ce5760405162461bcd60e51b815260040161088f90611cdf565b6001600160a01b0381166115305760405162461bcd60e51b815260206004820152602360248201527f436972636c655661756c743a20696e76616c6964206d656d626572206164647260448201526265737360e81b606482015260840161088f565b6001600160a01b03811660009081526006602052604090205460ff16156115995760405162461bcd60e51b815260206004820152601d60248201527f436972636c655661756c743a20616c72656164792061206d656d626572000000604482015260640161088f565b6001600160a01b038116600081815260066020526040808220805460ff1916600190811790915560058054918201815583527f036b6384b5eca791c62761152d0c79bb0604c104a5fb6f4eb0703f3154bb3db00180546001600160a01b03191684179055517fb251eb052afc73ffd02ffe85ad79990a8b3fed60d76dbc2fa2fdd7123dffd9149190a250565b3360009081526006602052604090205460ff166116905760405162461bcd60e51b815260206004820152602360248201527f436972636c655661756c743a2063616c6c6572206973206e6f742061206d656d6044820152623132b960e91b606482015260840161088f565b6002543410156116f85760405162461bcd60e51b815260206004820152602d60248201527f436972636c655661756c743a20696e73756666696369656e7420636f6e74726960448201526c189d5d1a5bdb88185b5bdd5b9d609a1b606482015260840161088f565b600454600e54429190911115906001600160a01b03161561177957600e54604051631be1e6b760e11b815233600482015282151560248201526001600160a01b03909116906337c3cd6e90604401600060405180830381600087803b15801561176057600080fd5b505af1158015611774573d6000803e3d6000fd5b505050505b8080156117905750600f546001600160a01b031615155b1561180157600f546040516340c10f1960e01b8152336004820152678ac7230489e8000060248201526001600160a01b03909116906340c10f1990604401600060405180830381600087803b1580156117e857600080fd5b505af11580156117fc573d6000803e3d6000fd5b505050505b6004544211156118745760006003546004544261181e9190611d38565b6118289190611f65565b611833906001611a6f565b9050600354816118439190611f87565b600460008282546118549190611a6f565b92505081905550806009600082825461186d9190611a6f565b9091555050505b3360009081526007602052604081208054349290611893908490611a6f565b909155505060095433600081815260086020526040908190208390555190917ffa35a310d7113dddce1c275da946348e9aaebf9050b00b372033c4d84b0bd6eb91610ba791348252602082015260400190565b6118ee6119dc565b6001600160a01b03811661191857604051631e4fbdf760e01b81526000600482015260240161088f565b61192181611a09565b50565b61192c6119dc565b6001600160a01b0381166119925760405162461bcd60e51b815260206004820152602760248201527f436972636c655661756c743a20696e76616c6964206c6f6f7020746f6b656e206044820152666164647265737360c81b606482015260840161088f565b600f80546001600160a01b0319166001600160a01b0383169081179091556040517fb909ae7128148434cf18fc66cc50e9fb55ebc3092d66ab0ac5a540678607d09790600090a250565b6000546001600160a01b031633146111785760405163118cdaa760e01b815233600482015260240161088f565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b634e487b7160e01b600052601160045260246000fd5b80820180821115611a8257611a82611a59565b92915050565b600060208284031215611a9a57600080fd5b5035919050565b6000815180845260005b81811015611ac757602081850181015186830182015201611aab565b506000602082860101526020601f19601f83011685010191505092915050565b60018060a01b038616815284602082015260a060408201526000611b0e60a0830186611aa1565b6060830194909452509015156080909101529392505050565b6001600160a01b038116811461192157600080fd5b600060208284031215611b4e57600080fd5b8135611b5981611b27565b9392505050565b602081526000611b596020830184611aa1565b60008060408385031215611b8657600080fd5b823591506020830135611b9881611b27565b809150509250929050565b60008060008060608587031215611bb957600080fd5b8435611bc481611b27565b935060208501359250604085013567ffffffffffffffff80821115611be857600080fd5b818701915087601f830112611bfc57600080fd5b813581811115611c0b57600080fd5b886020828501011115611c1d57600080fd5b95989497505060200194505050565b6020808252825182820181905260009190848201906040850190845b81811015611c6d5783516001600160a01b031683529284019291840191600101611c48565b50909695505050505050565b60008060408385031215611c8c57600080fd5b8235611c9781611b27565b946020939093013593505050565b600181811c90821680611cb957607f821691505b602082108103611cd957634e487b7160e01b600052602260045260246000fd5b50919050565b60208082526023908201527f436972636c655661756c743a2063616c6c6572206973206e6f7420616e20616460408201526236b4b760e91b606082015260800190565b634e487b7160e01b600052603260045260246000fd5b81810381811115611a8257611a82611a59565b634e487b7160e01b600052603160045260246000fd5b600060018201611d7357611d73611a59565b5060010190565b6020808252602a908201527f436972636c655661756c743a2063616c6c6572206973206e6f7420746865204c604082015269195b991a5b99d41bdbdb60b21b606082015260800190565b60208082526026908201527f436972636c655661756c743a2070726f706f73616c20616c72656164792065786040820152651958dd5d195960d21b606082015260800190565b634e487b7160e01b600052604160045260246000fd5b601f821115611e6a57600081815260208120601f850160051c81016020861015611e475750805b601f850160051c820191505b81811015611e6657828155600101611e53565b5050505b505050565b815167ffffffffffffffff811115611e8957611e89611e0a565b611e9d81611e978454611ca5565b84611e20565b602080601f831160018114611ed25760008415611eba5750858301515b600019600386901b1c1916600185901b178555611e66565b600085815260208120601f198616915b82811015611f0157888601518255948401946001909101908401611ee2565b5085821015611f1f5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b83815260406020820152816040820152818360608301376000818301606090810191909152601f909201601f1916010192915050565b600082611f8257634e487b7160e01b600052601260045260246000fd5b500490565b8082028115828204841417611a8257611a82611a5956fea26469706673582212202b2f768db05bc45ef20a136f646cadf92c133c333b43b34d3fa007bda8c9133564736f6c63430008140033"
};

export const LendingPoolArtifact = {
  abi: [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_circleVault",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_creditScore",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      }
    ],
    "name": "LoanApproved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      }
    ],
    "name": "LoanDefaulted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "LoanDisbursed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountPaid",
        "type": "uint256"
      }
    ],
    "name": "LoanRepaid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "interestRate",
        "type": "uint256"
      }
    ],
    "name": "LoanRequested",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "support",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "currentVotesFor",
        "type": "uint256"
      }
    ],
    "name": "Voted",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "BASE_INTEREST_RATE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "circleVault",
    "outputs": [
      {
        "internalType": "contract ICircleVault",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "consensusThreshold",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "creditScore",
    "outputs": [
      {
        "internalType": "contract ICreditScore",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_loanId",
        "type": "uint256"
      }
    ],
    "name": "disburseLoan",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_loanId",
        "type": "uint256"
      }
    ],
    "name": "flagDefault",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getLoansCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasVoted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "loans",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "address payable",
        "name": "borrower",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "interestRate",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "duration",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "repaymentDeadline",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "votesFor",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "votesAgainst",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "repaid",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "requestedAt",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_loanId",
        "type": "uint256"
      }
    ],
    "name": "repayLoan",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_duration",
        "type": "uint256"
      }
    ],
    "name": "requestLoan",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_loanId",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "_support",
        "type": "bool"
      }
    ],
    "name": "voteOnLoan",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "votingPeriod",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
],
  bytecode: "0x60806040526203f48060055560326006553480156200001d57600080fd5b50604051620019b6380380620019b68339810160408190526200004091620001e0565b33806200006857604051631e4fbdf760e01b8152600060048201526024015b60405180910390fd5b620000738162000173565b506001600160a01b038216620000d75760405162461bcd60e51b815260206004820152602260248201527f4c656e64696e67506f6f6c3a20696e76616c6964207661756c74206164647265604482015261737360f01b60648201526084016200005f565b6001600160a01b038116620001415760405162461bcd60e51b815260206004820152602960248201527f4c656e64696e67506f6f6c3a20696e76616c6964206372656469742073636f7260448201526865206164647265737360b81b60648201526084016200005f565b600180546001600160a01b039384166001600160a01b0319918216179091556002805492909316911617905562000218565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b80516001600160a01b0381168114620001db57600080fd5b919050565b60008060408385031215620001f457600080fd5b620001ff83620001c3565b91506200020f60208401620001c3565b90509250929050565b61178e80620002286000396000f3fe6080604052600436106100f35760003560e01c80638da5cb5b1161008a578063c19d37c911610059578063c19d37c914610297578063e1ec3c68146102b7578063f2fde38b1461033e578063f9b0b5b91461035e57600080fd5b80638da5cb5b14610226578063aa452fa614610244578063ab7b1c8914610264578063b73e4da01461027757600080fd5b806339da3152116100c657806339da31521461016e57806343859632146101a65780635274793e146101f1578063715018a61461021157600080fd5b806302a251a3146100f85780630c97200a146101215780630d8cb2ff1461013657806331488c7f1461014c575b600080fd5b34801561010457600080fd5b5061010e60055481565b6040519081526020015b60405180910390f35b34801561012d57600080fd5b5060035461010e565b34801561014257600080fd5b5061010e6103e881565b34801561015857600080fd5b5061016c610167366004611444565b610374565b005b34801561017a57600080fd5b5060025461018e906001600160a01b031681565b6040516001600160a01b039091168152602001610118565b3480156101b257600080fd5b506101e16101c1366004611489565b600460209081526000928352604080842090915290825290205460ff1681565b6040519015158152602001610118565b3480156101fd57600080fd5b5060015461018e906001600160a01b031681565b34801561021d57600080fd5b5061016c6107d7565b34801561023257600080fd5b506000546001600160a01b031661018e565b34801561025057600080fd5b5061016c61025f3660046114ae565b6107eb565b61016c6102723660046114d0565b610bb2565b34801561028357600080fd5b5061016c6102923660046114d0565b610ee9565b3480156102a357600080fd5b5061016c6102b23660046114d0565b611110565b3480156102c357600080fd5b506102d76102d23660046114d0565b6112f6565b604080519c8d526001600160a01b03909b1660208d0152998b019890985260608a0196909652608089019490945260a088019290925260c087015260e086015215156101008501521515610120840152151561014083015261016082015261018001610118565b34801561034a57600080fd5b5061016c6103593660046114e9565b61137b565b34801561036a57600080fd5b5061010e60065481565b60015460405163288c314960e21b81523360048201526001600160a01b039091169063a230c52490602401602060405180830381865afa1580156103bc573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103e0919061150d565b6104055760405162461bcd60e51b81526004016103fc9061152a565b60405180910390fd5b60035482106104265760405162461bcd60e51b81526004016103fc90611573565b60006003838154811061043b5761043b6115aa565b60009182526020909120600a90910201600881015490915060ff166104b25760405162461bcd60e51b815260206004820152602760248201527f4c656e64696e67506f6f6c3a206c6f616e2072657175657374206973206e6f746044820152662061637469766560c81b60648201526084016103fc565b6008810154610100900460ff161561051a5760405162461bcd60e51b815260206004820152602560248201527f4c656e64696e67506f6f6c3a206c6f616e20697320616c7265616479206170706044820152641c9bdd995960da1b60648201526084016103fc565b600554816009015461052c91906115d6565b4211156105875760405162461bcd60e51b8152602060048201526024808201527f4c656e64696e67506f6f6c3a20766f74696e6720706572696f642068617320656044820152631b99195960e21b60648201526084016103fc565b600083815260046020908152604080832033845290915290205460ff16156105ff5760405162461bcd60e51b815260206004820152602560248201527f4c656e64696e67506f6f6c3a206d656d6265722068617320616c7265616479206044820152641d9bdd195960da1b60648201526084016103fc565b60008381526004602090815260408083203384529091529020805460ff1916600117905581156106455760068101805490600061063b836115ef565b919050555061065d565b600781018054906000610657836115ef565b91905055505b60068101546040805184151581526020810192909252339185917f7c2de587c00d75474a0c6c6fa96fd3b45dc974cd4e8a75f712bb84c950dce1b5910160405180910390a360015460408051639eab525360e01b815290516000926001600160a01b031691639eab525391600480830192869291908290030181865afa1580156106eb573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610713919081019061162e565b80519091508061076f5760405162461bcd60e51b815260206004820152602160248201527f4c656e64696e67506f6f6c3a207661756c7420686173206e6f206d656d6265726044820152607360f81b60648201526084016103fc565b600654818460060154606461078491906116f3565b61078e919061170a565b106107d05760088301805461ff00191661010017905560405185907f073e754af3e7d644af8000094f3c23bc20ef9c40cc057bffa060b0230adf00f490600090a25b5050505050565b6107df6113b9565b6107e960006113e6565b565b60015460405163288c314960e21b81523360048201526001600160a01b039091169063a230c52490602401602060405180830381865afa158015610833573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610857919061150d565b6108735760405162461bcd60e51b81526004016103fc9061152a565b600082116108d65760405162461bcd60e51b815260206004820152602a60248201527f4c656e64696e67506f6f6c3a20616d6f756e74206d75737420626520677265616044820152690746572207468616e20360b41b60648201526084016103fc565b6000811161093b5760405162461bcd60e51b815260206004820152602c60248201527f4c656e64696e67506f6f6c3a206475726174696f6e206d75737420626520677260448201526b06561746572207468616e20360a41b60648201526084016103fc565b60025460405163d3dd2bdf60e01b81523360048201526000916001600160a01b03169063d3dd2bdf90602401602060405180830381865afa158015610984573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109a8919061172c565b90506103e861032082106109bf57506101f46109df565b61025882106109d157506102bc6109df565b61019082106109df57506103525b600060038054905090506003604051806101800160405280838152602001336001600160a01b031681526020018781526020018481526020018681526020016000815260200160008152602001600081526020016001151581526020016000151581526020016000151581526020014281525090806001815401808255809150506001900390600052602060002090600a02016000909190919091506000820151816000015560208201518160010160006101000a8154816001600160a01b0302191690836001600160a01b0316021790555060408201518160020155606082015181600301556080820151816004015560a0820151816005015560c0820151816006015560e082015181600701556101008201518160080160006101000a81548160ff0219169083151502179055506101208201518160080160016101000a81548160ff0219169083151502179055506101408201518160080160026101000a81548160ff02191690831515021790555061016082015181600901555050336001600160a01b0316817f68595dbe887ae7f496f2c88735019a8918919a1decfdee6bdb460480ab87decb8785604051610ba3929190918252602082015260400190565b60405180910390a35050505050565b6003548110610bd35760405162461bcd60e51b81526004016103fc90611573565b600060038281548110610be857610be86115aa565b60009182526020909120600a90910201600881015490915060ff168015610c1857506008810154610100900460ff165b610c7f5760405162461bcd60e51b815260206004820152603260248201527f4c656e64696e67506f6f6c3a206c6f616e206973206e6f7420696e206163746960448201527176652072657061796d656e7420737461746560701b60648201526084016103fc565b600881015462010000900460ff1615610cda5760405162461bcd60e51b815260206004820181905260248201527f4c656e64696e67506f6f6c3a206c6f616e20616c72656164792072657061696460448201526064016103fc565b600061271082600301548360020154610cf391906116f3565b610cfd919061170a565b90506000818360020154610d1191906115d6565b905080341015610d765760405162461bcd60e51b815260206004820152602a60248201527f4c656e64696e67506f6f6c3a20696e73756666696369656e742072657061796d604482015269195b9d08185b5bdd5b9d60b21b60648201526084016103fc565b60088301805462ff00ff1916620100001790556001805490840154604051630c8778f360e11b81526001600160a01b03918216600482015291169063190ef1e69034906024016000604051808303818588803b158015610dd557600080fd5b505af1158015610de9573d6000803e3d6000fd5b5050505060058401546002546001860154604051600162af76e760e01b031981526001600160a01b039182166004820152429390931115602484018190529350169063ff50891990604401600060405180830381600087803b158015610e4e57600080fd5b505af1158015610e62573d6000803e3d6000fd5b5050505081341115610ea657336108fc610e7c8434611745565b6040518115909202916000818181858888f19350505050158015610ea4573d6000803e3d6000fd5b505b60018401546040518381526001600160a01b039091169086907f512d3e65b3e58c2187bb1872aa435dba5bd09c1c03823ba56ab70aac411e4a2190602001610ba3565b6003548110610f0a5760405162461bcd60e51b81526004016103fc90611573565b600060038281548110610f1f57610f1f6115aa565b90600052602060002090600a020190508060080160019054906101000a900460ff16610f975760405162461bcd60e51b815260206004820152602160248201527f4c656e64696e67506f6f6c3a206c6f616e206973206e6f7420617070726f76656044820152601960fa1b60648201526084016103fc565b600881015460ff16610feb5760405162461bcd60e51b815260206004820152601f60248201527f4c656e64696e67506f6f6c3a206c6f616e206973206e6f74206163746976650060448201526064016103fc565b60058101541561103d5760405162461bcd60e51b815260206004820152601e60248201527f4c656e64696e67506f6f6c3a20616c726561647920646973627572736564000060448201526064016103fc565b600481015461104c90426115d6565b60058201556001805490820154600283015460405163b22d62f360e01b81526001600160a01b039283166004820152602481019190915291169063b22d62f390604401600060405180830381600087803b1580156110a957600080fd5b505af11580156110bd573d6000803e3d6000fd5b50505050600181015460028201546040519081526001600160a01b039091169083907f0ceeb4503a2fe0b51298a0af21358f3d89e7eab3f65ae2a7835859c3e2c516049060200160405180910390a35050565b60035481106111315760405162461bcd60e51b81526004016103fc90611573565b600060038281548110611146576111466115aa565b60009182526020909120600a90910201600881015490915060ff16801561117657506008810154610100900460ff165b801561118d5750600881015462010000900460ff16155b6111e85760405162461bcd60e51b815260206004820152602660248201527f4c656e64696e67506f6f6c3a206c6f616e206e6f7420696e206163746976652060448201526573746174757360d01b60648201526084016103fc565b806005015442116112475760405162461bcd60e51b8152602060048201526024808201527f4c656e64696e67506f6f6c3a20646561646c696e65206e6f74207965742070616044820152631cdcd95960e21b60648201526084016103fc565b60088101805460ff19169055600254600182015460405163124d1ffd60e31b81526001600160a01b039182166004820152911690639268ffe890602401600060405180830381600087803b15801561129e57600080fd5b505af11580156112b2573d6000803e3d6000fd5b50505060018201546040516001600160a01b03909116915083907f13b88e6866f0156d706fecfa22b678de5fc2b749c1d2307f6f47eb541385f1ec90600090a35050565b6003818154811061130657600080fd5b60009182526020909120600a909102018054600182015460028301546003840154600485015460058601546006870154600788015460088901546009909901549799506001600160a01b0390961697949693959294919390929160ff808216926101008304821692620100009004909116908c565b6113836113b9565b6001600160a01b0381166113ad57604051631e4fbdf760e01b8152600060048201526024016103fc565b6113b6816113e6565b50565b6000546001600160a01b031633146107e95760405163118cdaa760e01b81523360048201526024016103fc565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b80151581146113b657600080fd5b6000806040838503121561145757600080fd5b82359150602083013561146981611436565b809150509250929050565b6001600160a01b03811681146113b657600080fd5b6000806040838503121561149c57600080fd5b82359150602083013561146981611474565b600080604083850312156114c157600080fd5b50508035926020909101359150565b6000602082840312156114e257600080fd5b5035919050565b6000602082840312156114fb57600080fd5b813561150681611474565b9392505050565b60006020828403121561151f57600080fd5b815161150681611436565b60208082526029908201527f4c656e64696e67506f6f6c3a2063616c6c6572206973206e6f7420612063686160408201526836b09036b2b6b132b960b91b606082015260800190565b6020808252601c908201527f4c656e64696e67506f6f6c3a20696e76616c6964206c6f616e20494400000000604082015260600190565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b808201808211156115e9576115e96115c0565b92915050565b600060018201611601576116016115c0565b5060010190565b634e487b7160e01b600052604160045260246000fd5b805161162981611474565b919050565b6000602080838503121561164157600080fd5b825167ffffffffffffffff8082111561165957600080fd5b818501915085601f83011261166d57600080fd5b81518181111561167f5761167f611608565b8060051b604051601f19603f830116810181811085821117156116a4576116a4611608565b6040529182528482019250838101850191888311156116c257600080fd5b938501935b828510156116e7576116d88561161e565b845293850193928501926116c7565b98975050505050505050565b80820281158282048414176115e9576115e96115c0565b60008261172757634e487b7160e01b600052601260045260246000fd5b500490565b60006020828403121561173e57600080fd5b5051919050565b818103818111156115e9576115e96115c056fea26469706673582212201486c55edcd7f7f1d7e6330807bc5e21d2a56dd07de5eb978bcf96a23de99f1e64736f6c63430008140033"
};

export const CreditScoreArtifact = {
  abi: [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "caller",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "status",
        "type": "bool"
      }
    ],
    "name": "CallerAuthorized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newScore",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "changeType",
        "type": "string"
      }
    ],
    "name": "ScoreUpdated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DEFAULT_SCORE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_SCORE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MIN_SCORE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getCreditScore",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isAuthorizedCaller",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "_onTime",
        "type": "bool"
      }
    ],
    "name": "recordContribution",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "recordLoanDefault",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "_onTime",
        "type": "bool"
      }
    ],
    "name": "recordLoanRepayment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_caller",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "_status",
        "type": "bool"
      }
    ],
    "name": "setAuthorizedCaller",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
],
  bytecode: "0x608060405234801561001057600080fd5b50338061003757604051631e4fbdf760e01b81526000600482015260240160405180910390fd5b61004081610060565b50336000908152600260205260409020805460ff191660011790556100b0565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6108bb806100bf6000396000f3fe608060405234801561001057600080fd5b50600436106100b45760003560e01c80638da5cb5b116100715780638da5cb5b146101405780639268ffe81461015b578063d3dd2bdf1461016e578063df65e9e414610181578063f2fde38b1461018a578063ff5089191461019d57600080fd5b806327ff6223146100b957806337c3cd6e146100d557806340b89270146100ea578063454bbd29146100f257806359d14b4114610105578063715018a614610138575b600080fd5b6100c26103e881565b6040519081526020015b60405180910390f35b6100e86100e3366004610751565b6101b0565b005b6100c2606481565b6100e8610100366004610751565b610274565b61012861011336600461078d565b60026020526000908152604090205460ff1681565b60405190151581526020016100cc565b6100e861033d565b6000546040516001600160a01b0390911681526020016100cc565b6100e861016936600461078d565b610351565b6100c261017c36600461078d565b6103c8565b6100c26101f481565b6100e861019836600461078d565b61045a565b6100e86101ab366004610751565b610495565b3360009081526002602052604090205460ff16806101d857506000546001600160a01b031633145b6101fd5760405162461bcd60e51b81526004016101f4906107a8565b60405180910390fd5b801561023f5761023b82600a60405180604001604052806014815260200173434f4e545249425554494f4e5f4f4e5f54494d4560601b815250610546565b5050565b61023b82601460405180604001604052806011815260200170434f4e545249425554494f4e5f4c41544560781b815250610601565b61027c6106b8565b6001600160a01b0382166102de5760405162461bcd60e51b815260206004820152602360248201527f43726564697453636f72653a20696e76616c69642063616c6c6572206164647260448201526265737360e81b60648201526084016101f4565b6001600160a01b038216600081815260026020908152604091829020805460ff191685151590811790915591519182527f100c9fd652c7b273c9266f92f22ac2352eb8d7232013ac0439e9066a9227f369910160405180910390a25050565b6103456106b8565b61034f60006106e5565b565b3360009081526002602052604090205460ff168061037957506000546001600160a01b031633145b6103955760405162461bcd60e51b81526004016101f4906107a8565b6103c58160646040518060400160405280600c81526020016b1313d05397d111519055531560a21b815250610601565b50565b60006001600160a01b03821661042a5760405162461bcd60e51b815260206004820152602160248201527f43726564697453636f72653a20696e76616c69642075736572206164647265736044820152607360f81b60648201526084016101f4565b6001600160a01b038216600090815260016020526040902054801561044f5780610453565b6101f45b9392505050565b6104626106b8565b6001600160a01b03811661048c57604051631e4fbdf760e01b8152600060048201526024016101f4565b6103c5816106e5565b3360009081526002602052604090205460ff16806104bd57506000546001600160a01b031633145b6104d95760405162461bcd60e51b81526004016101f4906107a8565b80156105165761023b82600f604051806040016040528060138152602001724c4f414e5f5245504149445f4f4e5f54494d4560681b815250610546565b61023b8260056040518060400160405280601081526020016f4c4f414e5f5245504149445f4c41544560801b8152505b6001600160a01b03831660009081526001602052604081205415610582576001600160a01b038416600090815260016020526040902054610586565b6101f45b905060006105948483610803565b90506103e88111156105a557506103e85b6001600160a01b03851660008181526001602052604090819020839055517f2b535fbf4d2281f734a35408583a14d4e2b28653b00d761613e8758399dd6e6d906105f2908490879061081c565b60405180910390a25050505050565b6001600160a01b0383166000908152600160205260408120541561063d576001600160a01b038416600090815260016020526040902054610641565b6101f45b9050600083821161065357606461065d565b61065d8483610872565b905060648110156105a5575060646001600160a01b03851660008181526001602052604090819020839055517f2b535fbf4d2281f734a35408583a14d4e2b28653b00d761613e8758399dd6e6d906105f2908490879061081c565b6000546001600160a01b0316331461034f5760405163118cdaa760e01b81523360048201526024016101f4565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b80356001600160a01b038116811461074c57600080fd5b919050565b6000806040838503121561076457600080fd5b61076d83610735565b91506020830135801515811461078257600080fd5b809150509250929050565b60006020828403121561079f57600080fd5b61045382610735565b60208082526025908201527f43726564697453636f72653a2063616c6c6572206973206e6f7420617574686f6040820152641c9a5e995960da1b606082015260800190565b634e487b7160e01b600052601160045260246000fd5b80820180821115610816576108166107ed565b92915050565b82815260006020604081840152835180604085015260005b8181101561085057858101830151858201606001528201610834565b506000606082860101526060601f19601f830116850101925050509392505050565b81810381811115610816576108166107ed56fea26469706673582212206dbe8a9fa9f7f051cb628a770784348f4619ef264d055dd22c18782143406c1a64736f6c63430008140033"
};

export const LoopTokenArtifact = {
  abi: [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "allowance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientAllowance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientBalance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidApprover",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSpender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "minter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "status",
        "type": "bool"
      }
    ],
    "name": "MinterSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isMinter",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_minter",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "_status",
        "type": "bool"
      }
    ],
    "name": "setMinter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
],
  bytecode: "0x60806040523480156200001157600080fd5b50336040518060400160405280600a8152602001694c6f6f70506f696e747360b01b8152506040518060400160405280600481526020016304c4f4f560e41b815250816003908162000064919062000362565b50600462000073828262000362565b5050506001600160a01b038116620000a657604051631e4fbdf760e01b8152600060048201526024015b60405180910390fd5b620000b181620000fa565b50620000da33620000c56012600a62000543565b620000d490620f42406200055b565b6200014c565b336000908152600660205260409020805460ff191660011790556200058b565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b6001600160a01b038216620001785760405163ec442f0560e01b8152600060048201526024016200009d565b62000186600083836200018a565b5050565b6001600160a01b038316620001b9578060026000828254620001ad919062000575565b909155506200022d9050565b6001600160a01b038316600090815260208190526040902054818110156200020e5760405163391434e360e21b81526001600160a01b038516600482015260248101829052604481018390526064016200009d565b6001600160a01b03841660009081526020819052604090209082900390555b6001600160a01b0382166200024b576002805482900390556200026a565b6001600160a01b03821660009081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051620002b091815260200190565b60405180910390a3505050565b634e487b7160e01b600052604160045260246000fd5b600181811c90821680620002e857607f821691505b6020821081036200030957634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200035d57600081815260208120601f850160051c81016020861015620003385750805b601f850160051c820191505b81811015620003595782815560010162000344565b5050505b505050565b81516001600160401b038111156200037e576200037e620002bd565b62000396816200038f8454620002d3565b846200030f565b602080601f831160018114620003ce5760008415620003b55750858301515b600019600386901b1c1916600185901b17855562000359565b600085815260208120601f198616915b82811015620003ff57888601518255948401946001909101908401620003de565b50858210156200041e5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b634e487b7160e01b600052601160045260246000fd5b600181815b80851115620004855781600019048211156200046957620004696200042e565b808516156200047757918102915b93841c939080029062000449565b509250929050565b6000826200049e575060016200053d565b81620004ad575060006200053d565b8160018114620004c65760028114620004d157620004f1565b60019150506200053d565b60ff841115620004e557620004e56200042e565b50506001821b6200053d565b5060208310610133831016604e8410600b841016171562000516575081810a6200053d565b62000522838362000444565b80600019048211156200053957620005396200042e565b0290505b92915050565b60006200055460ff8416836200048d565b9392505050565b80820281158282048414176200053d576200053d6200042e565b808201808211156200053d576200053d6200042e565b610afc806200059b6000396000f3fe608060405234801561001057600080fd5b50600436106100f55760003560e01c8063715018a611610097578063aa271e1a11610066578063aa271e1a146101eb578063cf456ae71461020e578063dd62ed3e14610221578063f2fde38b1461025a57600080fd5b8063715018a6146101ad5780638da5cb5b146101b557806395d89b41146101d0578063a9059cbb146101d857600080fd5b806323b872dd116100d357806323b872dd1461014d578063313ce5671461016057806340c10f191461016f57806370a082311461018457600080fd5b806306fdde03146100fa578063095ea7b31461011857806318160ddd1461013b575b600080fd5b61010261026d565b60405161010f919061090a565b60405180910390f35b61012b610126366004610974565b6102ff565b604051901515815260200161010f565b6002545b60405190815260200161010f565b61012b61015b36600461099e565b610319565b6040516012815260200161010f565b61018261017d366004610974565b61033d565b005b61013f6101923660046109da565b6001600160a01b031660009081526020819052604090205490565b610182610430565b6005546040516001600160a01b03909116815260200161010f565b610102610444565b61012b6101e6366004610974565b610453565b61012b6101f93660046109da565b60066020526000908152604090205460ff1681565b61018261021c3660046109fc565b610461565b61013f61022f366004610a38565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b6101826102683660046109da565b610528565b60606003805461027c90610a6b565b80601f01602080910402602001604051908101604052809291908181526020018280546102a890610a6b565b80156102f55780601f106102ca576101008083540402835291602001916102f5565b820191906000526020600020905b8154815290600101906020018083116102d857829003601f168201915b5050505050905090565b60003361030d818585610566565b60019150505b92915050565b600033610327858285610578565b6103328585856105f7565b506001949350505050565b3360009081526006602052604090205460ff168061036557506005546001600160a01b031633145b6103c05760405162461bcd60e51b815260206004820152602160248201527f4c6f6f70546f6b656e3a2063616c6c6572206973206e6f742061206d696e74656044820152603960f91b60648201526084015b60405180910390fd5b6001600160a01b0382166104225760405162461bcd60e51b8152602060048201526024808201527f4c6f6f70546f6b656e3a20696e76616c696420726563697069656e74206164646044820152637265737360e01b60648201526084016103b7565b61042c8282610656565b5050565b61043861068c565b61044260006106b9565b565b60606004805461027c90610a6b565b60003361030d8185856105f7565b61046961068c565b6001600160a01b0382166104c95760405162461bcd60e51b815260206004820152602160248201527f4c6f6f70546f6b656e3a20696e76616c6964206d696e746572206164647265736044820152607360f81b60648201526084016103b7565b6001600160a01b038216600081815260066020908152604091829020805460ff191685151590811790915591519182527f583b0aa0e528532caf4b907c11d7a8158a122fe2a6fb80cd9b09776ebea8d92d910160405180910390a25050565b61053061068c565b6001600160a01b03811661055a57604051631e4fbdf760e01b8152600060048201526024016103b7565b610563816106b9565b50565b610573838383600161070b565b505050565b6001600160a01b038381166000908152600160209081526040808320938616835292905220546000198110156105f157818110156105e257604051637dc7a0d960e11b81526001600160a01b038416600482015260248101829052604481018390526064016103b7565b6105f18484848403600061070b565b50505050565b6001600160a01b03831661062157604051634b637e8f60e11b8152600060048201526024016103b7565b6001600160a01b03821661064b5760405163ec442f0560e01b8152600060048201526024016103b7565b6105738383836107e0565b6001600160a01b0382166106805760405163ec442f0560e01b8152600060048201526024016103b7565b61042c600083836107e0565b6005546001600160a01b031633146104425760405163118cdaa760e01b81523360048201526024016103b7565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b6001600160a01b0384166107355760405163e602df0560e01b8152600060048201526024016103b7565b6001600160a01b03831661075f57604051634a1406b160e11b8152600060048201526024016103b7565b6001600160a01b03808516600090815260016020908152604080832093871683529290522082905580156105f157826001600160a01b0316846001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040516107d291815260200190565b60405180910390a350505050565b6001600160a01b03831661080b5780600260008282546108009190610aa5565b9091555061087d9050565b6001600160a01b0383166000908152602081905260409020548181101561085e5760405163391434e360e21b81526001600160a01b038516600482015260248101829052604481018390526064016103b7565b6001600160a01b03841660009081526020819052604090209082900390555b6001600160a01b038216610899576002805482900390556108b8565b6001600160a01b03821660009081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516108fd91815260200190565b60405180910390a3505050565b600060208083528351808285015260005b818110156109375785810183015185820160400152820161091b565b506000604082860101526040601f19601f8301168501019250505092915050565b80356001600160a01b038116811461096f57600080fd5b919050565b6000806040838503121561098757600080fd5b61099083610958565b946020939093013593505050565b6000806000606084860312156109b357600080fd5b6109bc84610958565b92506109ca60208501610958565b9150604084013590509250925092565b6000602082840312156109ec57600080fd5b6109f582610958565b9392505050565b60008060408385031215610a0f57600080fd5b610a1883610958565b915060208301358015158114610a2d57600080fd5b809150509250929050565b60008060408385031215610a4b57600080fd5b610a5483610958565b9150610a6260208401610958565b90509250929050565b600181811c90821680610a7f57607f821691505b602082108103610a9f57634e487b7160e01b600052602260045260246000fd5b50919050565b8082018082111561031357634e487b7160e01b600052601160045260246000fdfea26469706673582212201554b470948acaed4dedfb022785b407cc0814815180fcf65f898f7073ce6a3064736f6c63430008140033"
};
