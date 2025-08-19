// Service để decode phone token từ Zalo
export class ZaloPhoneService {
  private static readonly ZALO_API_BASE = "https://openapi.zalo.me";

  /**
   * Tạo access token từ app credentials
   * @returns Access token cho Zalo API
   */
  private static generateAccessToken(): string {
    const appId = import.meta.env.VITE_ZMA_APP_ID;
    const appSecret = import.meta.env.VITE_ZMA_APP_SECRET;

    if (!appId || !appSecret) {
      throw new Error(
        "Missing ZMA_APP_ID or ZMA_APP_SECRET in environment variables"
      );
    }

    // Thử các format access token khác nhau
    console.log("🔍 DEBUG - App ID:", appId);
    console.log("🔍 DEBUG - App Secret:", appSecret?.substring(0, 10) + "...");

    // Format 1: app_id|app_secret (most common)
    return `${appId}|${appSecret}`;
  }

  /**
   * Decode phone token từ Zalo API
   * @param token Token nhận được từ getPhoneNumber()
   * @returns Phone number string hoặc null
   */
  static async decodePhoneToken(token: string): Promise<string | null> {
    try {
      const accessToken = this.generateAccessToken();
      console.log("🔍 DEBUG - Using access token:", accessToken);
      console.log("🔍 DEBUG - Phone token to decode:", token);

      // Thử endpoint chính thức cho phone number
      const response = await fetch(`${this.ZALO_API_BASE}/v2.0/me/phone`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        // Gửi phone_token as query parameter
      });

      // Nếu GET không work, thử POST
      if (!response.ok) {
        console.log("🔍 DEBUG - GET failed, trying POST method...");

        const postResponse = await fetch(
          `${this.ZALO_API_BASE}/v2.0/me/phone`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              phone_token: token,
              access_token: accessToken,
            }),
          }
        );

        if (!postResponse.ok) {
          const errorText = await postResponse.text();
          console.error("🔍 DEBUG - Zalo API error:", {
            status: postResponse.status,
            statusText: postResponse.statusText,
            error: errorText,
          });
          return null;
        }

        const postData = await postResponse.json();
        console.log("🔍 DEBUG - POST response:", postData);

        return postData.data?.phone || postData.phone || null;
      }

      const data = await response.json();
      console.log("🔍 DEBUG - GET response:", data);

      return data.data?.phone || data.phone || null;
    } catch (error) {
      console.error("🔍 DEBUG - Error decoding phone token:", error);
      return null;
    }
  }

  /**
   * Thử decode bằng các endpoint khác nhau
   * @param token Phone token
   * @returns Phone number hoặc null
   */
  static async tryMultipleEndpoints(token: string): Promise<string | null> {
    const accessToken = this.generateAccessToken();

    // Danh sách các endpoint để thử
    const endpoints = [
      {
        name: "Graph API - me/phone",
        url: `https://graph.zalo.me/v2.0/me/phone`,
        method: "GET",
        headers: { access_token: accessToken, phone_token: token },
      },
      {
        name: "OpenAPI - me/phone",
        url: `${this.ZALO_API_BASE}/v2.0/me/phone`,
        method: "POST",
        body: { phone_token: token, access_token: accessToken },
      },
      {
        name: "OpenAPI - phone/decode",
        url: `${this.ZALO_API_BASE}/v2.0/phone/decode`,
        method: "POST",
        body: { token: token, access_token: accessToken },
      },
      {
        name: "Graph API - phone/verify",
        url: `https://graph.zalo.me/v2.0/phone/verify`,
        method: "POST",
        body: { phone_token: token, access_token: accessToken },
      },
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 DEBUG - Trying ${endpoint.name}...`);

        let response: Response;

        if (endpoint.method === "GET") {
          const urlWithParams = new URL(endpoint.url);
          Object.entries(endpoint.headers || {}).forEach(([key, value]) => {
            urlWithParams.searchParams.append(key, value);
          });

          response = await fetch(urlWithParams.toString(), {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
        } else {
          response = await fetch(endpoint.url, {
            method: endpoint.method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(endpoint.body),
          });
        }

        console.log(`🔍 DEBUG - ${endpoint.name} status:`, response.status);

        if (response.ok) {
          const data = await response.json();
          console.log(`🔍 DEBUG - ${endpoint.name} success:`, data);

          const phone =
            data.data?.phone || data.phone || data.data?.number || data.number;
          if (phone) {
            console.log(`✅ Found phone with ${endpoint.name}:`, phone);
            return phone;
          }
        } else {
          const errorText = await response.text();
          console.log(`🔍 DEBUG - ${endpoint.name} error:`, errorText);
        }
      } catch (error) {
        console.log(`🔍 DEBUG - ${endpoint.name} exception:`, error);
      }
    }

    console.log("🔍 DEBUG - All endpoints failed");
    return null;
  }

  /**
   * Mock decode cho development (tạm thời)
   * Trong production cần backend thật sự để xử lý
   */
  static mockDecodePhone(token: string): string {
    // Tạm thời trả về số fake cho development
    const mockPhones = ["0123456789", "0987654321", "0369258147", "0147258369"];

    // Dùng token để tạo index "random" nhưng consistent
    const index = token.length % mockPhones.length;
    return mockPhones[index];
  }
}
