// Service để decode phone token từ Zalo
export class ZaloPhoneService {
  private static readonly ZALO_API_BASE = "https://openapi.zalo.me";

  /**
   * Decode phone token từ Zalo
   * @param token Token nhận được từ getPhoneNumber()
   * @param accessToken App access token (cần có từ Zalo developer console)
   * @returns Phone number string hoặc null
   */
  static async decodePhoneToken(
    token: string,
    accessToken: string
  ): Promise<string | null> {
    try {
      const response = await fetch(`${this.ZALO_API_BASE}/v2.0/me/info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_token: token,
          access_token: accessToken,
        }),
      });

      if (!response.ok) {
        console.error(
          "Zalo API response not OK:",
          response.status,
          response.statusText
        );
        return null;
      }

      const data = await response.json();
      console.log("Zalo phone decode result:", data);

      return data.phone || data.data?.phone || null;
    } catch (error) {
      console.error("Error decoding Zalo phone token:", error);
      return null;
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
