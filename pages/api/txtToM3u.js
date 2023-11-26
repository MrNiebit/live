
export default async function handler(req, resp) {
    if (req.method === 'GET') {
        const { url } = req.query;
        try {
          const fetchResponse = await fetch(url);
          if (fetchResponse.ok) {
            const responseStr = await fetchResponse.text(); // 获取纯文本内容
            const result = await txtToM3u(responseStr);
            resp.setHeader('Content-Type', 'text/plain; charset=UTF-8'); // 设置正确的字符编码
            resp.status(200).send(result);
          } else {
              resp.status(fetchResponse.status).json({ error: 'Failed to fetch the URL' });
          }
        } catch (error) {
          console.error(error);
          resp.status(500).json({ error: 'Internal Server Error' });
        }
      } else {
        // 处理其他请求方法
        resp.status(405).json({ error: 'Method Not Allowed!' });
    }
}

async function txtToM3u(originalStr) {
    const itemList = originalStr.split('\n');
    const m3uList = ['#EXTM3U x-tvg-url="https://live.fanmingming.com/e.xml"'];
    let channelName = "";
    itemList.forEach(item => {
        const rowSplit = item.split(',');
        if (rowSplit.length !== 2) {
            return;
        }
        if (rowSplit[1].indexOf('http') === -1) {
            channelName = rowSplit[0];
        } else {
          const tmpStr = rowSplit[0];
          if (rowSplit[0].indexOf('CCTV') !== -1) {
            const numbers = rowSplit[0].match(/\d+/g); 
            rowSplit[0] = 'CCTV' + numbers.join('');
          }
          m3uList.push(`#EXTINF:-1 tvg-id="${rowSplit[0]}" tvg-name="${rowSplit[0]}" tvg-logo="https://live.fanmingming.com/logo/${rowSplit[0]}.png" group-title="${channelName}",${tmpStr}\n${rowSplit[1]}`);
        }
    });
    return m3uList.join('\n');
} 