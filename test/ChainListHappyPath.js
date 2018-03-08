var Chainlist = artifacts.require('./ChainList.sol');

//test suite
contract('Chainlist', function(accounts){

    var chainListInstance;
    var seller = accounts[1];
    var buyer = accounts[2];
    var articleName1 = "Article 1";
    var articleDescription1 = "Description 1";
    var articlePrice1 = 10;
    var articleName2 = "Article 2";
    var articleDescription2 = "Description 2";
    var articlePrice2 = 20;
    var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
    var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

    it('should be initialized with empty values', function(){
        return Chainlist.deployed().then(function(instance){
            chainListInstance = instance;
            return chainListInstance.getNumberOfArticles();
        }).then(function(data){
            assert.equal(data.toNumber(), 0, "Number of articles must be empty 0");
            return chainListInstance.getArticlesForSale();
        }).then(function(data) {
            assert.equal(data.length, 0, "There shouldn't be any article for sale");
        });
    });

    it('should sell a first article', function(){
        return Chainlist.deployed().then(function(instance){
            chainListInstance = instance;
            return chainListInstance.sellArticle(
                articleName1, articleDescription1, web3.toWei(articlePrice1, "ether"),
                {from: seller}
            )
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, "One event should have been triggered");
            assert.equal(receipt.logs[0].event, 'LogSellArticle', "Event should be LogSellArticle");
            assert.equal(receipt.logs[0].args._id.toNumber(), 1, "ID should be 1");
            assert.equal(receipt.logs[0].args._seller, seller, "Seller should be " + seller);
            assert.equal(receipt.logs[0].args._name, articleName1, "ArticleName should be " + articleName1);
            assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "Price should be " + web3.toWei(articlePrice1, "ether"));
            return chainListInstance.getNumberOfArticles();
        }).then(function(data){
            assert.equal(data.toNumber(), 1, "Number of articles must be 1");
            return chainListInstance.getArticlesForSale();
        }).then(function(data){
            assert.equal(data.length, 1, "Number of articles for sale must be 1");
            assert.equal(data[0].toNumber(), 1, "article ID must be 1");
            return chainListInstance.articles(data[0]);
        }).then(function(data){
            assert.equal(data[0], 1, "Article ID must be 1");
            assert.equal(data[1], seller, "Seller must be " + seller);
            assert.equal(data[2], 0x0, "Buyer must be 0x0");
            assert.equal(data[3], articleName1, "articleName1 must be " + articleName1);
            assert.equal(data[4], articleDescription1, "articleDescription1 must be " + articleDescription1);
            assert.equal(data[5].toNumber(), web3.toWei(articlePrice1, "ether"), "Price should be " + web3.toWei(articlePrice1, "ether"));
        });
    });

    it('should sell a second article', function(){
        return Chainlist.deployed().then(function(instance){
            chainListInstance = instance;
            return chainListInstance.sellArticle(
                articleName2, articleDescription2, web3.toWei(articlePrice2, "ether"),
                {from: seller}
            )
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, "One event should have been triggered");
            assert.equal(receipt.logs[0].event, 'LogSellArticle', "Event should be LogSellArticle");
            assert.equal(receipt.logs[0].args._id.toNumber(), 2, "ID should be 2");
            assert.equal(receipt.logs[0].args._seller, seller, "Seller should be " + seller);
            assert.equal(receipt.logs[0].args._name, articleName2, "ArticleName2 should be " + articleName2);
            assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice2, "ether"), "Price2 should be " + web3.toWei(articlePrice2, "ether"));
            return chainListInstance.getNumberOfArticles();
        }).then(function(data){
            assert.equal(data.toNumber(), 2, "Number of articles must be 2");
            return chainListInstance.getArticlesForSale();
        }).then(function(data){
            assert.equal(data.length, 2, "Number of articles for sale must be 2");
            assert.equal(data[1].toNumber(), 2, "article ID must be 2");
            return chainListInstance.articles(data[1]);
        }).then(function(data){
            assert.equal(data[0], 2, "Article ID must be 2");
            assert.equal(data[1], seller, "Seller must be " + seller);
            assert.equal(data[2], 0x0, "Buyer must be 0x0");
            assert.equal(data[3], articleName2, "articleName2 must be " + articleName2);
            assert.equal(data[4], articleDescription2, "articleDescription2 must be " + articleDescription2);
            assert.equal(data[5].toNumber(), web3.toWei(articlePrice2, "ether"), "Price2 should be " + web3.toWei(articlePrice2, "ether"));
        });
    });

    it('should buy an article', function() {
        return Chainlist.deployed().then(function(instance){
            chainListInstance = instance;
            //save balance before buy
            sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
            buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();
            return chainListInstance.buyArticle(1, {
                from: buyer, 
                value: web3.toWei(articlePrice1, "ether")})
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, "One event should have been triggered");
            assert.equal(receipt.logs[0].event, 'LogBuyArticle', "Event should be LogBuyArticle");
            assert.equal(receipt.logs[0].args._id, 1, "Article ID must be one");
            assert.equal(receipt.logs[0].args._seller, seller, "Seller should be " + seller);
            assert.equal(receipt.logs[0].args._buyer, buyer, "Buyer should be " + buyer);
            assert.equal(receipt.logs[0].args._name, articleName1, "ArticleName1 should be " + articleName1);
            assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "Price1 should be " + web3.toWei(articlePrice1, "ether"));

            //save balances after buy
            sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber(); 
            buyerBalanceAfterBuy =web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

            //compare balances
            assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + articlePrice1, 'Seller should been earned ' + articlePrice1 + " ETH");
            assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice1, 'Buyer should been spend ' + articlePrice1 + " ETH");

            return chainListInstance.getArticlesForSale();
        }).then(function(data) {
            assert.equal(data.length, 1, "There should be only one article for sale now");   
            assert.equal(data[0].toNumber(), 2, "article 2 must be the last for sale");
            return chainListInstance.getNumberOfArticles();
        }).then(function(data){
            assert.equal(data.toNumber(), 2, "Total articles must be 2");
        });
    });

});