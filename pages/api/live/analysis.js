import CryptoJS from 'crypto-js';
import Cors from 'cors';

// import http from 'http'

 function initMiddleware(middleware) {
    return (req, res) =>
      new Promise((resolve, reject) => {
        middleware(req, res, (result) => {
          if (result instanceof Error) {
            return reject(result);
          }
          return resolve(result);
        });
      });
  }

// 初始化 CORS 中间件
const cors = initMiddleware(
    Cors({
      methods: ['GET', 'POST', 'OPTIONS'], // 允许的 HTTP 方法
    })
  );

export default async function handler(req, resp) {
    console.log('analysis process !!!!')
    // 运行 CORS 中间件
    await cors(req, resp);
    // 如果需要允许多个来源，可以使用通配符 *
    resp.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'GET') {
        const {roomId} = req.query;
        const liveUrl = await getFlvV2(roomId);
        // resp.status(200).send(liveUrl);
        // resp.redirect(302, liveUrl);
        // resp.end();

        const encodedUrl = encodeURI(liveUrl);
        resp.writeHead(302, { Location: encodedUrl });
        resp.end();

          // 解析客户端的请求
        // const { method, url, headers } = req;

         // 发起对直播流的代理请求
        // http.get(liveUrl.replace('https://', 'http://'), (streamRes) => {
            // 设置响应头
            // 将直播流的数据通过代理响应给客户端
            // streamRes.pipe(resp);
        // });
    } else {
        // 处理其他请求方法
        resp.status(405).json({ error: 'Method Not Allowed!' });
    }
}



async function getRealRoomId(roomId) {
    const url = `https://m.huya.com/${roomId}`;
    const content = await (await fetch(url, {
            method: 'GET',
            headers: {
              'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Mobile Safari/537.36' // 添加自定义的标头，比如 Authorization
            }})).text();
    console.log(content);
    const p = /"profileRoom":.*?,/;
    const m = content.match(p);
    if (m) {
        const group = m[0];
        return group.replace("\"profileRoom\":", "").replace(",", "");
    }
    return null;
}



async function getFlvV2(roomId) {
    // const realRoomId = await getRealRoomId(roomId);
    // console.log(realRoomId);
    if(!roomId) {
        throw "roomId 不能为空";
    }
   
    const url = `https://mp.huya.com/cache.php?m=Live&do=profileRoom&roomid=${roomId}`;
    const jsonObject = await (await fetch(url)).json();
    const baseJson = jsonObject.data;
    if (baseJson.liveStatus.toUpperCase() === "OFF") {
      return "直播间未开播";
    }
  
    const gid = baseJson.liveData.gid;
  
    // realLiveStatus
    const infoW = baseJson.stream.flv.multiLine[0];
    const urlW = infoW.url;
  
    if ("1663" === gid) {
      return urlW.replace("http://", "https://");
    }
  
    return flvEncode(urlW);
  }
  
  function flvEncode(urlW) {
    const split = urlW.split('?');
    const suffixSplit = split[1].split('&');
    const map = new Map();
    suffixSplit.forEach(str => {
      const strSplit = str.split('=');
      if (strSplit.length > 1) {
        map.set(strSplit[0], strSplit[1]);
      }
    });
  
    let fm = map.get('fm');
    try {
      fm = decodeURIComponent(fm);
    } catch (e) {
      console.error(e);
    }
    const fmBytes = Buffer.from(fm, 'base64');
    let fmDecode = fmBytes.toString('utf-8');
    const uid = Date.now();
    const seqId = uid + Date.now();
    const wsTime = map.get('wsTime');
    const type = map.get('ctype');
    const t = map.get('t');
    const originalStr = `${seqId}|${type}|${t}`;
    const hexMd5 = CryptoJS.MD5(originalStr).toString(CryptoJS.enc.Hex);
    const streamName = split[0].split('.')[3].split('/')[2];
    fmDecode = fmDecode.replace("\$0", String(uid))
      .replace("\$1", streamName)
      .replace("\$2", hexMd5)
      .replace("\$3", wsTime);
    const wsSecret = CryptoJS.MD5(fmDecode).toString(CryptoJS.enc.Hex);
    const txyp = map.get('txyp');
    const fs = map.get('fs');
    const sphdcdn = map.get('sphdcdn') || "";
    const sphdDC = map.get('sphdDC') || "";
    const uuid = (Date.now() % 10000000000 * 1000 + Math.random() * 1000) % 4294967295;
    return `${split[0].replace("http", "https")}?wsSecret=${wsSecret}&wsTime=${wsTime}&seqid=${seqId}&ver=1&ctype=${type}&t=${t}&fs=${fs}&txyp=${txyp}&sphdcdn=${sphdcdn}&sphdDC=${sphdDC}&uid=${uid}&uuid=${uuid}&sv=2110211124`;
  }
  