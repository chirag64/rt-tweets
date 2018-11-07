// require('dotenv').config();
const Twitter = require('twitter');

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const retweeted = new Set();
const MAX_TWEETS_PER_PASS = parseInt(process.env.MAX_TWEETS_PER_PASS, 10);
const TIME_INTERVAL_MINUTES = parseInt(process.env.TIME_INTERVAL_MINUTES, 10);
const EXCLUDE_KEYWORDS = process.env.EXCLUDE_KEYWORDS.split(',');
var shouldThisTweetBeExcluded;

/**
 * Stream statuses filtered by keyword
 * number of tweets per second depends on topic popularity
 **/
// client.stream('statuses/filter', {track: process.env.QUERY},  function(stream) {
//   stream.on('data', function(tweet) {
//     console.log(`${tweet.id_str}\n${tweet.text}`);
//   });

//   stream.on('error', function(error) {
//     console.log(error);
//   });
// });
setInterval(() => {
  console.log('Running the function');
  client.get('search/tweets', {q: process.env.QUERY}, function(error, tweets, response) {
    // console.log(JSON.stringify(tweets));
    tweets.statuses.forEach((tweet, index) => {
      shouldThisTweetBeExcluded = checkTweetForExclusions(tweet, EXCLUDE_KEYWORDS);
      if (index < MAX_TWEETS_PER_PASS && !retweeted.has(tweet.id_str) && !shouldThisTweetBeExcluded) {
        client.post('statuses/retweet/' + tweet.id_str, function(error, myTweet, response) {
          if (!error) {
            retweeted.add(tweet.id_str)
            console.log(myTweet);
          } else if(error) {
            console.error(error);
          }
        });
      }
    });
  });
}, TIME_INTERVAL_MINUTES * 60 * 1000);

function checkTweetForExclusions(tweet, EXCLUDE_KEYWORDS) {
  return EXCLUDE_KEYWORDS.some((keyword) => {
    tweet.text.includes(keyword);
  })
}