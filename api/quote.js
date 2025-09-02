// 使用 module.exports 以符合 Vercel 的 Node.js 執行環境
module.exports = async (req, res) => {
    // 建立一個 URL 物件來解析前端傳來的參數
    const incomingUrl = new URL(req.url, `http://${req.headers.host}`);
    const params = incomingUrl.searchParams;

    // 堅持使用 v2 端點
    const quoteUrl = new URL('https://api.0x.org/swap/permit2/quote');

    // 將前端傳來的所有參數附加到 0x API 的 URL 上
    params.forEach((value, key) => {
        quoteUrl.searchParams.append(key, value);
    });

    const apiKey = 'd934b953-65b4-4e0c-8935-ac203f634f9b';
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    };

    try {
        const apiResponse = await fetch(quoteUrl.toString(), {
            headers: {
                '0x-api-key': apiKey,
                '0x-version': 'v2',
            },
        });

        const responseBodyText = await apiResponse.text();

        // 如果 0x API 回應不成功 (例如 400, 500 錯誤)
        // 我們將錯誤訊息妥善打包成一個合法的 JSON 再回傳給前端
        if (!apiResponse.ok) {
            const errorPayload = {
                error: true,
                statusCode: apiResponse.status,
                message: "0x API 請求失敗",
                details: responseBodyText, // 這裡包含了來自 0x 的最原始錯誤訊息
            };
            return res.status(200).json(errorPayload); // 注意：即使出錯，我們也回傳 200，讓前端能正常解析
        }
        
        // 如果成功，直接將 0x API 的成功回應 (純文字) 傳回
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(responseBodyText);

    } catch (error) {
        // 處理 fetch 本身失敗的網路錯誤 (例如 Vercel 無法連上 0x)
        const errorPayload = {
            error: true,
            message: '後端代理網路錯誤',
            details: error.message,
        };
        return res.status(200).json(errorPayload);
    }
};

