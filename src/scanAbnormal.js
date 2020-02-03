/**
 * http://usejsdoc.org/
 */
const Client = require('bitcoin-core');
const fs = require('fs');
var properties = require ("properties");
var client = new Client({
	host : "192.168.1.201",
	port : "23023",
	network : "mainnet",
	timeout : 30000,
	username : "rtmrpc",
	password : "rtmpassword"
});
var fromBlock = 109699;
var addresses = {};
var toBlock = 118531;
var run = async function() {
	for(var i=fromBlock; i <= toBlock; i++) {
		var blockHash = await client.command("getblockhash", i);
		var block = await client.command("getblock", blockHash, true);
		var prevHash = block.previousblockhash ? block.previousblockhash : "0000000000000000000000000000000000000000000000000000000000000000";
		var cacheKey = prevHash + "-" + block.version +"-" +block.nonce + "-" + parseInt(block.bits, 16);
		var cacheValue = block.hash + "-" + block.height;
		var tx = block.tx[0];
		var trans = await client.command("getrawtransaction", tx, true);
		var address = trans.vout[0].scriptPubKey.addresses[0];
		addresses[address] = 1;
		console.log("block=%d, address=", i, address);
		var waitTill = new Date(new Date().getTime() + 100);
		while(waitTill > new Date()){}
	//		if(i === toBlock) {
	//			toBlock = await client.command("getblockcount");
	//		}
	}
	var addrArray = Object.keys(addresses);
	console.log("-------------------------------------------------------------------");
	for(var j=0; j<7; j++) {
		var index = Math.floor((Math.random() * addrArray.length));
		console.log(addrArray[index]);
	}
	console.log("--------------------------luck-----------------------------------------");
	for(var j=0; j<5; j++) {
		var index = Math.floor((Math.random() * addrArray.length));
		console.log(addrArray[index]);
	}
	properties.stringify(addresses, {path : "addresses.properties"}, function(err, result) {
		if (err) throw err;
		console.log('Data written to file');
	});
}
run();
