// 使用 module.exports 以符合 Vercel 的 Node.js 執行環境
module.exports = async (req, res) => {
    // 您的 API Key
    const apiKey = 'd934b953-65b4-4e0c-8953-ac203f634f9b';
    
    // 建立一個 URL 物件來解析前端傳來的參數
    const incomingUrl = new URL(req.url, `http://${req.headers.host}`);
    const params = incomingUrl.searchParams;

    // 【核心修正】使用正確的、通用的 v2 API 端點
    const quoteUrl = new URL('https://api.0x.org/swap/permit2/quote');

    // 將前端傳來的所有參數附加到 0x API 的 URL 上
    params.forEach((value, key) => {
        quoteUrl.searchParams.append(key, value);
    });
    
    // 設定回傳標頭，確保跨域請求正常
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    try {
        const apiResponse = await fetch(quoteUrl.toString(), {
            headers: {
                '0x-api-key': apiKey,
                '0x-version': 'v2', // 【核心修正】v2 流程必須包含此標頭
            },
        });

        // 取得最原始的回應文字
        const responseBodyText = await apiResponse.text();

        // 嘗試將回應解析為 JSON
        let responseJson;
        try {
            responseJson = JSON.parse(responseBodyText);
        } catch (e) {
            // 如果解析失敗（代表 0x API 回傳的不是 JSON，可能是 HTML 錯誤頁）
            // 我們將其打包成一個格式正確的錯誤 JSON 回傳給前端
            return res.status(500).json({
                error: true,
                message: "API 回應格式錯誤",
                details: responseBodyText.substring(0, 200), // 只截取前 200 個字元
            });
        }
        
        // 將 0x API 的狀態碼和已成功解析的 JSON 內容回傳給前端
        return res.status(apiResponse.status).json(responseJson);

    } catch (error) {
        // 處理 fetch 本身失敗的網路錯誤
        return res.status(500).json({
            error: true,
            message: '後端代理網路錯誤',
            details: error.message,
        });
    }
};

