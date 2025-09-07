// Vercel Serverless Function, Node.js environment
// v2.1: A pure, robust proxy that only forwards requests without modification,
// precisely replicating the successful pattern observed from Oku.trade.
export default async function handler(req, res) {
    // 1. Correctly parse URL and search parameters from the incoming request from the frontend
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    const { searchParams } = requestUrl;

    const apiKey = process.env.OX_API_KEY;

    // 2. API Key check
    if (!apiKey) {
        return res.status(500).json({ error: true, message: "後端未設定 API Key" });
    }

    // 3. Use the one and only correct v2 endpoint and headers.
    const apiUrl = `https://api.0x.org/swap/permit2/quote?${searchParams}`;
    const headers = { 
        '0x-api-key': apiKey,
        '0x-version': 'v2' 
    };

    try {
        // 4. Use native fetch to perform the request
        const apiResponse = await fetch(apiUrl, { headers });
        const responseText = await apiResponse.text();
        const responseStatus = apiResponse.status;
        
        // 5. Robustly forward the response, ensuring it's always valid JSON for the frontend
        let responseBody;
        try {
            responseBody = JSON.parse(responseText);
        } catch (e) {
            return res.status(500).json({
                error: true,
                message: '0x API 回傳了無效的格式 (非 JSON)',
                details: responseText.slice(0, 500) // Return a snippet of the error
            });
        }
        
        res.status(responseStatus).json(responseBody);
        
    } catch (error) {
        // Handle network errors during the fetch itself
        res.status(500).json({
            error: true,
            message: '後端代理請求 0x API 時發生網路錯誤',
            details: error.message
        });
    }
}

