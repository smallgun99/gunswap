// 使用 module.exports 以符合 Vercel 的 Node.js 執行環境
module.exports = async (req, res) => {
    // 從 Vercel 的環境變數中安全地讀取 API Key
    const apiKey = process.env.OX_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: true, message: "後端未設定 API Key" });
    }
    
    // 允許跨來源請求
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // 處理瀏覽器的 preflight 請求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const params = req.query;

        // 【核心修正】只使用 v2 API 端點
        const quoteUrl = new URL('https://api.0x.org/swap/permit2/quote');

        // 將所有前端傳來的參數附加到請求中
        Object.entries(params).forEach(([key, value]) => {
            // 【核心修正】確保參數名稱是 v2 的 `taker` 而不是 v1 的 `takerAddress`
            quoteUrl.searchParams.append(key, value);
        });

        // 加入 v2 所需的手續費參數
        quoteUrl.searchParams.append('feeRecipient', params.taker);
        quoteUrl.searchParams.append('buyTokenPercentageFee', '0');

        const apiResponse = await fetch(quoteUrl.toString(), {
            headers: {
                '0x-api-key': apiKey,
                '0x-version': 'v2', // 只使用 v2
            },
        });

        const responseBodyText = await apiResponse.text();
        
        let responseJson;
        try {
            responseJson = JSON.parse(responseBodyText);
        } catch (e) {
            return res.status(500).json({
                error: true,
                message: "API 回應格式錯誤",
                details: responseBodyText.substring(0, 200),
            });
        }
        
        return res.status(apiResponse.status).json(responseJson);

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: '後端代理網路錯誤',
            details: error.message,
        });
    }
};

