import * as fs from "fs";
import {  Wechaty, FileBox } from 'wechaty'
// import {WechatyCommandLambda } from "./index"

export const readLastLines = require('read-last-lines')
const { exec } = require("child_process");

// const _ = require("underscore");

export const watchAndStream = (
  file:string,callback:(content:string)=>void
)=>{
  if(!fs.existsSync(file)){
    console.log(`file-to-watch ${file} not exist`)
    return
  }
  fs.watchFile(file,{ interval: 2000 },(curr,prev) => {
    const stream = fs.createReadStream(file,{start:prev.size, end:curr.size})
    stream.on("data",function(data){
      const chunk = data.toString();
      // console.log(prev.size, curr.size)
      callback(chunk)
    })
  })
}

export const getLastMatch = (pattern:RegExp,string:string):any|null=>{
  var temp,match = null
  while ((temp = pattern.exec(string)) != null) {
    match = temp
  }
  return match
}

export const execAndPipeToBot = (terminalCmd:string,bot:Wechaty,adminWeixin:string) => {
  botSendToBot(bot,adminWeixin,"我要执行 `"+terminalCmd+"` 了啦！")
  exec(terminalCmd, (error:any, stdout:any, stderr:any) => {
    if (error) botSendToBot(bot,adminWeixin,`error: ${error.message}`)
    if (stderr) botSendToBot(bot,adminWeixin,`stderr: ${stderr}`)
    if (stdout) botSendToBot(bot,adminWeixin,`stdout: ${stdout}`)
  });
}

export const botSendToBot = async(bot:Wechaty,otherBotWx:string,something:any) =>{
  // console.log("botSendToBot")
  var contact = (await bot.Contact.find({ weixin:otherBotWx}))|| (await bot.Contact.find({ id:otherBotWx}))
  if(contact){
    if(something instanceof FileBox){
      bot.wechaty.puppet.messageSendFile(
        contact.id,
        something,
      )
    }else{
      contact.say(something)
    }
  }else{
    bot.say("can't find contact in my friend list ?!")
  }
}
