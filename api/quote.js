export default async function handler(request) {
    // 建立一個新的 URL 物件來處理從前端傳來的查詢參數
    const incomingUrl = new URL(request.url);
    const params = incomingUrl.searchParams;

    // 堅持使用最新的 v2 端點
    const quoteUrl = new URL('https://api.0x.org/swap/permit2/quote');

    // 將所有從前端收到的參數附加到 0x API 的 URL 上
    params.forEach((value, key) => {
        quoteUrl.searchParams.append(key, value);
    });

    // 您的 0x API 金鑰
    const apiKey = 'd934b953-65b4-4e0c-8935-ac203f634f9b';

    try {
        // 向 0x API 發送請求
        const apiResponse = await fetch(quoteUrl.toString(), {
            headers: {
                '0x-api-key': apiKey,
                '0x-version': 'v2', // 堅持使用 v2 標頭
            },
        });

        // 【核心修正】無論 0x API 回應什麼，都先嘗試將其作為文字讀取
        const responseBodyText = await apiResponse.text();
        
        // 準備一個回傳給前端的 Response 物件
        // 先設定好正確的標頭，確保前端可以跨來源存取
        const headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        };

        try {
            // 嘗試將讀取到的文字解析為 JSON
            const data = JSON.parse(responseBodyText);
            // 如果成功解析，就將解析後的 JSON 和原始的狀態碼一起回傳
            return new Response(JSON.stringify(data), {
                status: apiResponse.status,
                headers: headers,
            });
        } catch (e) {
            // 如果解析失敗（代表 0x API 回傳的不是 JSON，例如 HTML 錯誤頁面）
            // 我們就自己建立一個錯誤物件，將原始的文字內容和狀態碼打包成 JSON 回傳
            const errorPayload = {
                error: "上游 API 回應格式錯誤",
                statusCode: apiResponse.status,
                details: responseBodyText,
            };
            // 即使是錯誤，也用一個 200 的成功狀態回傳，但內容是我們的錯誤訊息
            // 這樣可以避免前端出現網路層級的解析錯誤
            return new Response(JSON.stringify(errorPayload), {
                status: 200, // 故意回傳 200，讓前端的 fetch().then() 可以繼續處理
                headers: headers,
            });
        }

    } catch (error) {
        // 處理 fetch 本身失敗的網路錯誤
        return new Response(JSON.stringify({ error: '後端代理網路錯誤', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

