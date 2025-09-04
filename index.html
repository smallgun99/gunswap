// Vercel Serverless Function to act as a proxy for the 0x API
// This is a Node.js environment.

// 引入 fetch 模組 (在 Node.js 18+ 環境中是內建的)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

export default async function handler(req, res) {
    // 從前端請求的 URL 中獲取查詢參數
    const { searchParams } = new URL(req.url, `https://gunswap.vercel.app`);
    
    // 【最終核心修正】在向 0x API 發送請求前，加入滑點容忍度參數
    // 這能極大提高在真實網路環境中交易的成功率
    searchParams.set('slippagePercentage', '0.005'); // 0.5% slipage

    const apiKey = process.env.OX_API_KEY;

    // 再次檢查環境變數是否存在，確保部署正確
    if (!apiKey) {
        return res.status(500).json({ error: true, message: "後端未設定 API Key" });
    }

    // 建立要發送給 0x API 的 URL
    const apiUrl = `https://polygon.api.0x.org/swap/v1/quote?${searchParams}`;
    const headers = { '0x-api-key': apiKey };

    try {
        // 向 0x API 發送請求
        const apiResponse = await fetch(apiUrl, { headers });
        const responseBody = await apiResponse.text();
        const responseStatus = apiResponse.status;

        // 將 0x API 的原始回應（無論是成功還是失敗）安全地回傳給前端
        // 確保 Content-Type 是 application/json
        res.status(responseStatus).setHeader('Content-Type', 'application/json').send(responseBody);
        
    } catch (error) {
        // 如果 fetch 本身失敗（例如網路問題），回傳一個標準的錯誤 JSON
        res.status(500).json({
            error: true,
            message: '後端代理請求 0x API 時發生網路錯誤',
            details: error.message
        });
    }
}

