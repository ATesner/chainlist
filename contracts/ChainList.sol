pragma solidity ^0.4.18;

import "./Ownable.sol";

contract ChainList is Ownable {
    
    //custom types
    struct Article {
        uint id;
        address seller;
        address buyer;
        string name;
        string description;
        uint256 price;
    }

    //state variables
    mapping(uint => Article) public articles;
    uint articleCounter;

    //events
    event LogSellArticle(
        uint indexed _id,
        address indexed _seller,
        string _name,
        uint256 _price
    );

    event LogBuyArticle(
        uint indexed _id,
        address indexed _seller,
        address indexed _buyer,
        string _name,
        uint256 _price
    );

    function kill() public onlyOwner {
        selfdestruct(owner);
    }

    function sellArticle(string _name, string _description, uint256 _price) public {
        articleCounter++; //increment number of articles
        //store the article
        articles[articleCounter] = Article(
            articleCounter,
            msg.sender,
            0x0,
            _name,
            _description,
            _price
        );

        LogSellArticle(articleCounter, msg.sender, _name, _price);
    }

    //fetch the number of articles
    function getNumberOfArticles() public view returns (uint) {
        return articleCounter;
    }

    //fetch and return all articles still for sale
    function getArticlesForSale() public view returns (uint[]) {
        //prepare output array
        uint[] memory articleIds = new uint[](articleCounter);
        
        uint numberOfArticlesForSale = 0;
        for (uint i = 1 ; i <= articleCounter; i++) {
            //keep the id if the article is still for sale
            if (articles[i].buyer == 0x0) { //if he's not sale yet
                articleIds[numberOfArticlesForSale] = articles[i].id;
                numberOfArticlesForSale++;
            }
        }

        //copy the article IDS array into a smaller for sale array
        uint[] memory forSale = new uint[](numberOfArticlesForSale);
        for (uint j = 0 ; j < numberOfArticlesForSale ; j++) {
            forSale[j] = articleIds[j];
        }
        return forSale;
    }

    function buyArticle(uint _id) payable public {

        require(articleCounter > 0); // there is an article for sale
        require(_id > 0 && _id <= articleCounter); //check if the article exist
        
        Article storage article = articles[_id];//retrieve the article from the mapping

        require(article.buyer == 0X0); // article not sold yet
        require(msg.sender != article.seller); //can't buy your own article
        require(msg.value == article.price); //right price sent
        
        article.buyer = msg.sender; //save the buyer
        article.seller.transfer(msg.value); //pay the seller

        LogBuyArticle(_id, article.seller, article.buyer, article.name, article.price);
    }


}

