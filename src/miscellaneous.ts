import { Wechaty, FileBox } from 'wechaty'
import {execAndPipeToBot, botSendToBot } from "./util"
import {WechatyLogOperationConfig, WechatyLogOperation} from "./index"

// const _ = require("underscore");

export const restartPM2 = (
  config: WechatyLogOperationConfig, parameter:{pm2Id:number}
):WechatyLogOperation => {
  return{
    config,
    onCmdReceived : async (
      bot:Wechaty, cmd:string, config: WechatyLogOperationConfig
    ) => {
        const {adminWeixin} = config
        if(cmd === "restart") execAndPipeToBot("pm2 restart "+parameter.pm2Id, bot, adminWeixin)
    }
  }
}


export const logAlert = (
  config: WechatyLogOperationConfig, parameter:{maxLogPerMin:number, customName:string}
):WechatyLogOperation => {
  const {maxLogPerMin=3, customName=""}= parameter
  var currentLogCount = 0
  return{
    config,
    onCmdReceived : async (
      bot:Wechaty, cmd:string, config: WechatyLogOperationConfig
    ) => {
        const {adminWeixin,logFile=""} = config
        if(cmd === ("log "+customName)){
          console.log("attempting to display "+logFile)
          const filebox = FileBox.fromFile(logFile,"log.txt")
          const base64 = await filebox.toBase64()
          const filebox64 = FileBox.fromBase64(base64, 'log.txt')
          botSendToBot(bot,adminWeixin,filebox64)
        }
    },
    onLogFileIsChanged : async (bot:Wechaty, newLogs:string) => {

      if(currentLogCount >= maxLogPerMin) return

      if(currentLogCount === 0){
        setTimeout(() => {
          currentLogCount = 0
        }, 60 * 1000);
      }
      currentLogCount += 1
      const {adminWeixin} = config
      botSendToBot(bot,adminWeixin,newLogs)
    }
  }
}
