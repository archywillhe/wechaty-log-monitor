import { Wechaty, WechatyPlugin, log, Message, Contact, ScanStatus } from 'wechaty'
import { watchAndStream } from "./util"

const _ = require("underscore");


export type WechatyLogMonitorPluginConfig = {
  logOperations: WechatyLogOperation[],
  enableSelfToBeQrRescued?: boolean
}

export type WechatyLogOperation = {
  config: WechatyLogOperationConfig,
  onLogFileIsChanged?: WechatyLogFileLambda,
  onCmdReceived?: WechatyCommandLambda,
}

export type WechatyLogOperationConfig = {
  logFile?: string,
  adminWeixin: string,
  securityRule?: WechatyLogOperationSecurityRule
}

export type WechatyLogFileLambda = (
  bot:Wechaty, newLogs:string
) => Promise<void>
export type WechatyCommandLambda = (
  bot:Wechaty, cmd:string, config: WechatyLogOperationConfig
) => Promise<void>

export enum WechatyLogOperationSecurityRule {
  None  = 0,
  SMSVerification,
  authy,
  googleAuth
}


export function WechatyLogMonitor(pluginConfig: WechatyLogMonitorPluginConfig): WechatyPlugin {
   log.verbose('WechatyLogMonitorPluginOption', 'initial with config %s', JSON.stringify(pluginConfig, null, 2))

   const startWatchingLog = (bot:Wechaty,logOperations:WechatyLogOperation[])=>{
      _.each(logOperations,({onLogFileIsChanged, config})=>{
        if(typeof onLogFileIsChanged === "undefined") return
        const {logFile} = config
        watchAndStream(logFile,(content)=>{
          onLogFileIsChanged(bot,content)
        })
      })
    }

   const startReactingToCmds = (bot:Wechaty,logOperations:WechatyLogOperation[])=>{
     bot.on("message", async (msg: Message) => {
       _.each(logOperations,({onCmdReceived, config})=>{
         if(typeof onCmdReceived === "undefined") return
         if (msg.type() !== Message.Type.Text) return
         const contact = msg.self() ? msg.to() :  msg.from()
         const {adminWeixin} = config
         if(contact?.id === adminWeixin || contact?.weixin() === adminWeixin){
           const cmd =  msg.text().toLowerCase()
           onCmdReceived(bot,cmd,config)
         }

      })
     })
   }

   const makeSelfToBeQrRescued = (bot:Wechaty) => {
     bot.on("login", (user: Contact)=>{
       log.info('StarterBot', '%s login', user)
     })

     bot.on("scan",(qrcode: string, status: ScanStatus) =>{
       if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
         const qrcodeImageUrl = [
           'https://api.qrserver.com/v1/create-qr-code/?data=',
           encodeURIComponent(qrcode),
         ].join('')
         log.info('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)
       } else {
         log.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status)
       }
     })
   }

   return function (bot) {
    const {logOperations, enableSelfToBeQrRescued=true} = pluginConfig
    if(enableSelfToBeQrRescued) makeSelfToBeQrRescued(bot)
    bot.on("login",(user:Contact)=>{
      startWatchingLog(bot,logOperations)
    })
    startReactingToCmds(bot,logOperations)
   }

}


export {
  qrRescue
}                   from './qrRescue'

export {
  restartPM2,
  logAlert
}                   from './miscellaneous'
