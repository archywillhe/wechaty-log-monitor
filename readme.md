> Huge thanks to Wechaty + Juzi for the free pad-plus and donut tokens.

## Wechaty Log Monitor

This is a Wechaty plugin for log-related DevOps. Fully functional! Very Loose coupling! Pretty much pure (other than side effects in I.O.)! It allows you to receive log alerts, view log files, execute cmd, and perform DevOps such as _QR Rescue_ for your WeChaty on Wechat itself!

![demo](images/demo2.jpeg)

[A Chinese write-up about this plugin is published on wechaty.js.org](https://wechaty.js.org/2020/08/09/wechaty-log-monitor/).

## Quick guide to implementing your Wechaty log operation:

```typescript
import { Wechaty, FileBox } from 'wechaty'
import {execAndPipeToBot, botSendToBot, WechatyLogOperationConfig, WechatyLogOperation } from "wechaty-log-monitor"

export const somethingNew = (
  config: WechatyLogOperationConfig, parameter:{someNumber:number,someString:string}
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

For examples see `src/qrRescue.ts` and `src/miscellaneous.ts`!

## Quickstart

```bash
yarn add wechaty-log-monitor@latest
```

### 1. qrResuce (aka 掉线给码)

Requirements:

- At least two Wechaties. Must be deployed on the same production server.

- Two phones. Or a way to project the QR code onto a screen so you can scan it in your Wechat via the native camera.

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

![demo](images/demo.jpeg)


### 二、logAlert (aka 发log给你)

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

### 三、restartPM2 (aka PM2重启)


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

![demo](images/restart.jpeg)

Please feel free to fork me & implement more features! Pull requests are welcomed too!

## To-do

0. write integration test cases using wechaty-mock

1. add authentication support (via SMS, authy, googleAuth)

2. integrate [GPT-3 Natural language Shell](https://beta.openai.com/?app=productivity&example=4_2_0)

![demo](images/gtp3.jpeg)
