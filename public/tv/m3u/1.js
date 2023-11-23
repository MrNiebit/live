function m3u8ToTxt(input) {
  const lines = input.split('\n');
  const result = [];
  let currentGenre = '';
  for (const line of lines) {
    if (line.startsWith('#EXTINF')) {
      const parts = line.split(',');
      if (parts.length >= 2) {
        currentGenre = parts[1].trim();
		// console.log(currentGenre);
        const genreMatch = parts[0].match(/group-title="([^"]+)"/);
		if (result.indexOf(genreMatch[1]) === -1) {
			result.push(genreMatch[1]);
		}
      }
    } else if (line.startsWith('http')) {
      if (line.trim() !== '') {
        result.push(`${currentGenre},${line}`);
      }
    }
  }

  return result.join('\n');
}
