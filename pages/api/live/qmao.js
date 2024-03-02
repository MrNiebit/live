
import CryptoJS from 'crypto-js';
export default async function handler(req, resp) {

    if (req.method === 'GET') {
        resp.setHeader('Content-Type', 'text/html; charset=UTF-8'); // 设置正确的字符编码
        let {type} = req.query;
        if (!type) {
            type = 1;
        }
        const liveList = await getLiveList(type);
        const itemList = [`QMAO直播TYPE=${type}【QMAO】,#genre#`];
        for (const item of liveList) {
            // console.log(item.nplayFlv)
            const dec = await decryptUrl(item.nplayFlv.trim());
            itemList.push(`${item.title},${dec}`);
        } 
        resp.status(200).send(itemList.join('\n'));
    } else {
        resp.status(405).json({ message: 'Method not allowed' });
    };
}

async function decryptUrl(oriUrl) {
    const ciphertext = CryptoJS.enc.Base64.parse(oriUrl);
    const key = CryptoJS.enc.Utf8.parse('qwertyui12345678');
    return CryptoJS.AES.decrypt(
    {
        ciphertext
    }, 
    key,
     {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    }
    ).toString(CryptoJS.enc.Utf8);
}

async function getLiveList(type) {
    // const apiUrl = "https://45.117.11.10/live-ns/index/getVideoList";
    const apiUrl = "https://btd.baiducnapp.com:7390/live-ns/index/getVideoList";
    const headers = {
        token: "",
        dev: 2,
        version: "6.6.6.6",
        "frond-host": "https://btd.baiducnapp.com:7390/live-ns/index/getVideoList",
        time: new Date().getTime(),
        "Content-Type": "application/json"
    };
    const data = {
        "cate": type,
        "condition": "",
        "filmSupport": 1,
        "page_num": 1,
        "page_size": 999
    }
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            ...headers
        },
        body: JSON.stringify(data)
    });
    const respData = await response.json();
    if (respData.code != 0 || !respData.data.data) {
        console.log(respData);
        return "";
    }
    return respData.data.data;
}