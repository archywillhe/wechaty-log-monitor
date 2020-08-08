import { Wechaty, FileBox } from 'wechaty'
import {getLastMatch, readLastLines, botSendToBot } from "./util"
import {WechatyLogOperationConfig, WechatyLogOperation} from "./index"

const _ = require("underscore");

export const qrRescue = (
  config: WechatyLogOperationConfig,parameter:{loginTest:string}
):WechatyLogOperation => {

  const {loginTest="ping"} = parameter

  const globalState = {isOtherBotAlive: true, isDisabled: false}

  const onOtherBotIsLoggedOut = async(bot:Wechaty,adminWeixin:string,qrCodeToLogin:string)=>{
    globalState.isOtherBotAlive = false
    const qrCodeImage = FileBox.fromUrl(qrCodeToLogin,'qr.png')
    // console.log(qrCodeToLogin,qrCodeImage)
    botSendToBot(bot, adminWeixin, "掉线了啦")
    botSendToBot(bot, adminWeixin, qrCodeImage)
  }

  const onOtherBotIsLoggedIn = async(bot:Wechaty,adminWeixin:string)=>{
    globalState.isOtherBotAlive = true
    botSendToBot(bot, adminWeixin, loginTest)
  }

  const onLogFileIsChanged = async (bot:Wechaty, newLogs:string) =>{
    const { logFile="", adminWeixin} = config
    if(globalState.isDisabled) return
    if(globalState.isOtherBotAlive){
      const latestQRCode = qrCodeAwaitingToBeScanned(newLogs)
      if(latestQRCode) onOtherBotIsLoggedOut(bot,adminWeixin,latestQRCode)
    }else{
      const loggedIn = isUserLoggedIn(newLogs)
      if(loggedIn) onOtherBotIsLoggedIn(bot,adminWeixin)
    }
  }


const qrCodeAwaitingToBeScanned = (lastFewLines:string):string|undefined => {

    const signThatItIsLoggedIn = /INFO StarterBot Contact<(.*)?> login/g
    const indexOfLastSignOfLoggedIn = getLastMatch(signThatItIsLoggedIn,lastFewLines)?.index || -1

    const pattern = /INFO StarterBot onScan: Waiting\(.*\) - (.*)?\n/g
    const match = getLastMatch(pattern,lastFewLines)
    // console.log("comparison",indexOfLastSignOfLoggedIn,match?.index)
    if(match) return match.index > indexOfLastSignOfLoggedIn ? match[1] : undefined
    return undefined
  }

  const isUserLoggedIn = (lastFewLines:string):boolean => {
    const signThatItIsLoggedIn = /INFO StarterBot Contact<(.*)?> login/g
    return signThatItIsLoggedIn.test(lastFewLines)

  }

  const onCmdReceived = async (bot:Wechaty, cmd:string, config: WechatyLogOperationConfig) => {
      const {adminWeixin,logFile=""} = config
      switch(cmd){
        case("status"):
          botSendToBot(bot, adminWeixin,
            globalState.isOtherBotAlive ? loginTest : "掉线了啦"
          )
          break;
        case("qr"):
        const last50Lines = readLastLines(logFile,50)
        const qrURL = qrCodeAwaitingToBeScanned(last50Lines)
        const qrImage = qrURL ?
         botSendToBot(bot, adminWeixin, FileBox.fromUrl(qrURL,'qr.png')) :
         botSendToBot(bot, adminWeixin, "登陆了啦" )
          break
        case("disable-qrRescue"):
          globalState.isDisabled = true
          break
        case("enable-qrRescue"):
          globalState.isDisabled = false
        default:
      }
  }

  return{
    config,
    onLogFileIsChanged,
    onCmdReceived
  }

}