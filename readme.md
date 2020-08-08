> Huge thanks to Wechaty + Juzi for the free pad-plus and donut tokens.

## Wechaty Log Monitor

一个基于Wechaty来进行Wechaty DevOps的Wechaty plugin, 主要用来做log monitoring, log alert,  以及像「掉线给码(QR Rescue)」的operations.

# Requirement

至少两个Wechaty bots（要部署到同个server）。

「掉线给码」登陆的话需要两部手机。

## Quickstart

```
yarn add wechaty-log-monitor@latest
```

```
const qrResuce = makeQRRescueOperation({
  logFile: "../the-other-bot.log",
  adminWeixin: "weixinUserName"
})
const errorAlert = errorAlertOperation({
  logFile: "../the-other-bot-errors.log",
  adminWeixin: "weixinUserName"
})
bot.use(
  WechatyLogMonitor({
    enableSelfToBeQrRescued: true,
    logOperations:[qrResuce, errorAlert]
  }),
)
```

# Current Functionalities

一、掉线给码(QR Rescue)

一个Wechaty掉线了，另一个Wechaty会发QR码给这个微信号来重新登陆～

（对于在production跑的Wechaty，这样就不用每次都`ssh`+`su sudo`+打开log扫码来重登了。）

二、发Err给你

有error就会发给你

三、`bash` 任何 scripts

e.g. 重启 pm2

# Future Functionalities

一、add authentication support for dangerous commands (using SMS, authy, googleAuth)

```
bot.use(
  WechatyLogMonitor({
    enableSelfToBeQrRescued: true,
    logOperations:[{
      logFile: "../nyan.log",
      adminWeixin: "weixinUserName",
      whenLogFileIsChanged: logFileLambda,
      whenCommandReceived: commandLambda, //contain dangerous commands
      securityRule: WechatyLogOperationSecurityRule.SMSVerification
      }],  
  }),
)
```
