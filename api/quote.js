// 使用 module.exports 以符合 Vercel 的 Node.js 執行環境
module.exports = async (req, res) => {
    // 【核心修正】從 Vercel 的環境變數中安全地讀取 API Key
    // process.env.OX_API_KEY 的值，就是您在 Vercel 儀表板中設定的值
    const apiKey = process.env.OX_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: true, message: "後端未設定 API Key" });
    }
    
    const incomingUrl = new URL(req.url, `http://${req.headers.host}`);
    const params = incomingUrl.searchParams;

    const quoteUrl = new URL('https://api.0x.org/swap/permit2/quote');

    params.forEach((value, key) => {
        quoteUrl.searchParams.append(key, value);
    });
    
    quoteUrl.searchParams.append('feeRecipient', params.get('taker'));
    quoteUrl.searchParams.append('buyTokenPercentageFee', '0');

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    try {
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

