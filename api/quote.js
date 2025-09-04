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

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const params = req.query;
        const quoteUrl = new URL('https://api.0x.org/swap/permit2/quote');

        Object.entries(params).forEach(([key, value]) => {
            quoteUrl.searchParams.append(key, value);
        });

        quoteUrl.searchParams.append('feeRecipient', params.taker);
        quoteUrl.searchParams.append('buyTokenPercentageFee', '0');

        // 【最終核心修正】強制只使用支援 Permit2 的流動性來源，確保獲得 v2 報價
        // 您可以根據需求增減來源，例如 'Uniswap_V3,Balancer_V2,Curve,MakerPsm' 等
        quoteUrl.searchParams.append('includedSources', 'Uniswap_V3,Curve,Balancer_V2');

        const apiResponse = await fetch(quoteUrl.toString(), {
            headers: {
                '0x-api-key': apiKey,
                '0x-version': 'v2',
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

