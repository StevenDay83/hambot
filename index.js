const Discord = require("discord.js");
const bayes = require('bayes');
const fs = require('fs');


const bot = new Discord.Client();
const settingsFiles = 'settings.json';

var settingsJSON = {};

var bayesClassifier = bayes();

var hamiltonCorpus = [
  {
    'site':'https://i.imgur.com/5aTqkUf.png',
    'keywords':'through the night we have one shot to live another day'
  },
  {
    'site':'https://i.imgur.com/zAHxQ0i.png',
    'keywords':'the code word is rochambeau'
  },
  {
    'site':'https://i.imgur.com/juiTgYD.png',
    'keywords':'dat da da da dai ah da'
  },
  {
    'site':'https://i.imgur.com/0zluH4M.png',
    'keywords':'i am not throwing away my shot'
  },
  {
    'site':'https://i.imgur.com/8KXHXZf.png',
    'keywords':'we pick and choose our battles and places to take a stand'
  },
  {
    'site':'https://i.imgur.com/5VWDqN9.png',
    'keywords':'if this is the end of me at least i have a friend with me'
  },
  {
    'site':'https://i.imgur.com/Mxomp48.png',
    'keywords':'wait for it wait for it wait for it wait for it'
  },
  {
    'site':'https://i.imgur.com/MZwoUgz.png',
    'keywords':'why do you assume you\'re the smartest in the room'
  }
]

function loadSettings (){
  var thisJSON = {};
  try {
    thisText = fs.readFileSync(settingsFiles);

    thisJSON = JSON.parse(thisText);
  } catch (e) {
    console.log(e);
  }

  return thisJSON;
}

async function learnCorpus(callback) {
  for (i = 0; i < hamiltonCorpus.length; i++){
    await bayesClassifier.learn(hamiltonCorpus[i].keywords, hamiltonCorpus[i].site);
  }

  callback();
}

// learnCorpus(async () => {
//   var v = await bayesClassifier.categorize("why do you assume");
//
//   console.log(v);
//
// });

settingsJSON = loadSettings();

learnCorpus(async function() {
  bot.on('ready', () => {
    console.log('bot is ready')
  });

  bot.login(settingsJSON.DiscordToken);

  const prefix = '!'

  bot.on('message', async (msg) => {
    //if our message doesnt start with our defined prefix, dont go any further into function
    if(!msg.content.startsWith(prefix)) {
      // console.log('no prefix');
      return
    }

    //slices off prefix from our message, then trims extra whitespace, then returns our array of words from the message
    const args = msg.content.slice(prefix.length).trim().split(' ')

    //splits off the first word from the array, which will be our command
    const command = args.shift().toLowerCase()
    //log the command
    // console.log('command: ', command)
    // //log any arguments passed with a command
    // console.log(args)

    if (command == 'hambot'){
      hamiltonCorpus = settingsJSON.HamiltonCorpus;

      if (args.length == 0){
        console.log("Random Image Request!");

        var thisIndex = Math.round(Math.random()*(hamiltonCorpus.length - 0));
        console.log(thisIndex);

        msg.channel.send({files: [hamiltonCorpus[thisIndex].site]});
      } else {
        if (args[0].toLowerCase() == 'say') {
          if (args.length > 1){
            var thisString = '';
            for (i = 1; i < args.length; i++){
              thisString += args[i] + ' ';
            }

            console.log("Picking image for " + thisString);

            var bayesImage = await bayesClassifier.categorize(thisString);

            msg.channel.send({files: [bayesImage]});

          } else {
            console.log("Nothing to say");
          }
        }
      }
    }

  });
});
