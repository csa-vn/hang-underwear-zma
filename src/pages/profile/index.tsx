import ProfileActions from "./actions";
import FollowOA from "./follow-oa";
import Points from "./points";
import MemberInfo from "@/components/member/member-info";
import { useState } from "react";

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return (
    <div className="min-h-full bg-section p-4 space-y-2.5">
      <Points />
      <MemberInfo setIsLoggedIn={setIsLoggedIn} />
      <ProfileActions />
      {isLoggedIn && <FollowOA />}
    </div>
  );
}
