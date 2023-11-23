export default async function handler(req, resp) {
    if (req.method === 'GET') {
      const { url } = req.query;
      try {
        const fetchResponse = await fetch(url);
        if (fetchResponse.ok) {
          const responseStr = await fetchResponse.text(); // 获取纯文本内容
          const result = m3u8ToTxt(responseStr);
          resp.setHeader('Content-Type', 'text/html; charset=UTF-8'); // 设置正确的字符编码
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
  

function m3u8ToTxt(input) {
    const lines = input.split('\n');
    const resultJson = {};
    let currentGenre = '';
    let lastGroupName = '';
    for (const line of lines) {
      if (line.startsWith('#EXTINF')) {
        const parts = line.split(',');
        if (parts.length >= 2) {
          currentGenre = parts[1].trim();
          // console.log(currentGenre);
          const genreMatch = parts[0].match(/group-title="([^"]+)"/) ;
          const tmpStr = '\n' + genreMatch[1] + ',#genre#';
          let tmpList = resultJson[tmpStr];
          if (!tmpList) {
            tmpList = [];
            resultJson[tmpStr] = tmpList;
          }
          lastGroupName = tmpStr;
        //   if (result.indexOf(tmpStr) === -1) {
        //       result.push(tmpStr);
        //   }
        }
      } else if (line.startsWith('http')) {
        if (line.trim() !== '') {
            let tmpList = resultJson[lastGroupName];
            tmpList.push(`${currentGenre},${line}`)
        //   result.push(`${currentGenre},${line}`);
        }
      }
    }

    const result = [];
    Object.entries(resultJson).forEach(([key, value]) => {
        result.push(key);
        result.push(value.join('\n'));
        // console.log('Key: ' + key + ', Value: ' + value);
      });
    result[0] = result[0].replace('\n', '')
    return result.join('\n');
  }
  