import React from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@/types";
import { getUsers, updateUser } from "@/lib/data";
import WebsauceHeader from "@/components/WebsauceHeader";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Plus, PlayCircle, PauseCircle, CheckCircle, XCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<User> }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  });

  const handleEdit = (userId: string) => {
    navigate(`/admin/users/edit/${userId}`);
  };

  const toggleUserStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'paused' : 'active';
    const action = newStatus === 'active' ? 'activated' : 'paused';
    
    updateMutation.mutate({ 
      id: user.id, 
      data: { status: newStatus }
    }, {
      onSuccess: () => {
        toast({
          title: "User Updated",
          description: `User has been ${action}.`,
        });
      }
    });
  };

  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) {
      return "N/A"; // Display N/A if date is missing
    }
    try {
      // Attempt to format assuming it's a valid ISO string or can be parsed
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      console.warn(`Error formatting date string: ${dateString}`, error);
      return 'Invalid date';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <WebsauceHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <Button onClick={() => navigate("/admin/users/new")} className="flex items-center gap-2">
            <Plus size={16} />
            <span>Add New User</span>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">Loading users...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">Error loading users</div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 
                          user.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(user.start_date)}</TableCell>
                      <TableCell>{formatDate(user.end_date)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleEdit(user.id)}
                            title="Edit User"
                          >
                            <Pencil size={16} />
                          </Button>
                          
                          {user.status === 'active' ? (
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => toggleUserStatus(user)}
                              title="Pause User"
                            >
                              <PauseCircle size={16} />
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => toggleUserStatus(user)}
                              title="Activate User"
                            >
                              <PlayCircle size={16} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      No users found. Click "Add New User" to create one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUsers;
