// Vercel Serverless Function, Node.js environment
// This is the definitive v2 proxy, built on all previous learnings.
export default async function handler(req, res) {
    // 1. Correctly parse URL and search parameters from the incoming request
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    const { searchParams } = requestUrl;

    // 2. 【核心修正】Add parameters to ensure a v2-compatible quote.
    // This forces the API to only look at liquidity sources that support Permit2.
    // This list can be expanded, but includes the most common sources on Polygon.
    searchParams.set('includedSources', 'Uniswap_V3,Sushiswap_V3,QuickSwap_V3');
    searchParams.set('slippagePercentage', '0.005'); // 0.5% slippage for robustness

    const apiKey = process.env.OX_API_KEY;

    // 3. API Key check
    if (!apiKey) {
        return res.status(500).json({ error: true, message: "後端未設定 API Key" });
    }

    // 4. Correct v2 API endpoint and headers. Note the `api.0x.org` host.
    const apiUrl = `https://api.0x.org/swap/permit2/quote?${searchParams}`;
    const headers = { 
        '0x-api-key': apiKey,
        '0x-version': 'v2'
    };

    try {
        // 5. Use native fetch to perform the request
        const apiResponse = await fetch(apiUrl, { headers });
        const responseText = await apiResponse.text(); // Get response as text first for safety
        const responseStatus = apiResponse.status;
        
        let responseBody;
        try {
            // Attempt to parse the text as JSON
            responseBody = JSON.parse(responseText);
        } catch (e) {
            // If parsing fails, it's not a valid JSON. Return a structured error.
            return res.status(500).json({
                error: true,
                message: '0x API 回傳了無效的格式 (非 JSON)',
                details: responseText.slice(0, 500) // Send a snippet of the raw response
            });
        }
        
        // Forward the valid JSON response from 0x API to the frontend
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

