import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { MessageCategory } from "@/types";
import { getMessageCategory, createMessageCategory, updateMessageCategory } from "@/lib/data";
import WebsauceHeader from "@/components/WebsauceHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ChevronLeft, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define the shape of our form data
interface CategoryFormData {
  name: string;
  description?: string;
  order?: number;
}

const MessageCategoryForm: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const isEditMode = categoryId !== "new" && !!categoryId;
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CategoryFormData>({
    defaultValues: {
      name: "",
      description: "",
      order: 0,
    }
  });
  const { handleSubmit, control, reset, formState: { isSubmitting, errors } } = form;

  // Query to fetch category data if in edit mode
  const { data: category, isLoading: isLoadingCategory, isError: isCategoryError, error: categoryError } = useQuery({
    queryKey: ['messageCategory', categoryId],
    queryFn: () => getMessageCategory(categoryId!),
    enabled: isEditMode,
  });

  // Use useEffect to populate the form when category data is available
  useEffect(() => {
    if (isEditMode && category) {
      reset({ 
        name: category.name,
        description: category.description || '',
        order: category.order === undefined || category.order === null ? 0 : category.order,
      });
    }
  }, [category, isEditMode, reset]);

  // Mutation for creating a category
  const createMutation = useMutation({
    mutationFn: createMessageCategory,
    onSuccess: () => {
      toast({ title: "Success", description: "Category created successfully" });
      queryClient.invalidateQueries({ queryKey: ['messageCategories'] });
      navigate("/admin/message-categories");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create category", variant: "destructive" });
    }
  });

  // Mutation for updating a category
  const updateMutation = useMutation({
    mutationFn: (data: CategoryFormData) => updateMessageCategory(categoryId!, data),
    onSuccess: () => {
      toast({ title: "Success", description: "Category updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['messageCategories'] });
      queryClient.invalidateQueries({ queryKey: ['messageCategory', categoryId] });
      navigate("/admin/message-categories");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update category", variant: "destructive" });
    }
  });

  const onSubmit = (data: CategoryFormData) => {
    // Convert empty string order to null or handle as needed by backend/type
    const submitData = {
      ...data,
      // Ensure order is a number or potentially handle empty string if needed
      order: data.order === undefined || data.order === null ? 0 : Number(data.order) 
    };

    if (isEditMode) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const mutationError = createMutation.error || updateMutation.error;
  const pageLoading = isEditMode && isLoadingCategory;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <WebsauceHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-4">
          <Button 
            variant="ghost" 
            className="flex items-center text-websauce-600 hover:text-websauce-700 p-0"
            onClick={() => navigate("/admin/message-categories")}
          >
            <ChevronLeft size={16} className="mr-1" />
            <span>Back to Categories</span>
          </Button>
        </div>

        {(isCategoryError || mutationError) && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {isCategoryError ? categoryError?.message || "Failed to load category data." : ""}
              {mutationError ? mutationError.message || "Failed to save category." : ""}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? "Edit Category" : "Create New Category"}</CardTitle>
          </CardHeader>
          {pageLoading ? (
            <CardContent><p>Loading category details...</p></CardContent> // TODO: Skeleton loader
          ) : (
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={control}
                    name="name"
                    rules={{ required: "Category name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., General Discussion" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="A brief description of the category" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order (Optional)</FormLabel>
                        <FormControl>
                          {/* Ensure value is treated as number or empty string for input */}
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field} 
                            value={field.value === null || field.value === undefined ? '' : field.value} 
                            onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditMode ? "Save Changes" : "Create Category"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          )}
        </Card>
      </main>
    </div>
  );
};

export default MessageCategoryForm; 