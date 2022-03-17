const Twitter = require("twitter")
require("dotenv").config();
var fs = require('fs');
var util = require('util')

const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

let tweetIdToRetweet;
// Search for tweets with the query "ukraine"
client.get('search/tweets', {
  q: 'ukraine',
  include_entities:true,
  filter:("links"||"videos"||"images")
}, function (error, tweets, response) {
  // Loop through all 15 last tweeted Tweets containing the term "ukraine"
  // If a tweet with more than 300 likes has been found, save the id to a pre-defined variable "tweetIdToRetweet"
  for (let i = 0; i < tweets.statuses.length; i += 1) {
    if (tweets.statuses[i].retweeted_status) {
      if (tweets.statuses[i].retweeted_status.favorite_count > 300) {
        tweetIdToRetweet = tweets.statuses[i].retweeted_status.id_str;
      }
    } else {
      if (tweets.statuses[i].favorite_count > 300) {
        tweetIdToRetweet = tweets.statuses[i].id_str;
      }
    }
  }

  console.log(tweetIdToRetweet)

  let tweetedTweets = [];
  fs.readFile(`./retweetedTweets.json`, (err, data) => { // get the data from the file
    if (data != '') {
      tweetedTweets = JSON.parse(data);
    }

    console.log(tweetedTweets.tweets)

    if (!tweetedTweets.tweets.includes(tweetIdToRetweet)) {
      client.post('statuses/retweet/' + tweetIdToRetweet, function (error, tweet, response) {
        if (!error) {
          console.log(tweet);
        }
      });

      tweetedTweets.tweets.push(tweetIdToRetweet);

      const jsonFormat = JSON.stringify(tweetedTweets)

      fs.writeFile(`./retweetedTweets.json`, jsonFormat, (err) => {
        console.log(err);
      });
    }
  });

});