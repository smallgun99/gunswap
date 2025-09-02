export default async function handler(request) {
    const url = new URL(request.url);
    const params = url.searchParams;

    // 堅持使用最新的 v2 端點
    const quoteUrl = new URL('https://api.0x.org/swap/permit2/quote');

    params.forEach((value, key) => {
        quoteUrl.searchParams.append(key, value);
    });

    const apiKey = 'd934b953-65b4-4e0c-8935-ac203f634f9b';

    try {
        const apiResponse = await fetch(quoteUrl.toString(), {
            headers: {
                '0x-api-key': apiKey,
                '0x-version': 'v2', // 堅持使用 v2 標頭
            },
        });

        const data = await apiResponse.json();

        // 無論成功或失敗，都將原始回應和狀態碼回傳給前端
        return new Response(JSON.stringify(data), {
            status: apiResponse.status,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // 確保 CORS 沒問題
            },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: '內部伺服器錯誤', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

