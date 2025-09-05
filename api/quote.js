// Vercel Serverless Function, Node.js environment
// This is the definitive v2 proxy, based on a full review of our process.
// It returns to the state where we successfully fetched a quote, and adds slippage.
export default async function handler(req, res) {
    // 1. Correctly parse URL and search parameters
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    const { searchParams } = requestUrl;

    // 2. 【核心修正】Add ONLY the slippage parameter as per best practices.
    // This directly addresses one of the potential reasons for "transaction failed".
    searchParams.set('slippagePercentage', '0.005'); // 0.5% slippage

    const apiKey = process.env.OX_API_KEY;

    // 3. API Key check
    if (!apiKey) {
        return res.status(500).json({ error: true, message: "後端未設定 API Key" });
    }

    // 4. Use the correct v2 endpoint and headers
    const apiUrl = `https://api.0x.org/swap/permit2/quote?${searchParams}`;
    const headers = { 
        '0x-api-key': apiKey,
        '0x-version': 'v2' 
    };

    try {
        // 5. Perform the request using native fetch
        const apiResponse = await fetch(apiUrl, { headers });
        const responseText = await apiResponse.text();
        const responseStatus = apiResponse.status;
        
        // 6. Robustly forward the response
        let responseBody;
        try {
            responseBody = JSON.parse(responseText);
        } catch (e) {
            return res.status(500).json({
                error: true,
                message: '0x API 回傳了無效的格式 (非 JSON)',
                details: responseText.slice(0, 500)
            });
        }
        
        res.status(responseStatus).json(responseBody);
        
    } catch (error) {
        res.status(500).json({
            error: true,
            message: '後端代理請求 0x API 時發生網路錯誤',
            details: error.message
        });
    }
}

