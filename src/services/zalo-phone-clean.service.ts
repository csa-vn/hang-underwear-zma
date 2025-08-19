/**
 * Zalo Phone Service - Clean version without duplicate methods
 * Xử lý việc decode phone token từ Zalo Mini App API
 */
export class ZaloPhoneService {
  private static readonly ZALO_API_BASE = "https://openapi.zalo.me";
  private static readonly GRAPH_API_BASE = "https://graph.zalo.me";

  /**
   * Tạo access token từ app credentials (app_id|app_secret format)
   */
  static generateAccessToken(): string {
    const appId = import.meta.env.VITE_ZMA_APP_ID;
    const appSecret = import.meta.env.VITE_ZMA_APP_SECRET;

    if (!appId || !appSecret) {
      console.warn("⚠️ Missing app credentials in environment variables");
      return "";
    }

    return `${appId}|${appSecret}`;
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
          access_token: `${appId}|${appSecret}`, // App credentials format
          code: token, // Phone token from getPhoneNumber()
          secret_key: appSecret, // App secret key
        },
      },
    ];

    for (const endpoint of officialEndpoints) {
      try {
        console.log(`
🔍 DEBUG - Testing: ${endpoint.name}`);
        console.log(`📍 URL: ${endpoint.url}`);
        console.log(`📋 Method: ${endpoint.method}`);
        console.log(`📤 Headers:`, endpoint.headers);

        // 🌐 Network logging for easier debugging
        console.log(`
🌐 === NETWORK REQUEST INFO ===
📍 URL: ${endpoint.url}
📋 Method: ${endpoint.method}
📤 Headers:
   access_token: ${endpoint.headers.access_token?.substring(0, 30)}...
   code: ${endpoint.headers.code?.substring(0, 50)}...
   secret_key: ${endpoint.headers.secret_key?.substring(0, 10)}...

🔍 Full curl command equivalent:
curl --location --request ${endpoint.method} '${endpoint.url}' \\
--header 'access_token: ${endpoint.headers.access_token}' \\
--header 'code: ${endpoint.headers.code}' \\
--header 'secret_key: ${endpoint.headers.secret_key}'

🌐 Network Tab: Look for this request in DevTools → Network tab
`);

        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: endpoint.headers as HeadersInit,
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
          } else {
            console.log(`✅ SUCCESS - ${endpoint.name} Response:`, data);
          }

          return { success: response.ok, endpoint: endpoint.name, data };
        } catch (e) {
          console.log(`🔍 DEBUG - Non-JSON response:`, responseText);
          return {
            success: response.ok,
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
        return { success: false, endpoint: endpoint.name, error: fetchError };
      }
    }

    return { success: false, message: "All official format tests failed" };
  }

  /**
   * 🕵️‍♂️ Session Debugger - Kiểm tra trạng thái session chi tiết
   * @returns Session diagnostic information
   */
  static async debugZaloSession(): Promise<any> {
    console.log("\n🕵️‍♂️ === ZALO SESSION DEBUGGER ===");
    
    const sessionInfo: any = {
      timestamp: new Date().toISOString(),
      userInfo: null,
      accessToken: null,
      phoneNumber: null,
      phoneToken: null,
      scopes: null,
      environment: {},
      errors: []
    };

    try {
      // 1. Check ZMP SDK availability - multiple methods
      let zmp = (window as any).zmp;
      console.log("🔍 1A. ZMP from window:", !!zmp);
      
      // Try import method if window method fails
      if (!zmp) {
        try {
          console.log("🔍 1B. Trying import method...");
          zmp = (await import("zmp-sdk")).default;
          console.log("🔍 1B. ZMP from import:", !!zmp);
        } catch (importError) {
          console.log("🔍 1B. Import failed:", importError);
        }
      }

      // Try global variable
      if (!zmp && typeof window !== 'undefined') {
        console.log("🔍 1C. Checking global variables...");
        zmp = (window as any).ZMP || (window as any).zaloMiniProgram;
        console.log("🔍 1C. ZMP from global:", !!zmp);
      }
      
      console.log("🔍 ZMP Methods:", zmp ? Object.keys(zmp) : "No ZMP");
      
      if (!zmp) {
        sessionInfo.errors.push("ZMP SDK not available via any method");
        console.log("❌ ZMP SDK not found via any method!");
        return sessionInfo;
      }

      // 2. Get User Info
      try {
        console.log("\n🔍 2. Getting User Info...");
        const userInfo = await zmp.getUserInfo();
        console.log("✅ User Info:", userInfo);
        sessionInfo.userInfo = userInfo.userInfo || userInfo;
      } catch (userError: any) {
        console.log("❌ User Info Error:", userError);
        sessionInfo.errors.push(`UserInfo: ${userError.message}`);
      }

      // 3. Get Access Token
      try {
        console.log("\n🔍 3. Getting Access Token...");
        const tokenResult = await zmp.getAccessToken();
        console.log("✅ Access Token Result:", tokenResult);
        sessionInfo.accessToken = tokenResult?.access_token || tokenResult?.token || tokenResult;
      } catch (tokenError: any) {
        console.log("❌ Access Token Error:", tokenError);
        sessionInfo.errors.push(`AccessToken: ${tokenError.message}`);
      }

      // 4. Get Phone Number/Token
      try {
        console.log("\n🔍 4. Getting Phone Number...");
        const phoneResult = await zmp.getPhoneNumber();
        console.log("✅ Phone Result:", phoneResult);
        sessionInfo.phoneNumber = phoneResult?.number;
        sessionInfo.phoneToken = phoneResult?.token;
      } catch (phoneError: any) {
        console.log("❌ Phone Error:", phoneError);
        sessionInfo.errors.push(`Phone: ${phoneError.message}`);
      }

      // 5. Check Authorization Scopes
      try {
        console.log("\n🔍 5. Checking Authorization Status...");
        // Try to get current authorization status if available
        if (zmp.getAuthorizationStatus) {
          const authStatus = await zmp.getAuthorizationStatus();
          console.log("✅ Auth Status:", authStatus);
          sessionInfo.scopes = authStatus;
        } else {
          console.log("⚠️ getAuthorizationStatus not available");
        }
      } catch (scopeError: any) {
        console.log("❌ Scope Error:", scopeError);
        sessionInfo.errors.push(`Scopes: ${scopeError.message}`);
      }

      // 6. Environment Variables
      sessionInfo.environment = {
        APP_ID: import.meta.env.VITE_ZMA_APP_ID,
        APP_SECRET: import.meta.env.VITE_ZMA_APP_SECRET?.substring(0, 10) + "...",
        ZMP_TOKEN: import.meta.env.ZMP_TOKEN?.substring(0, 20) + "...",
        OA_ID: import.meta.env.VITE_OFFICIAL_ACCOUNT_ID
      };
      console.log("\n🔍 6. Environment:", sessionInfo.environment);

      // 7. Session Summary
      console.log("\n📋 === SESSION SUMMARY ===");
      console.log("👤 User logged in:", !!sessionInfo.userInfo?.id);
      console.log("🔑 Has access token:", !!sessionInfo.accessToken);
      console.log("📱 Has phone token:", !!sessionInfo.phoneToken);
      console.log("❌ Errors count:", sessionInfo.errors.length);
      
      if (sessionInfo.errors.length > 0) {
        console.log("🔍 Errors:", sessionInfo.errors);
      }

      return sessionInfo;

    } catch (globalError: any) {
      console.log("💥 Global Debug Error:", globalError);
      sessionInfo.errors.push(`Global: ${globalError.message}`);
      return sessionInfo;
    }
  }

  /**
   * 🔄 Force Re-authorization with specific scopes
   * @returns Authorization result
   */
  static async forceReauthorize(): Promise<any> {
    console.log("\n🔄 === FORCING RE-AUTHORIZATION ===");
    
    try {
      // Try multiple ways to get ZMP SDK
      let zmp = (window as any).zmp;
      
      if (!zmp) {
        try {
          zmp = (await import("zmp-sdk")).default;
          console.log("🔍 DEBUG - Using imported zmp-sdk for re-auth");
        } catch (e) {
          console.log("🔍 DEBUG - Import failed, trying global variables");
          zmp = (window as any).ZMP || (window as any).zaloMiniProgram;
        }
      }

      if (!zmp) {
        return { success: false, error: "ZMP SDK not available for re-authorization" };
      }
      
      // Clear any cached session first
      try {
        if (zmp.clearSession) await zmp.clearSession();
        if (zmp.logout) await zmp.logout();
      } catch (e) {
        console.log("🔍 No clear session method available");
      }

      // Force authorization with all required scopes
      const authResult = await zmp.authorize({
        scopes: [
          "scope.userInfo", 
          "scope.userPhonenumber",
          "scope.userLocation", // Additional scope that might be needed
        ]
      });
      
      console.log("✅ Re-authorization result:", authResult);
      
      // Get fresh user info
      const userInfo = await zmp.getUserInfo();
      console.log("✅ Fresh user info:", userInfo);
      
      return { success: true, authResult, userInfo };
      
    } catch (error: any) {
      console.log("❌ Re-authorization failed:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test với User Access Token thay vì App Token
   * @param phoneToken Phone token từ zmp.getPhoneNumber()
   * @returns Test result
   */
  static async testWithUserToken(phoneToken: string): Promise<any> {
    console.log("🎯 Testing with User Access Token format...");

    try {
      // Try multiple ways to get ZMP SDK
      let zmp = (window as any).zmp;
      
      if (!zmp) {
        try {
          zmp = (await import("zmp-sdk")).default;
          console.log("🔍 DEBUG - Using imported zmp-sdk");
        } catch (e) {
          console.log("🔍 DEBUG - Import failed, trying global variables");
          zmp = (window as any).ZMP || (window as any).zaloMiniProgram;
        }
      }

      if (!zmp) {
        return {
          success: false,
          endpoint: "User Token Test - me/info", 
          error: "ZMP SDK not available",
          data: null
        };
      }

      let userToken: string | null = null;

      try {
        const tokenResult = await zmp.getAccessToken();
        userToken = tokenResult?.access_token || tokenResult?.token;
        console.log("🔍 DEBUG - User token from zmp:", userToken);
      } catch (tokenError) {
        console.log("🔍 DEBUG - Cannot get user token:", tokenError);
      }

      // Nếu không có user token, thử dùng ZMP_TOKEN từ env
      if (!userToken) {
        console.log(
          "🔍 DEBUG - No user token from zmp, trying ZMP_TOKEN from env..."
        );
        userToken = import.meta.env.ZMP_TOKEN;
        console.log(
          "🔍 DEBUG - ZMP_TOKEN:",
          userToken?.substring(0, 20) + "..."
        );
      }

      // Nếu vẫn không có, dùng phone token như access token (test)
      if (!userToken) {
        console.log(
          "🔍 DEBUG - No ZMP_TOKEN, trying phone token as access token..."
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
        } as HeadersInit,
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
   * Test multiple formats và endpoints
   * @param token Phone token
   * @returns Response from successful endpoint
   */
  static async testZaloOpenAPI(token: string): Promise<any> {
    const accessToken = this.generateAccessToken();

    const endpoints = [
      {
        name: "Graph API - me/info",
        url: "https://graph.zalo.me/v2.0/me/info",
        method: "GET" as const,
        headers: {
          access_token: accessToken,
          code: token,
          secret_key: import.meta.env.VITE_ZMA_APP_SECRET,
        },
      },
      {
        name: "Open API - me/phone",
        url: "https://openapi.zalo.me/v2.0/me/phone",
        method: "POST" as const,
        body: {
          phone_token: token,
          access_token: accessToken,
        },
      },
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 DEBUG - Testing: ${endpoint.name}`);

        let response: Response;
        if (endpoint.method === "GET") {
          response = await fetch(endpoint.url, {
            method: endpoint.method,
            headers: endpoint.headers as HeadersInit,
          });
        } else {
          response = await fetch(endpoint.url, {
            method: endpoint.method,
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(endpoint.body),
          });
        }

        console.log(`🔍 DEBUG - ${endpoint.name} Status:`, response.status);
        const data = await response.json();
        console.log(`🔍 DEBUG - ${endpoint.name} Response:`, data);

        if (response.ok) {
          return { success: true, endpoint: endpoint.name, data };
        }
      } catch (error) {
        console.log(`🔍 DEBUG - ${endpoint.name} Error:`, error);
      }
    }

    return { success: false, message: "All endpoints failed" };
  }

  /**
   * Decode phone token thành số điện thoại
   * @param token Phone token từ getPhoneNumber()
   * @returns Phone number hoặc null
   */
  static async decodePhoneToken(token: string): Promise<string | null> {
    const accessToken = this.generateAccessToken();

    if (!accessToken) {
      console.error("🔍 DEBUG - Cannot generate access token");
      return null;
    }

    try {
      console.log("🔍 DEBUG - Decoding phone token:", token);
      console.log("🔍 DEBUG - Using access token:", accessToken);

      const url = `${this.GRAPH_API_BASE}/v2.0/me/phone`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          access_token: accessToken,
          phone_token: token,
        } as HeadersInit,
      });

      console.log("🔍 DEBUG - Response status:", response.status);
      console.log("🔍 DEBUG - Response headers:", response.headers);

      if (!response.ok) {
        // Try POST method as fallback
        console.log("🔍 DEBUG - GET failed, trying POST...");

        const postResponse = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone_token: token,
            access_token: accessToken,
          }),
        });

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
   * Mock decode cho development (tạm thời)
   */
  static mockDecodePhone(token: string): string {
    const mockPhones = ["0123456789", "0987654321", "0369258147", "0147258369"];
    const index = token.length % mockPhones.length;
    return mockPhones[index];
  }
}
