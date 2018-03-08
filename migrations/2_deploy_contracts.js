var chainlist = artifacts.require('./ChainList.sol');

module.exports = function(deployer) {
    deployer.deploy(chainlist);
}