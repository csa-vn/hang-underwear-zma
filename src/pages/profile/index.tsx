import ProfileActions from "./actions";
import FollowOA from "./follow-oa";
import Points from "./points";
import MemberInfo from "@/components/member-info";

export default function ProfilePage() {
  return (
    <div className="min-h-full bg-section p-4 space-y-2.5">
      <Points />
      <MemberInfo />
      <ProfileActions />
      <FollowOA />
    </div>
  );
}
