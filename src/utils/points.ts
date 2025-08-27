// Quy tắc tích điểm
export function calculatePoints(totalAmount: number): number {
  if (totalAmount < 100000) {
    // Dưới 100k = 0 điểm
    return 0;
  } else if (totalAmount < 700000) {
    // 100k-699k: 10,000 VNĐ = 1 điểm
    return Math.floor(totalAmount / 10000);
  } else {
    // 700k trở lên: 100 điểm cố định + điểm thưởng thêm
    const bonusAmount = totalAmount - 700000;
    const bonusPoints = Math.floor(bonusAmount / 10000);
    return 100 + bonusPoints;
  }
}

// Định dạng số điểm để hiển thị
export function formatPoints(points: number): string {
  return `${points} điểm`;
}
