// Vercel Serverless Function
// 這段程式碼會在 Vercel 的伺服器上運行，而不是在您的瀏覽器中

export default async function handler(request, response) {
  // 從前端請求的 URL 中獲取所有查詢參數
  // 例如：?chainId=137&sellToken=...
  const queryString = request.url.split('?')[1];
  
  if (!queryString) {
    return response.status(400).json({ error: 'Missing query parameters' });
  }

  // 您的 API Key，儲存在伺服器端更安全
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

    // 檢查 0x API 是否回傳錯誤
    if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        // 將 0x 的錯誤訊息回傳給前端
        return response.status(apiResponse.status).json(errorData);
    }
    
    // 如果成功，將 0x 的回傳結果回傳給前端
    const data = await apiResponse.json();
    response.status(200).json(data);

  } catch (error) {
    console.error('Error fetching from 0x API:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
}
