var Chainlist = artifacts.require('./ChainList.sol');

//test suite
contract('Chainlist', function(accounts){

    var chainListInstance;
    var seller = accounts[1];
    var buyer = accounts[2];  
    var articleName = "Article 1";
    var articleDescription = "Description 1";
    var articlePrice = 10;

    it('should throw an exception if you buy but no sales', function() {

        return Chainlist.deployed().then(function(instance) {
            chainListInstance = instance;
            return chainListInstance.buyArticle(1, { 
                from: buyer,
                value: web3.toWei(articlePrice, "ether")
            })
        }).then(assert.fail)
        .catch(function(err, data) {
            assert(true);
        }).then(function() {
            return chainListInstance.getNumberOfArticles();
        }).then(function(data){
            assert.equal(data.toNumber(), 0, "Number of articles must be 0");
        });
    });

    //buy an article that does not exist
    it('should throw an exception if you try to buy an article that does not exist', function() {
        return Chainlist.deployed().then(function(instance){
            chainListInstance = instance;
            return chainListInstance.sellArticle(
                articleName, articleDescription, web3.toWei(articlePrice, "ether"),
                {from: seller}
            );
        }).then(function(receipt){
            return chainListInstance.buyArticle(2, { 
                from: buyer,
                value: web3.toWei(articlePrice, "ether")
            })
        }).then(assert.fail)
        .catch(function(err,data){
            assert(true);
        }).then(function() {
            return chainListInstance.articles(1);
        }).then(function(data) {
            assert.equal(data[0], 1, "Article ID must be 1");
            assert.equal(data[1], seller, "Seller must be " + seller);
            assert.equal(data[2], 0x0, "Buyer must be 0x0");
            assert.equal(data[3], articleName, "articleName must be " + articleName);
            assert.equal(data[4], articleDescription, "articleDescription must be " + articleDescription);
            assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "Price should be " + web3.toWei(articlePrice, "ether"));
        });
    });

    it('should throw an exception if you try to buy your own article', function(){
        return Chainlist.deployed().then(function(instance){
            chainListInstance = instance;
            return chainListInstance.buyArticle(1, { 
                from: seller,
                value: web3.toWei(articlePrice, "ether")
            })
        }).then(assert.fail)
        .catch(function(err, data) {
            assert(true);
        }).then(function() {
            return chainListInstance.articles(1);
        }).then(function(data){
            assert.equal(data[0], 1, "Article ID must be 1");
            assert.equal(data[1], seller, "Seller must be " + seller);
            assert.equal(data[2], 0x0, "Buyer must be 0x0");
            assert.equal(data[3], articleName, "articleName must be " + articleName);
            assert.equal(data[4], articleDescription, "articleDescription must be " + articleDescription);
            assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "Price should be " + web3.toWei(articlePrice, "ether")); 
        });
    });

    it('should throw an exception if you try to buy an article for a value different from its price', function(){
        return Chainlist.deployed().then(function(instance){
            chainListInstance = instance;
            return chainListInstance.buyArticle(1, { 
                from: buyer,
                value: web3.toWei(articlePrice + 1, "ether")
            })
        }).then(assert.fail)
        .catch(function(err, data) {
            assert(true);
        }).then(function() {
            return chainListInstance.articles(1);
        }).then(function(data){
            assert.equal(data[0], 1, "Article ID must be 1");
            assert.equal(data[1], seller, "Seller must be " + seller);
            assert.equal(data[2], 0x0, "Buyer must be 0x0");
            assert.equal(data[3], articleName, "articleName must be " + articleName);
            assert.equal(data[4], articleDescription, "articleDescription must be " + articleDescription);
            assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "Price should be " + web3.toWei(articlePrice, "ether")); 
        });
    });

    it('should throw an exception if you try to buy an article that was already been sold', function(){
        return Chainlist.deployed().then(function(instance){
            chainListInstance = instance;
            return chainListInstance.buyArticle(1, { 
                from: buyer,
                value: web3.toWei(articlePrice, "ether")
            })
        }).then(function() {
            return chainListInstance.buyArticle(1, { 
                from: web3.eth.accounts[0],
                value: web3.toWei(articlePrice, "ether")
            })
        }).then(assert.fail)
        .catch(function(err, data) {
            assert(true);
        }).then(function() {
            return chainListInstance.articles(1);
        }).then(function(data){
            assert.equal(data[0], 1, "Article ID must be 1");
            assert.equal(data[1], seller, "Seller must be " + seller);
            assert.equal(data[2], buyer, "Buyer must be " + buyer);
            assert.equal(data[3], articleName, "articleName must be " + articleName);
            assert.equal(data[4], articleDescription, "articleDescription must be " + articleDescription);
            assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "Price should be " + web3.toWei(articlePrice, "ether")); 
        });
    });
});