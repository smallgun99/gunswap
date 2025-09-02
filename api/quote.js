export default async function handler(request) {
    const incomingUrl = new URL(request.url);
    const params = incomingUrl.searchParams;

    // 堅持使用 v2 端點
    const quoteUrl = new URL('https://api.0x.org/swap/permit2/quote');

    params.forEach((value, key) => {
        quoteUrl.searchParams.append(key, value);
    });

    const apiKey = 'd934b953-65b4-4e0c-8935-ac203f634f9b';

    try {
        const apiResponse = await fetch(quoteUrl.toString(), {
            headers: {
                '0x-api-key': apiKey,
                '0x-version': 'v2',
            },
        });

        const responseBodyText = await apiResponse.text();
        const headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        };

        // 【核心修正】如果 0x API 回應不成功 (e.g., 400, 500)
        if (!apiResponse.ok) {
            // 我們將錯誤訊息打包成一個合法的 JSON 回傳給前端
            const errorPayload = {
                error: true,
                statusCode: apiResponse.status,
                message: "0x API 請求失敗",
                details: responseBodyText,
            };
            // 即使是錯誤，也回傳 200，讓前端可以正常解析
            return new Response(JSON.stringify(errorPayload), { status: 200, headers });
        }
        
        // 如果成功，直接將 0x API 的成功回應傳回
        // 因為 responseBodyText 已經是合法的 JSON 字串，直接回傳即可
        return new Response(responseBodyText, { status: 200, headers });

    } catch (error) {
        // 處理 fetch 本身失敗的網路錯誤
        const errorPayload = {
            error: true,
            message: '後端代理網路錯誤',
            details: error.message,
        };
        return new Response(JSON.stringify(errorPayload), { status: 200, headers });
    }
}

