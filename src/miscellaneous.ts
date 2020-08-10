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
  config: WechatyLogOperationConfig, parameter:{maxLogPerMin:number,maxLogPerHour:number, customName:string}
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
          const logFile = FileBox.fromFile(logFile,"log.txt")
          const base64 = await logFile.toBase64()
          const logFile64 = FleBox.fromBase64(logFile, 'log.txt')
          botSendToBot(bot,adminWeixin,logFile64)
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
