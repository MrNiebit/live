
// const fs = require('fs');
// const path = require('path');
// const cron = require('node-cron');
import fs from 'fs'
import path from 'path'
import cron from 'node-cron'
import eventBus from '../../util/eventBus';
// import { yqkList } from './live/douyu'; 
import {updateHuyaLive, updateDouyuLive} from "../../util/liveData";



// export let huyaLive = { content: ''};
const baseApiUrl = 'https://tv.lacknb.com/api/live/analysis?roomId=';

// 返回响应
export default async function handler(req, res) {
    await startScheduledTask();
    res.status(200).json({ message: '定时任务已启动' });
}
 

async function startScheduledTask() {
    console.log(1111);
    await updateHuyaLive();
    await updateDouyuLive();
    cron.schedule('0 0 */2 * * *', function () {
        console.log(2222);
        updateHuyaLive();
        updateDouyuLive();
    });
}



export async function exportRecordList() {

    let page = 1;
    const apiUrl = `https://www.huya.com/cache.php?m=LiveList&do=getLiveListByPage&gameId=2135&tagAll=0&page=${page}`;
    const response = await fetch(apiUrl);
    const responseJson = await response.json();
    const totalPage = Math.min(responseJson.data.totalPage, 3);
    console.log(totalPage);
    console.log("huya total: ", responseJson.data.totalCount)
    // console.log(JSON.stringify(responseJson));
    const datas = responseJson.data.datas;
    const itemList = ["虎牙直播【一起看】,#genre#"]
    for (const data of datas) {
        itemList.push(data.introduction + ',' + baseApiUrl + data.profileRoom);
    }
    for (page = 2; page <= totalPage; page++) {
        const response = await fetch(`https://www.huya.com/cache.php?m=LiveList&do=getLiveListByPage&gameId=2135&tagAll=0&page=${page}`);
        const responseJson = await response.json();
        const datas = responseJson.data.datas;
        for (const data of datas) {
            itemList.push(data.introduction + ',' + baseApiUrl + data.profileRoom);
        }
    }
    console.log(itemList.length);
    // setHuyaLive(itemList.join('\n'))
    return itemList.join('\n');

    // 目标文件路径
    // const filePath = path.join(process.cwd(), 'public/huya', 'huya.txt');

    // // 写入文件
    // fs.writeFile(filePath, itemList.join('\n'), (err) => {
    //     if (err) {
    //         console.error(err); 
    //         return;
    //     }
    //     console.log('File has been written to public directory');
    //     mergeFile();
    // });
    
}

// 在某个地方更改共享变量的对象
function changeSharedObject(newValue) {
    eventBus.publish('huyaLiveStr', newValue);
  }

async function mergeFile() {
    // 读取要合并的两个文件
    const ipv6Str = fs.readFileSync(path.join(process.cwd(), 'public/tv/txt', 'ipv6.txt'), 'utf-8');
    const huyaStr = fs.readFileSync(path.join(process.cwd(), 'public/huya', 'huya.txt'), 'utf-8');

    // 合并文件内容
    const mergedContent = ipv6Str + '\n' + huyaStr;

    // 写入新文件
    const newFilePath = path.join(process.cwd(), 'public/tv/txt', 'all.txt');
    fs.writeFileSync(newFilePath, mergedContent, 'utf-8');

}
