import ProfileActions from "./actions";
import FollowOA from "./follow-oa";
import Points from "./points";
import MemberInfo from "@/components/member-info";
import { useState } from "react";

export default function ProfilePage() {
  const [memberData, setMemberData] = useState(null);
  return (
    <div className="min-h-full bg-section p-4 space-y-2.5">
      <Points />
      <MemberInfo setMemberData={setMemberData} />
      <ProfileActions />
      {memberData && <FollowOA memberData={memberData} />}
    </div>
  );
}
