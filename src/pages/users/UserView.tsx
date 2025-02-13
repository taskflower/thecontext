import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Pencil } from "lucide-react";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { FirestoreService } from "@/services/firestoreService";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  lastLogin?: string;
}

const userService = new FirestoreService<User>("users");

export const UserView = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const adminNavigate = useAdminNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        const data = await userService.getById(userId);
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <AdminOutletTemplate
      title="User Profile"
      description="View user details and information"
      actions={
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => adminNavigate("users")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Users
          </Button>
          <Button 
            onClick={() => adminNavigate(`users/${userId}/edit`)}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" /> Edit Profile
          </Button>
        </div>
      }
    >
      <Card className="border-0 md:border shadow-none md:shadow">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="h-6 w-6" />
            <div>
              <CardTitle>User Details</CardTitle>
              <CardDescription>View user profile information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <div className="text-sm text-muted-foreground">
                  {user.name}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="text-sm text-muted-foreground">
                  {user.email}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <div>
                  <Badge variant="secondary">
                    {user.role || 'User'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Last Login</label>
                <div className="text-sm text-muted-foreground">
                  {user.lastLogin || 'Never'}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div>
                  <Badge variant="outline">Active</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminOutletTemplate>
  );
};

export default UserView;