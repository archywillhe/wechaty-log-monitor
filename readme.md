> Huge thanks to Wechaty + Juzi for the free pad-plus and donut tokens.

## Wechaty Log Monitor

一个基于Wechaty来对production跑的WeChaty（或任何服务器）进行log相关的DevOps的Wechaty plugin！

可以让你在微信中看log、收到log alert、执行CMD，以及实现「掉线给码」等功能。

![demo](demo.jpeg)

## Quick guide to implement your log operation:

```typescript
import { Wechaty, FileBox } from 'wechaty'
import {execAndPipeToBot, botSendToBot, WechatyLogOperationConfig, WechatyLogOperation } from "wechaty-log-monitor"

export const somethingNew = (
  config: WechatyLogOperationConfig, parameter:{pm2Id:number}
):WechatyLogOperation => {
  return{
    config,
    onLogFileIsChanged : async (bot:Wechaty, newLogs:string)=> {
        //your side effect
    },
    onCmdReceived : async (
      bot:Wechaty, cmd:string, config: WechatyLogOperationConfig
    ) => {
        //your side effect
    }
  }
}


bot.use(
  WechatyLogMonitor({
    enableSelfToBeQrRescued: true,
    logOperations:[somethingNew] //can include as many log operations as you want
  }),
)
```

## Quickstart

```bash
yarn add wechaty-log-monitor@latest
```

### 一、掉线给码(QR Rescue)

一个Wechaty掉线了，另一个Wechaty会发QR码给这个微信号来重新登陆～

这样掉线了就不用`ssh`到production服务器，然后`sudo su git`+`pm2 logs --lines 50`来进行扫码重登了。

Requirements:

- 至少两个Wechaty bots（要部署到同个server）。

- 登陆的话因为要用到微信「扫一扫」功能，需要两部手机，或一个手机+把qr投影到一个屏幕上

```typescript
import {qrResuce, WechatyLogMonitor} from "wechaty-log-monitor"

const qrResuceForB = qrResuce(({
  logFile: "../botBob.log",
  adminWeixin: "BobWeixin"
},{loginTest:"您好世界"}))

bot.use(
  WechatyLogMonitor({
    enableSelfToBeQrRescued: true,
    logOperations:[qrResuceForB]
  }),
)
```

### 二、发log给你

每当指定的log file有新的一行，bot就会发送给adminWeixin。默认一分钟最多发3条，`maxLogPerMinute`可改为任何数值。

<!-- 每当指定的log file有新的一行，bot就会发送给adminWeixin。默认一分钟最多发3条，一个小时最多发30条，`maxLogPerMinute`和`maxLogPerHour`可改为任何数值。 -->

除此之外，如果adminWeixin发给bot「log `customName`」, bot会把整个log发给adminWeixin。

```typescript
import {logAlert, WechatyLogMonitor} from "wechaty-log-monitor"

const errorAlert = logAlert({
  logFile: "../botBob-errors.log",
  adminWeixin: "BobWeixin"
},{limitPerMinute:3,customName:"bob"})
bot.use(
  WechatyLogMonitor({
    logOperations:[errorAlert]
  }),
)
```

### 三、重启 pm2

adminWeixin发`restart`给bot,bot就会重启函数中指定的pm2.

```typescript
import {restartPM2, WechatyLogMonitor} from "wechaty-log-monitor"

const restartBobPM2 = restartPM2({
  adminWeixin: "BobWeixin"
},{pm2Id:"archy"})
bot.use(
  WechatyLogMonitor({
    logOperations:[restartBobPM2]
  }),
)
```

Please feel free to fork me & implement more features! Pull requests are welcomed too!

## To-do

1. add authentication support for dangerous commands (using SMS, authy, googleAuth)

2. integrate GPT-3
