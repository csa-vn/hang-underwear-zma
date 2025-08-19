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
   * Test với user access token thay vì app credentials
   * @param token Phone token từ getPhoneNumber()
   * @returns Response details hoặc error
   */
  static async testWithUserToken(token: string): Promise<any> {
    console.log("🔍 DEBUG - Testing with user access token from ZMP_TOKEN");

    const zmpToken = import.meta.env.ZMP_TOKEN;
    const appSecret = import.meta.env.VITE_ZMA_APP_SECRET;

    if (!zmpToken) {
      console.log("❌ No ZMP_TOKEN found in environment");
      return { success: false, message: "No ZMP_TOKEN available" };
    }

    console.log("🔍 DEBUG - ZMP Token:", zmpToken?.substring(0, 20) + "...");
    console.log("🔍 DEBUG - Phone Token:", token);
    console.log("🔍 DEBUG - App Secret:", appSecret?.substring(0, 10) + "...");

    const userTokenEndpoints = [
      {
        name: "With ZMP_TOKEN as user_access_token",
        url: "https://graph.zalo.me/v2.0/me/info",
        method: "GET" as const,
        headers: {
          access_token: zmpToken, // User access token from ZMP
          code: token, // Phone token
          secret_key: appSecret, // App secret
        },
      },
    ];

    for (const endpoint of userTokenEndpoints) {
      try {
        console.log(`
🔍 DEBUG - Testing: ${endpoint.name}`);
        console.log(`📍 URL: ${endpoint.url}`);
        console.log(`📋 Method: ${endpoint.method}`);
        console.log(`📤 Headers:`, endpoint.headers);

        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: endpoint.headers,
        });

        console.log(`🔍 DEBUG - ${endpoint.name} Status:`, response.status);
        console.log(
          `🔍 DEBUG - ${endpoint.name} Status Text:`,
          response.statusText
        );

        const responseText = await response.text();
        console.log(`🔍 DEBUG - ${endpoint.name} Raw Response:`, responseText);

        try {
          const data = JSON.parse(responseText);
          console.log(`📋 DEBUG - ${endpoint.name} Parsed Response:`, data);

          if (data.error) {
            console.log(`❌ API Error ${data.error}: ${data.message}`);
            return { success: false, endpoint: endpoint.name, error: data };
          } else {
            console.log(`✅ SUCCESS - ${endpoint.name} Response:`, data);
            return { success: true, endpoint: endpoint.name, data };
          }
        } catch (e) {
          console.log(`🔍 DEBUG - Non-JSON response:`, responseText);
          return {
            success: false,
            endpoint: endpoint.name,
            rawResponse: responseText,
          };
        }
      } catch (fetchError: any) {
        console.log(`💥 FETCH ERROR - ${endpoint.name}:`, fetchError);
        console.log(
          `🔍 DEBUG - Error message:`,
          fetchError?.message || "Unknown error"
        );
      }
    }

    return { success: false, message: "All user token tests failed" };
  }

  /**
   * Test với format chính thức từ Zalo Docs
   * @param token Phone token từ getPhoneNumber()
   * @returns Response details hoặc error
   */
  static async testOfficialZaloAPI(token: string): Promise<any> {
    const appId = import.meta.env.VITE_ZMA_APP_ID;
    const appSecret = import.meta.env.VITE_ZMA_APP_SECRET;

    console.log("🔍 DEBUG - Testing OFFICIAL Zalo API format from docs");
    console.log("🔍 DEBUG - App ID:", appId);
    console.log("🔍 DEBUG - App Secret:", appSecret?.substring(0, 10) + "...");
    console.log("🔍 DEBUG - Phone Token:", token);

    // Format theo docs: https://miniapp.zaloplatforms.com/documents/api/getPhoneNumber/
    const officialEndpoints = [
      {
        name: "Official Zalo Docs Format - me/info",
        url: "https://graph.zalo.me/v2.0/me/info",
        method: "GET" as const,
        headers: {
          access_token: `${appId}|${appSecret}`, // user_access_token format
          code: token, // your token (phone token)
          secret_key: appSecret, // your zalo app secret key
        },
      },
      {
        name: "Official Zalo Docs Format - me/phone",
        url: "https://graph.zalo.me/v2.0/me/phone",
        method: "GET" as const,
        headers: {
          access_token: `${appId}|${appSecret}`,
          code: token,
          secret_key: appSecret,
        },
      },
    ];

    for (const endpoint of officialEndpoints) {
      try {
        console.log(`\n🔍 DEBUG - Testing: ${endpoint.name}`);
        console.log(`📍 URL: ${endpoint.url}`);
        console.log(`📋 Method: ${endpoint.method}`);
        console.log(`📤 Headers:`, endpoint.headers);

        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: endpoint.headers,
        });

        console.log(`🔍 DEBUG - ${endpoint.name} Status:`, response.status);
        console.log(
          `🔍 DEBUG - ${endpoint.name} Status Text:`,
          response.statusText
        );

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ SUCCESS - ${endpoint.name} Response:`, data);
          return { success: true, endpoint: endpoint.name, data };
        } else {
          const errorText = await response.text();
          console.log(`❌ ERROR - ${endpoint.name} Error Response:`, errorText);

          try {
            const errorJson = JSON.parse(errorText);
            console.log(`🔍 DEBUG - ${endpoint.name} Parsed Error:`, errorJson);
          } catch (e) {
            console.log(
              `🔍 DEBUG - ${endpoint.name} Raw Error Text:`,
              errorText
            );
          }
        }
      } catch (fetchError: any) {
        console.log(`💥 FETCH ERROR - ${endpoint.name}:`, fetchError);
        console.log(
          `🔍 DEBUG - Error message:`,
          fetchError?.message || "Unknown error"
        );

        if (fetchError?.message?.includes("fetch")) {
          console.log(`🔍 DEBUG - Likely CORS error for ${endpoint.name}`);
          console.log(`🔍 DEBUG - This is expected in ZMA environment`);
        }
      }
    }

    return { success: false, message: "All official endpoints failed" };
  }

  /**
   * Test trực tiếp Zalo Open API để xem response (dù bị CORS)
   * @param token Phone token từ getPhoneNumber()
   * @returns Response details hoặc error
   */
  static async testZaloOpenAPI(token: string): Promise<any> {
    const accessToken = this.generateAccessToken();
    console.log("🔍 DEBUG - Testing direct Zalo Open API call");
    console.log("🔍 DEBUG - Access Token:", accessToken);
    console.log("🔍 DEBUG - Phone Token:", token);

    const endpoints = [
      {
        name: "OpenAPI v2.0/me/info with phone_token",
        url: `${this.ZALO_API_BASE}/v2.0/me/info`,
        payload: { phone_token: token, access_token: accessToken },
      },
      {
        name: "Graph API v2.0/me/phone",
        url: "https://graph.zalo.me/v2.0/me/phone",
        payload: { phone_token: token, access_token: accessToken },
      },
      {
        name: "OpenAPI v2.0/me/phone",
        url: `${this.ZALO_API_BASE}/v2.0/me/phone`,
        payload: { phone_token: token, access_token: accessToken },
      },
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`\n🔍 DEBUG - Testing: ${endpoint.name}`);
        console.log(`🔍 DEBUG - URL: ${endpoint.url}`);
        console.log(`🔍 DEBUG - Payload:`, endpoint.payload);

        const response = await fetch(endpoint.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(endpoint.payload),
        });

        console.log(`🔍 DEBUG - ${endpoint.name} Status:`, response.status);
        console.log(
          `🔍 DEBUG - ${endpoint.name} Status Text:`,
          response.statusText
        );

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ SUCCESS - ${endpoint.name} Response:`, data);
          return { success: true, endpoint: endpoint.name, data };
        } else {
          const errorText = await response.text();
          console.log(`❌ ERROR - ${endpoint.name} Error Response:`, errorText);

          try {
            const errorJson = JSON.parse(errorText);
            console.log(`🔍 DEBUG - ${endpoint.name} Parsed Error:`, errorJson);
          } catch (e) {
            console.log(
              `🔍 DEBUG - ${endpoint.name} Raw Error Text:`,
              errorText
            );
          }
        }
      } catch (fetchError: any) {
        console.log(`💥 FETCH ERROR - ${endpoint.name}:`, fetchError);
        console.log(
          `🔍 DEBUG - Error message:`,
          fetchError?.message || "Unknown error"
        );

        // Log chi tiết CORS error
        if (fetchError?.message?.includes("fetch")) {
          console.log(`🔍 DEBUG - Likely CORS error for ${endpoint.name}`);
          console.log(`🔍 DEBUG - This is expected in ZMA environment`);
        }
      }
    }

    return { success: false, message: "All endpoints failed" };
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
   * Test với User Access Token thay vì App Token
   * @param phoneToken Phone token từ zmp.getPhoneNumber()
   * @returns Test result
   */
  static async testWithUserToken(phoneToken: string): Promise<any> {
    console.log("🎯 Testing with User Access Token format...");

    try {
      // Thử lấy user access token từ zmp SDK
      const zmp = (window as any).zmp;
      let userToken = null;

      try {
        const tokenResult = await zmp.getAccessToken();
        userToken = tokenResult?.access_token || tokenResult?.token;
        console.log("🔍 DEBUG - User token from zmp:", userToken);
      } catch (tokenError) {
        console.log("🔍 DEBUG - Cannot get user token:", tokenError);
      }

      // Nếu không có user token, thử format khác
      if (!userToken) {
        console.log(
          "🔍 DEBUG - No user token, trying phone token as access token..."
        );
        userToken = phoneToken;
      }

      const url = "https://graph.zalo.me/v2.0/me/info";

      const response = await fetch(url, {
        method: "GET",
        headers: {
          access_token: userToken,
          code: phoneToken,
          secret_key: import.meta.env.VITE_ZMA_APP_SECRET,
        },
      });

      console.log("🔍 DEBUG - User Token Test Status:", response.status);
      console.log(
        "🔍 DEBUG - User Token Test Status Text:",
        response.statusText
      );

      const data = await response.json();
      console.log("🔍 DEBUG - User Token Test Response:", data);

      return {
        success: response.ok,
        endpoint: "User Token Test - me/info",
        data: data,
        userToken: userToken,
        phoneToken: phoneToken,
      };
    } catch (error) {
      console.error("❌ User Token Test Error:", error);
      return {
        success: false,
        endpoint: "User Token Test - me/info",
        error: error,
        data: null,
      };
    }
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
