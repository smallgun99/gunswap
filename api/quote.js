// Vercel Serverless Function, Node.js environment
// v2.3: Implements the professional API request structure by adding a fee parameter.
export default async function handler(req, res) {
    // 1. Correctly parse URL and search parameters from the incoming request from the frontend
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    const { searchParams } = requestUrl;

    // 2. 【v2.3 核心修正】為請求自動加入平台費用參數
    // This mimics professional dApps like Oku.trade to get a higher quality, executable quote.
    const takerAddress = searchParams.get('taker');
    if (takerAddress) {
        searchParams.set('feeRecipient', takerAddress); // Set the user as the fee recipient
        searchParams.set('buyTokenPercentageFee', '0.0001'); // Set a tiny, non-zero fee (0.01%)
    }
    
    const apiKey = process.env.OX_API_KEY;

    // 3. API Key check
    if (!apiKey) {
        return res.status(500).json({ error: true, message: "後端未設定 API Key" });
    }

    // 4. Use the one and only correct v2 endpoint and headers.
    const apiUrl = `https://api.0x.org/swap/permit2/quote?${searchParams}`;
    const headers = { 
        '0x-api-key': apiKey,
        '0x-version': 'v2' 
    };

    try {
        // 5. Use native fetch to perform the request
        const apiResponse = await fetch(apiUrl, { headers });
        const responseText = await apiResponse.text();
        const responseStatus = apiResponse.status;
        
        // 6. Robustly forward the response, ensuring it's always valid JSON for the frontend
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

