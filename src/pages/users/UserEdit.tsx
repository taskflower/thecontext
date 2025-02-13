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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, User } from "lucide-react";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { FirestoreService } from "@/services/firestoreService";

interface UserData {
  name: string;
  email: string;
  role: string;
}

const userService = new FirestoreService<UserData>("users");

export const UserEdit = () => {
  const { userId } = useParams<{ userId: string }>();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<UserData>({
    name: "",
    email: "",
    role: "user"
  });
  const adminNavigate = useAdminNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        const data = await userService.getById(userId);
        if (data) {
          setFormData({
            name: data.name,
            email: data.email,
            role: data.role || "user"
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    try {
      await userService.update(userId, formData);
      adminNavigate("users");
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AdminOutletTemplate
      title="Edit User Profile"
      description="Modify user details and permissions"
      actions={
        <Button 
          variant="outline" 
          onClick={() => adminNavigate("users")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Users
        </Button>
      }
    >
      <Card className="border-0 md:border shadow-none md:shadow">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="h-6 w-6" />
            <div>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update user information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter user name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={formData.role}
                onValueChange={handleRoleChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => adminNavigate("users")}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminOutletTemplate>
  );
};

export default UserEdit;