> Huge thanks to Wechaty + Juzi for the free pad-plus and donut tokens.

## Wechaty Log Monitor

一个基于Wechaty来进行Wechaty DevOps的Wechaty plugin, 主要用来做「掉线给码(QR Rescue)」等log-related的operations.

![demo](demo.jpeg)

## Quickstart

```
yarn add wechaty-log-monitor@latest
```

```
const qrResuceForB = qrResuce(({
  logFile: "../botBob.log",
  adminWeixin: "BobWeixin"
},{loginTest:"您好世界"}))
const errorAlert = errorAlertOperation({
  logFile: "../botBob-errors.log",
  adminWeixin: "BobWeixin"
})
const restartBobPM2 = restartPM2({
  adminWeixin: "BobWeixin"
},{pm2Id:1})
bot.use(
  WechatyLogMonitor({
    enableSelfToBeQrRescued: true,
    logOperations:[qrResuce, errorAlert,restartBobPM2]
  }),
)
```

# Current Functionalities

一、掉线给码(QR Rescue)

一个Wechaty掉线了，另一个Wechaty会发QR码给这个微信号来重新登陆～

这样掉线了就不用`ssh`到production服务器，然后`sudo su git`+`pm2 logs --lines 100`来进行扫码重登了。

(至少两个Wechaty bots（要部署到同个server）。「掉线给码」登陆的话需要两部手机。)


二、发Err给你

有error就会发给你

三、重启 pm2

# To-do

1. add authentication support for dangerous commands (using SMS, authy, googleAuth)
