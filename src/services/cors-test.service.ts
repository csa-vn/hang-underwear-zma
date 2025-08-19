// Service để test CORS policy và server accessibility
export class CORSTestService {
  /**
   * Test CORS policy với các servers khác nhau
   */
  static async testCORSPolicy(): Promise<void> {
    console.log("\n🚀 TESTING CORS POLICY FOR DIFFERENT SERVERS");

    const testServers = [
      {
        name: "Google Apps Script (Fake URL)",
        url: "https://script.google.com/macros/s/test/exec",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "cors" }),
        expected: "Should work (Google allows CORS)",
      },
      {
        name: "Zalo OpenAPI",
        url: "https://openapi.zalo.me/v2.0/me/info",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "cors" }),
        expected: "Should fail (CORS blocked)",
      },
      {
        name: "Zalo Graph API",
        url: "https://graph.zalo.me/v2.0/me/phone",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "cors" }),
        expected: "Should fail (CORS blocked)",
      },
      {
        name: "JSONPlaceholder (Public API)",
        url: "https://jsonplaceholder.typicode.com/posts",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "test", body: "cors test" }),
        expected: "Should work (Public API with CORS)",
      },
      {
        name: "HTTPBIN (Testing Service)",
        url: "https://httpbin.org/post",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "cors" }),
        expected: "Should work (CORS enabled)",
      },
      {
        name: "Your Member Google Sheets Webhook",
        url: import.meta.env.VITE_MEMBER_WEBHOOK_URL || "",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "cors", userId: "test" }),
        expected: "Should work (Your working webhook)",
      },
      {
        name: "Your Sheet Google Sheets Webhook",
        url: import.meta.env.VITE_SHEET_WEBHOOK_URL || "",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "cors", userId: "test" }),
        expected: "Should work (Your working webhook)",
      },
    ];

    for (const server of testServers) {
      if (!server.url) {
        console.log(`❌ SKIP - ${server.name}: No URL configured`);
        continue;
      }

      try {
        console.log(`\n🔍 Testing: ${server.name}`);
        console.log(`📍 URL: ${server.url}`);
        console.log(`🎯 Expected: ${server.expected}`);

        const startTime = Date.now();

        const response = await fetch(server.url, {
          method: server.method,
          headers: server.headers,
          body: server.body,
        });

        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`✅ SUCCESS - ${server.name}:`);
        console.log(`   Status: ${response.status} ${response.statusText}`);
        console.log(`   Duration: ${duration}ms`);
        console.log(`   CORS: Allowed by browser`);

        // Try to read response
        try {
          const responseText = await response.text();
          const preview = responseText.substring(0, 200);
          console.log(
            `   Response preview: ${preview}${
              responseText.length > 200 ? "..." : ""
            }`
          );
        } catch (e) {
          console.log(`   Response: Could not read body`);
        }
      } catch (error: any) {
        console.log(`❌ FAIL - ${server.name}:`);
        console.log(`   Error: ${error.message}`);

        if (error.message.includes("fetch")) {
          console.log(`   Reason: CORS Policy Blocked`);
          console.log(`   Details: Browser prevented cross-origin request`);
        } else if (error.message.includes("network")) {
          console.log(`   Reason: Network Error`);
        } else {
          console.log(`   Reason: Other Error`);
        }

        console.log(`   Error Type: ${error.constructor.name}`);
      }
    }

    console.log("\n📊 CORS TEST SUMMARY:");
    console.log("✅ Green = CORS Allowed, can be used as proxy");
    console.log("❌ Red = CORS Blocked, cannot be called directly from ZMA");
    console.log("\n💡 Recommendation:");
    console.log("- Use servers that show ✅ SUCCESS for phone token proxy");
    console.log("- Avoid servers that show ❌ CORS Policy Blocked");
  }

  /**
   * Test authentication requirements
   */
  static async testAuthRequirements(): Promise<void> {
    console.log("\n🔐 TESTING AUTHENTICATION REQUIREMENTS");

    const authTests = [
      {
        name: "Zalo API without auth",
        url: "https://openapi.zalo.me/v2.0/me/info",
        headers: {},
        expected: "Should return 401/403 (Auth required)",
      },
      {
        name: "Zalo API with access_token",
        url: "https://openapi.zalo.me/v2.0/me/info",
        headers: {},
        body: { access_token: "test_token" },
        expected: "Should return specific error format",
      },
      {
        name: "Google Apps Script",
        url: import.meta.env.VITE_MEMBER_WEBHOOK_URL || "",
        headers: {},
        expected: "No auth required",
      },
    ];

    for (const test of authTests) {
      if (!test.url) continue;

      try {
        console.log(`\n🔍 Testing Auth: ${test.name}`);

        const response = await fetch(test.url, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...test.headers },
          body: JSON.stringify(test.body || { test: "auth" }),
        });

        const responseText = await response.text();
        console.log(`Status: ${response.status}`);
        console.log(`Auth Response: ${responseText.substring(0, 300)}`);
      } catch (error: any) {
        console.log(`❌ Auth Test Failed: ${error.message}`);
      }
    }
  }
}
