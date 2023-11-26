import { exportRecordList } from "../pages/api/scheduleTask";

let liveData = {
    huya: ""
};


// 更新缓存数据的定时任务
export async function updateHuyaLive() {
    const newData = await exportRecordList(); // 从 exportRecordList 获取最新的数据
    liveData.huya = newData; // 将最新数据存入缓存
}

export async function getHuyaLive() {
    if (liveData.huya) {
        // 如果缓存中已经有值，直接返回缓存的数据
        return liveData.huya;
      } else {
        // 如果缓存中没有值，调用 exportRecordList 获取数据，并存入缓存
        const data = await exportRecordList();
        liveData.huya = data;
        return data;
      }
}

// 清除缓存的函数（可选）
function clearHuyaCache() {
    cache.huyaData = null;
}