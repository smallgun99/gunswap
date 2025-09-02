export default async function handler(request) {
    // 準備一個簡單、固定的回傳資料
    const data = {
        message: "後端代理運作正常！",
        timestamp: new Date().toISOString(),
    };

    // 回傳一個保證格式正確的 JSON Response
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    });
}

