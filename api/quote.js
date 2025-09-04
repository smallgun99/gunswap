// 使用 module.exports 以符合 Vercel 的 Node.js 執行環境
module.exports = async (req, res) => {
    const apiKey = process.env.OX_API_KEY;

    // 跨來源請求設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    res.setHeader('Content-Type', 'application/json');

    if (!apiKey) {
        return res.status(500).json({ error: true, message: "後端未設定 API Key" });
    }

    try {
        const params = req.query;
        const quoteUrl = new URL('https://api.0x.org/swap/permit2/quote');

        Object.entries(params).forEach(([key, value]) => {
            quoteUrl.searchParams.append(key, value);
        });

        // 加入手續費參數，模仿專業平台的請求結構
        quoteUrl.searchParams.append('feeRecipient', params.taker);
        quoteUrl.searchParams.append('buyTokenPercentageFee', '0');

        // 【最終核心修正】強制只使用支援 Permit2 的流動性來源
        quoteUrl.searchParams.append('includedSources', 'Uniswap_V3,Curve,Balancer_V2,MakerPsm');

        const apiResponse = await fetch(quoteUrl.toString(), {
            headers: { '0x-api-key': apiKey, '0x-version': 'v2' },
        });

        const responseBodyText = await apiResponse.text();
        
        // 無論成功或失敗，都將最原始的回應傳回給前端
        return res.status(apiResponse.status).send(responseBodyText);

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: '後端代理網路錯誤',
            details: error.message,
        });
    }
};

