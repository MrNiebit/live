

// pages/api/douyu/[rid].js

import CryptoJS from 'crypto-js';
const baseApiUrl = 'https://tv.lacknb.com/api/live/analysis?type=douyu&roomId=';

const DouYu = {
  md5: function (data) {
    return CryptoJS.MD5(data).toString(CryptoJS.enc.Hex);
  }
};

export default async function handler(req, res) {
  try {
    // res.setHeader('Content-Type', 'text/html; charset=UTF-8'); // 设置正确的字符编码
    // res.status(200).send(await yqkList());


    // const rid = await getRealRoomId(req.query.rid);

    // const key = await getKey(req.query.rid, '10000000000000000000000000001501', String(Date.now()));

    const realUrl = await getRealUrl(req.query.rid);
    res.status(200).json({ realUrl });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getRealRoomId(roomId) {
  console.log(roomId);

  const response = await fetch(`https://m.douyu.com/${roomId}`);
  const html = await response.text();
  // console.log(html);
  // 使用正则表达式匹配数据
  const matchResult = html.match(/rid":(\d{1,8}),"vipId/);

  if (matchResult) {
    return [matchResult[1], html];
  } else {
    throw new Error('房间号错误');
  }
}

async function getKey(rid, did, t13) {

  const url = 'https://playweb.douyucdn.cn/lapi/live/hlsH5Preview/' + rid;

  const params = new URLSearchParams();
  params.append('rid', rid);
  params.append('did', did); 
  const auth = DouYu.md5(rid + t13); // 你的 t13 值
  const headers = {
    'rid': rid,
    'time': t13, // 你的 t13 值
    'auth': auth
  };
  // console.log(headers, url);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...headers
    },
    body: params
  });

  const responseData = await response.json();
  // console.log(responseData);
  const error = responseData.error;
  const data = responseData.data;
  let key = '';

  if (data) {
    const rtmp_live = data.rtmp_live;
    // console.log(rtmp_live)
    const regex = /(\d{1,8}[0-9a-zA-Z]+)_?\d{0,4}(\/playlist|\.m3u8)/;
    const match = regex.exec(rtmp_live);
    // const matchResult = rtmp_live.match(/(\d{1,8}[0-9a-zA-Z]+)_?\d{0,4}\/(playlist|.m3u8)/);
    if (match) {
      key = match[1];
    }
  }

  return [error, key];
}

async function getJs(rid, did, t10, res) {
  let result = res.match(/(function ub98484234.*)\s(var.*)/);
  let func_ub9 = result[0].replace(/eval.*;/, 'strc;}');
  let js = new Function(func_ub9);
  let jsResult = js();

  let v = jsResult.match(/v=(\d+)/)[1];
  let rb = crypto.createHash('md5').update(rid + did + t10 + v).digest('hex');

  let func_sign = jsResult.replace(/return rt;}\);?/, 'return rt;}');
  func_sign = func_sign.replace('(function (', 'function sign(');
  func_sign = func_sign.replace('CryptoJS.MD5(cb).toString()', '"' + rb + '"');

  js = new Function(func_sign);
  let params = js(rid, did, t10);
  params += '&ver=219032101&rid=' + rid + '&rate=-1';

  let url = 'https://m.douyu.com/api/room/ratestream';
  let response = await fetch(url, { method: 'POST', body: params });
  let data = await response.text();
  let key = data.match(/(\d{1,8}[0-9a-zA-Z]+)_?\d{0,4}(.m3u8|\/playlist)/)[1];

  return key;
}

export async function getRealUrl(roomId) {
  const [realRoomId, html] = await getRealRoomId(roomId);
  let [error, key] = await getKey(realRoomId, '10000000000000000000000000001501', String(Date.now()));
  if (error === 0) {
    // Do something
  } else if (error === 102) {
    throw new Error('房间不存在');
  } else if (error === 104) {
    throw new Error('房间未开播');
  } else {
    key = await getJs(realRoomId, '10000000000000000000000000001501', String(Math.floor(Date.now() / 1000)), html);
  }
  return `http://hw-tct.douyucdn.cn/live/${key}.flv?uuid=`;
}

export async function yqkList() {

  let page = 1;
  const apiUrl = `https://m.douyu.com/hgapi/live/cate/newRecList?offset=${page}&cate2=yqk&limit=20`
  const response = await fetch(apiUrl);
  if (response.ok) {
    const itemList = ["斗鱼直播【一起看】,#genre#"]

    const data = await response.json();
    const total = data.data.total;
    console.log('douyu tota: ', total);
    const pageCount = Math.ceil(total / 20);
    let datas = data.data.list;
    for (const item of datas) {
      itemList.push(`${item.roomName},${baseApiUrl}${item.rid}`);
    }

    for(page = 2; page <= pageCount; page++) {
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        let datas = data.data.list;
        for (const item of datas) {
          itemList.push(`${item.roomName},${baseApiUrl}${item.rid}`);
        }
      }
    }
    return itemList.join('\n');
  } else {
    throw new Error('Failed to fetch data');
  }

}