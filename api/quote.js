// 【核心修正】改用 module.exports 語法，以符合 Vercel 的 Node.js 執行環境
module.exports = async (req, res) => {
    // 準備一個簡單、固定的回傳資料
    const data = {
        message: "後端代理運作正常！",
        timestamp: new Date().toISOString(),
    };

    // 設定回傳的標頭
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // 回傳 200 狀態碼和 JSON 資料
    res.status(200).json(data);
};

