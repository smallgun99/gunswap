// 使用 module.exports 以符合 Vercel 的 Node.js 執行環境
module.exports = async (req, res) => {
    // 您的 API Key
    const apiKey = 'd934b953-65b4-4e0c-8953-ac203f634f9b';
    
    const incomingUrl = new URL(req.url, `http://${req.headers.host}`);
    const params = incomingUrl.searchParams;

    const quoteUrl = new URL('https://api.0x.org/swap/permit2/quote');

    params.forEach((value, key) => {
        quoteUrl.searchParams.append(key, value);
    });
    
    // 【核心修正】模仿 Oku.trade，加入手續費參數，確保獲得可執行的報價
    // 我們將手續費設為 0，接收地址設為 taker 地址 (您自己)
    // 這樣既符合專業請求的結構，又不會實際收取費用
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

