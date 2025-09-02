// Vercel Serverless Function
// 這段程式碼會在 Vercel 的伺服器上運行，而不是在您的瀏覽器中

export default async function handler(request, response) {
  // 從前端請求的 URL 中獲取所有查詢參數
  const queryString = request.url.split('?')[1];
  
  if (!queryString) {
    return response.status(400).json({ error: 'Missing query parameters' });
  }

  // 您的 API Key
  const OX_API_KEY = 'd934b953-65b4-4e0c-8935-ac203f634f9b';
  
  // 建立要發送到 0x API 的目標 URL
  const targetUrl = `https://api.0x.org/swap/permit2/quote?${queryString}`;

  try {
    // 從我們的 Vercel 伺服器發送到 0x 伺服器
    const apiResponse = await fetch(targetUrl, {
      headers: {
        '0x-api-key': OX_API_KEY,
        '0x-version': 'v2',
      },
    });

    const responseBody = await apiResponse.text();

    // 無論 0x API 回應成功或失敗，都設定 CORS 標頭允許前端存取
    response.setHeader('Access-Control-Allow-Origin', '*');
    
    // 嘗試將回應解析為 JSON
    try {
      const jsonData = JSON.parse(responseBody);
      // 將 0x 的原始狀態碼和 JSON 內容回傳給前端
      return response.status(apiResponse.status).json(jsonData);
    } catch (e) {
      // 如果回應不是 JSON，直接將純文字內容回傳
      return response.status(apiResponse.status).send(responseBody);
    }

  } catch (error) {
    console.error('代理函數內部錯誤:', error);
    response.status(500).json({ error: '代理伺服器發生內部錯誤' });
  }
}

