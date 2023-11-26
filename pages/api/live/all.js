import path from "path";
import fs from "fs";

import eventBus from '../../../util/eventBus';

import {getDouyuLive, getHuyaLive} from "../../../util/liveData";

const ipv6Str = fs.readFileSync(path.join(process.cwd(), 'public/tv/txt', 'ipv6.txt'), 'utf-8');


// 在需要实时刷新的地方订阅事件
eventBus.subscribe('huyaLiveStr', updatedObject => {
    // 在这里执行实时刷新的操作
    // console.log('Received updated object:', updatedObject);
    console.log('process eventBus.subscribe  huyaLiveStr')
    huyaLiveStr = updatedObject;
});

export default async function handler(req, resp) {
    if (req.method === 'GET') {
        resp.setHeader('Content-Type', 'text/html; charset=UTF-8'); // 设置正确的字符编码
        let huyaLiveStr = await getHuyaLive();
        let douyuLiveStr = await getDouyuLive();
        // console.log(huyaLiveStr);
        resp.status(200).send(`${ipv6Str}\n\n${huyaLiveStr}\n\n${douyuLiveStr}`);
    } else {
        // 处理其他请求方法
        resp.status(405).json({ error: 'Method Not Allowed!' });
    }
}