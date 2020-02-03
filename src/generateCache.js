/**
 * http://usejsdoc.org/
 */
const Client = require('bitcoin-core');
const fs = require('fs');
var properties = require ("properties");

var fromBlock = 1;
var addressMap= {};
var negativeTxids = [];
var toBlock = 1000000;
var client = new Client(require("./airdrop.json"));

var readAddress = function(cb) {
	fs.readFile('addresses.txt', function read(err, data) {
	    if (err) {
	        throw err;
	    }
	    content = data.toString().split("\n");
	    for(var index in content) {
	    	var address = content[index];
	    	addressMap[address] = true;
	    	console.log(address);
	    }
	    cb();
	});
}

var run = async function() {
	var callsSize = 0;
	for(var i=fromBlock; i <= toBlock; i++) {
		try {
		var blockHash = await client.command("getblockhash", i);
		var block = await client.command("getblock", blockHash, true);
		//var prevHash = block.previousblockhash ? block.previousblockhash : "0000000000000000000000000000000000000000000000000000000000000000";
		//var cacheKey = prevHash + "-" + block.version +"-" +block.nonce + "-" + parseInt(block.bits, 16);
		//var cacheValue = block.hash + "-" + block.height;
		var rawTransRequest =[];
		callsSize+= block.tx.length + 2;
		for (var txIndex in block.tx) {
			var tx = block.tx[txIndex];
			rawTransRequest.push({
				method: "getrawtransaction",
				parameters : [tx, true]
			});
		}
		var transactions = await client.command(rawTransRequest);
		for(var transIndex in transactions) {
			var trans = transactions[transIndex];
			if(!trans.vout) {
				continue;
			}
			for(var index in trans.vout) {
				if(!trans.vout[index].scriptPubKey || !trans.vout[index].scriptPubKey.addresses) {
					continue;
				}
				var addresses = trans.vout[index].scriptPubKey.addresses;
				for(var ai in addresses) {
					if(!addressMap[addresses[ai]]) {
						addressMap[addresses[ai]] = true;
						console.log("block=%s, address=%s", i, addresses[ai]);
					}
				}
			}
		}
		if(callsSize >= 1000) {
			var waitTill = new Date(new Date().getTime() + 10000);
			while(waitTill > new Date()){}
			callsSize=0
		}
		} catch(err) {
			console.log("Process stop at block %s with %s tx because of error %O", i,  block.tx.length, err);
			break;
		}
	}
	var addrString = JSON.stringify(Object.keys(addressMap));
	addrString  = addrString.replace(/\"/g, "");
	addrString  = addrString.replace(/\,/g, "\n");
	addrString  = addrString.replace("[", "");
	addrString  = addrString.replace("]", "");
	fs.writeFile("addresses.txt", addrString, function(err) {
		if(err) throw err;
		console.log('Data written to addresses.txt file');
	});
}
readAddress(() => {
	run();
});
