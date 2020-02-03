/**
 * http://usejsdoc.org/
 */
const Client = require('bitcoin-core');
const fs = require('fs');
const airdropConfig = require("./airdrop.json");
var properties = require ("properties");

var fromBlock = 1;
var addressMap= {};
var negativeTxids = [];
var toBlock = 1000000;
var client = new Client(airdropConfig.connection);


var getNodeBalance = function(ip, port) {
	var nodeCient = new Client({
		"host" : ip,
		"port" : port,
		"network" : "mainnet",
		"timeout" : 1000,
		"username" : "abbc",
		"password" : "00db5d466a2aa11c9e8da4b6b0c4f8d703698a223ad9e91bad8a28b34b819fa1"
	});
	nodeCient.command("getbalance").then(balance => {
		console.log(balance);
	}).catch(e => {
		console.log(e);
	});
}

getNodeBalance("localhost", "10821");

var readLastStop = function(cb) {
	fs.readFile('last_stop.txt', function read(err, data) {
	    if (err) {
	        cb(null, 0);
	    } else if(isNaN(data)){
	    	 cb(data + " is not a number", null);
	    } else {
	    	cb(null, Number(data));
	    }
	});
}

var writeTxFile = function(txMap, cb) {
	properties.stringify(txMap, {path : "txids.properties"}, function(err, result) {
		if (err) throw err;
		console.log('tx Data written to txids.properties file');
	});
}

var readAddressAndSend = function(startAddressIndex, client, cb) {
	fs.readFile(airdropConfig.address_file, async function read(err, data) {
	    if (err) {
	        throw cb(err, null);
	    }
	    content = data.toString().split("\n");
	    var txidAddressMap = {};
	    var sendCount = 0;
	    for(var index in content) {
	    	if(index < startAddressIndex) continue;
	    	try {
		    	var address = content[index];
		    	var txid = await client.command("transfer", airdropConfig.asset_name, airdropConfig.amount_per_address, address);
		    	txidAddressMap[address]=txid[0];
		    	console.log("%s=%s", address, txid[0]);
		    	sendCount++;
		    	if(sendCount === airdropConfig.send_wait_cout) {
		    		var confirmation = 0;
		    		while(!confirmation) {
			    		var waitTill = new Date(new Date().getTime() + 10000);
						while(waitTill > new Date()){}
						var transDetail = await client.command("gettransaction", txid[0]);
						confirmation = transDetail.confirmations;
						console.log("waiting for transaction to confirm: %s=%s", txid[0], confirmation);
					}
					sendCount = 0;
		    	}
	    	} catch(err) {
	    		writeTxFile(txidAddressMap, ()=>{});
	    		return cb(err, index);
	    	}
	    }
	    writeTxFile(txidAddressMap, ()=>{});
	    cb(null, index);
	});
}

//readLastStop((err, lastStop) => {
//	if(err) {
//		throw err;
//	}
//	readAddressAndSend(lastStop, client, (err, count) => {
//		if(err) {
//			console.log(err);
//		}
//		fs.writeFile("last_stop.txt", count + "", function(err) {
//			if(err) throw err;
//			console.log('last stop index %s written to last_stop.txt file', count);
//		});
//	});
//});
	
	

