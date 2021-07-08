const Discord = require('discord.js');
const secrets = require('./secrets.json')
const client = new Discord.Client();
const axios = require('axios')

//const BOT_CHANNEL = Discord.Message.Client.Channels.cache.get(pollchannel) || undefined

const timer = (ms) => new Promise( callback => setTimeout(callback, ms))
const log = console.log

storedRounds = {} // round : roundvalues
lastMessage = ""


const mkreq = async () => {
    for(x=0; x<= 1000000; x++){
        await timer(60000).then(
            axios.get('http://10.1.0.2/api/client/teams/31/',{ headers: {'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0'}})
                .then((res) => {
                    //console.log(res.data)
                    for (round of res.data){
                        if (!(round['round'] in storedRounds)){
                            //checks if the round is not stored already
                            storedRounds[round['round']] = {}
                            storedRounds[round['round']][round["task_id"]] = round
                        }
                        else{
                        // add the other task id to the stored[round['round']]
                        storedRounds[round['round']][round['task_id']] = round
                        }
                        // console.log(storedRounds)
                    }
                    console.log(storedRounds)
                })
                .catch((err) => {
                    console.log(err)
                })
                .then(() => {
                    console.log(`i am better`)
                })
        )
        log(x)
    }
}
mkreq()

client.once('ready', () => {
    var atRound
    TEST_CHANNEL = client.channels.fetch(secrets.testChannelId)
    DEPL_CHANNEL = client.channels.fetch(secrets.deploymentChannelId)

    parserCC = (json) => {
        statCodes = {
            "101": "up",
            "102": "corrupt",
            "103": "mumble",
            "104": "down"
        }
        tasksNames = {
            "1": "ctfe",
            "2": "NotABook",
            "3": "SaaS",
            "4": "WeirdCpu",
        }
        log(json.round, json.task_id)
        //messageTemplate = `ueue il servizio numero ${json.task_id} e chiamato ${tasksNames[json.task_id]} é ${statCodes[json.status]} nel round ${json.round}\n`
        if(json.status != "101"){
            messageTemplate = `ATTENZIONE: il servizio ${tasksNames[json.task_id] ? tasksNames[json.task_id] : "numero " + tasksNames } é ${statCodes[json.status]} nel round ${json.round}\n`
            return messageTemplate
        }
        else{
            return "blockme"
        }
    }
    
    //just a test
    //messageToSend = () => Math.random() - 0.5 <= 0 ? "AAAA" : "BBBB"
    
    messageToSend = () => {

        //log(String(Number(atRound)+1))
        //log(storedRounds, lastMessage)

        if (lastMessage == ''){
            firstRound = storedRounds[Object.keys(storedRounds)[0]]
            atRound = firstRound["1"]['round'] 
            mexToSend = ""

            // for each service
            for (service in firstRound){
                mexToSend += parserCC(firstRound[service])
            }
            // log(mexToSend)
            return mexToSend
        }

        else if (String(Number(atRound)+1) in storedRounds){
            log(atRound, `aaaaaaaaaa`)
            atRound = String(Number(atRound)+1)
            currentRound = storedRounds[atRound]
            mexToSend = ""

            // for each service
            for (service in currentRound){
                // log(service)
                mexToSend += parserCC(currentRound[service])
            }
            return mexToSend
        }
        else {
            return "blockme"
        }
    }
    
    sendMex = (mTS = messageToSend()) => {
    DEPL_CHANNEL.then(
        (channel) => {
            //log(mTS, lastMessage, typeof lastMessage)
            if((mTS != lastMessage || !lastMessage) && mTS != "blockme"){
                while(mTS.includes("blockme")){
                    mTS = mTS.replace("blockme","")
                }
                lastMessage = 'placeholder'

                if(mTS != ""){
                    channel.send(mTS)
                    lastMessage = mTS
                }

            }
    })
    }

    i=0
    repeat = async (_) => {
        while (i<1000000){
            await timer(1000).then(() => sendMex())  //as long as we put a fun here we send mex
            i++
        }
    }
    repeat()

	console.log('Ready!');
});


client.on('message', (msg) => {

    if (msg.content === "!!sanitycheck") {
        console.log(msg.channel)
        
        msg.channel.send("@everyone ue ue bell stu pruff of conceptt")
    }
})


client.login(secrets.token);
