
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { getUser, createUser, updateUser } from "@/lib/data";
import { User, UserRole, UserStatus } from "@/types";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addYears } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserFormData {
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  start_date: string;
  end_date: string;
}

const UserForm: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const isEditMode = userId !== "new" && !!userId;
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<UserFormData>();
  
  // Set default dates for new users
  useEffect(() => {
    if (!isEditMode) {
      const today = new Date();
      const nextYear = addYears(today, 1);
      
      setValue('start_date', format(today, 'yyyy-MM-dd'));
      setValue('end_date', format(nextYear, 'yyyy-MM-dd'));
      setValue('role', 'user');
      setValue('status', 'active');
    }
  }, [isEditMode, setValue]);
  
  // Fetch user data if in edit mode
  const { data: user, isError: isUserError, error: userError } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUser(userId!),
    enabled: isEditMode,
  });
  
  // Set form values when user data is loaded
  useEffect(() => {
    if (user) {
      const startDate = new Date(user.start_date);
      const endDate = new Date(user.end_date);
      
      reset({
        email: user.email,
        role: user.role,
        status: user.status,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd')
      });
    }
  }, [user, reset]);
  
  // Create user mutation
  const createMutation = useMutation({
    mutationFn: (data: UserFormData) => {
      console.log("Creating user with data:", data);
      return createUser(
        data.email, 
        data.password!, 
        {
          role: data.role,
          status: data.status,
          start_date: new Date(data.start_date).toISOString(),
          end_date: new Date(data.end_date).toISOString()
        }
      );
    },
    onSuccess: (data) => {
      console.log("User created successfully:", data);
      toast({
        title: "Success",
        description: "User created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate("/admin/users");
    },
    onError: (error: any) => {
      console.error("Failed to create user:", error);
      toast({
        title: "Error",
        description: "Failed to create user. Check the console for details.",
        variant: "destructive",
      });
    }
  });
  
  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<User>) => {
      console.log("Updating user with data:", data);
      return updateUser(userId!, data);
    },
    onSuccess: (data) => {
      console.log("User updated successfully:", data);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      navigate("/admin/users");
    },
    onError: (error: any) => {
      console.error("Failed to update user:", error);
      toast({
        title: "Error",
        description: "Failed to update user. Check the console for details.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: UserFormData) => {
    console.log("Form submitted with data:", data);
    
    if (isEditMode) {
      const updateData: Partial<User> = {
        role: data.role,
        status: data.status,
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString()
      };
      
      updateMutation.mutate(updateData);
    } else {
      if (!data.password) {
        toast({
          title: "Error",
          description: "Password is required for new users",
          variant: "destructive",
        });
        return;
      }
      
      createMutation.mutate(data);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-4">
          <Button 
            variant="ghost" 
            className="flex items-center text-websauce-600 hover:text-websauce-700 p-0"
            onClick={() => navigate("/admin/users")}
          >
            <ChevronLeft size={16} className="mr-1" />
            <span>Back to Users</span>
          </Button>
        </div>
        
        {(isUserError || createMutation.isError || updateMutation.isError) && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {isUserError ? "Failed to load user data. " : ""}
              {createMutation.isError ? "Failed to create user. " : ""}
              {updateMutation.isError ? "Failed to update user. " : ""}
              Please check your connection and permissions. Open the console for more details.
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{isEditMode ? "Edit User" : "Create New User"}</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  disabled={isEditMode} // Can't change email for existing users
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>
              
              {!isEditMode && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    {...register("password", { 
                      required: !isEditMode ? "Password is required for new users" : false,
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters"
                      }
                    })}
                  />
                  {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  {...register("role", { required: "Role is required" })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  {...register("status", { required: "Status is required" })}
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="deleted">Deleted</option>
                </select>
                {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register("start_date", { required: "Start date is required" })}
                />
                {errors.start_date && <p className="text-red-500 text-sm">{errors.start_date.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  {...register("end_date", { required: "End date is required" })}
                />
                {errors.end_date && <p className="text-red-500 text-sm">{errors.end_date.message}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate("/admin/users")}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : isEditMode
                    ? "Update User"
                    : "Create User"
                }
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default UserForm;
