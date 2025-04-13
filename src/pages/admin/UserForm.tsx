import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { getUser, updateUser } from "@/lib/data";
import { createUser } from "@/lib/auth";
import { User, UserRole, UserStatus } from "@/types";
import WebsauceHeader from "@/components/WebsauceHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addYears, isValid, parseISO } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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
  
  const form = useForm<UserFormData>({
    defaultValues: {
        email: "",
        role: "user",
        status: "active",
        start_date: "",
        end_date: "",
    }
  });
  const { register, handleSubmit, control, formState: { errors }, reset, watch, setValue } = form;
  
  const selectedRole = watch("role");
  const isAdminSelected = selectedRole === 'admin';
  
  useEffect(() => {
    if (!isEditMode) { 
      if (isAdminSelected) {
        setValue('start_date', '');
        setValue('end_date', '');
      } else {
        if (!form.getValues('start_date') && !form.getValues('end_date')) {
            const today = new Date();
            const nextYear = addYears(today, 1);
            setValue('start_date', format(today, 'yyyy-MM-dd'));
            setValue('end_date', format(nextYear, 'yyyy-MM-dd'));
        }
      }
    }
  }, [isEditMode, isAdminSelected, setValue, form]);
  
  const { data: user, isError: isUserError, error: userError } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUser(userId!),
    enabled: isEditMode,
  });
  
  useEffect(() => {
    if (user) {
        let formattedStartDate = '';
        if (user.start_date) {
            const parsedStartDate = parseISO(user.start_date);
            if (isValid(parsedStartDate)) {
                formattedStartDate = format(parsedStartDate, 'yyyy-MM-dd');
            }
        }
        let formattedEndDate = '';
        if (user.end_date) {
            const parsedEndDate = parseISO(user.end_date);
            if (isValid(parsedEndDate)) {
                formattedEndDate = format(parsedEndDate, 'yyyy-MM-dd');
            }
        }

        reset({
            email: user.email,
            role: user.role,
            status: user.status,
            start_date: formattedStartDate,
            end_date: formattedEndDate
        });
    }
  }, [user, reset]);
  
  const createMutation = useMutation({
    mutationFn: (data: UserFormData) => {
      console.log("Creating user with data:", data);
      const profileData: Omit<User, 'id' | 'email'> = {
          role: data.role,
          status: data.status,
          ...(data.role !== 'admin' && data.start_date && data.end_date && {
              start_date: new Date(data.start_date).toISOString(),
              end_date: new Date(data.end_date).toISOString()
          })
      };
      if (!data.password) {
        throw new Error("Password is required for new users.");
      }
      return createUser(
        data.email,
        data.password,
        profileData
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
        description: error.message || "Failed to create user. Check the console for details.",
        variant: "destructive",
      });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: (data: Partial<User>) => {
      console.log("Updating user profile with data:", data);
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
        description: error.message || "Failed to update user. Check the console for details.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: UserFormData) => {
    console.log("Form submitted with data:", data);
    
    if (isEditMode) {
      let submitData: Partial<User> = {
          role: data.role,
          status: data.status,
      };

      if (data.role === 'admin') {
          submitData.start_date = undefined; 
          submitData.end_date = undefined;
      } else {
          if (!data.start_date || !data.end_date) {
               toast({ title: "Error", description: "Start and End dates are required for 'user' role.", variant: "destructive" });
               return;
          }
          try {
              submitData.start_date = new Date(data.start_date).toISOString();
              submitData.end_date = new Date(data.end_date).toISOString();
          } catch (e) {
               toast({ title: "Error", description: "Invalid date format provided.", variant: "destructive" });
               return;
          }
      }
      console.log("Submitting update data:", submitData);
      updateMutation.mutate(submitData);
    } else {
      console.log("Submitting create data:", data);
      createMutation.mutate(data);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <WebsauceHeader />
      
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
          <Form {...form}>
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
                    disabled={isEditMode}
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
                
                <FormField
                  control={control}
                  name="role"
                  rules={{ required: "Role is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="status"
                  rules={{ required: "Status is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    {...register("start_date", { 
                        required: !isAdminSelected ? "Start date is required for users" : false 
                    })}
                    disabled={isAdminSelected}
                    className={isAdminSelected ? "bg-gray-100 cursor-not-allowed" : ""}
                  />
                  {errors.start_date && <p className="text-red-500 text-sm">{errors.start_date.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    {...register("end_date", { 
                        required: !isAdminSelected ? "End date is required for users" : false 
                    })}
                    disabled={isAdminSelected}
                    className={isAdminSelected ? "bg-gray-100 cursor-not-allowed" : ""}
                  />
                  {errors.end_date && <p className="text-red-500 text-sm">{errors.end_date.message}</p>}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate("/admin/users")}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-websauce-600 hover:bg-websauce-700"
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
          </Form>
        </Card>
      </main>
    </div>
  );
};

export default UserForm;
