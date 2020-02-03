const Bitcore = require('bitcore-lib');
var script = Bitcore.Script.fromBuffer("6a0e3132333435363738393031323334353637383930313233343536901234567890");
console.log(script.isDataOut());
console.log(script.getData().toString());