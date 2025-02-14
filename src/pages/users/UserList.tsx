import { useEffect, useState } from "react";
import { useAdminNavigate } from "@/hooks/useAdminNavigate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Pencil, Eye } from "lucide-react";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";
import { FirestoreService } from "@/services/firestoreService";
import { UserType } from "@/types/user";



const userService = new FirestoreService<UserType>("users");

export const UserList = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const adminNavigate = useAdminNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getAll();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(filter.toLowerCase()) ||
      user.email?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <AdminOutletTemplate
      title="Users"
      description="Manage user profiles and permissions"
      actions={
        <div className="flex gap-2">
          <Input
            placeholder="Filter users..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-[250px]"
          />
        </div>
      }
    >
      <Card className="border-0 md:border shadow-none md:shadow">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6" />
            <div>
              <CardTitle>User List</CardTitle>
              <CardDescription>View and manage system users</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {user.role || "User"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {user.availableTokens?.toLocaleString() || '0'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => adminNavigate(`users/${user.id}/view`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => adminNavigate(`users/${user.id}/edit`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminOutletTemplate>
  );
};

export default UserList;