import React from "react";
import { useNavigate } from "react-router-dom";
import { MessageCategory } from "@/types";
// Uncomment the imports now that functions exist
import { getMessageCategories, deleteMessageCategory } from "@/lib/data"; 
import WebsauceHeader from "@/components/WebsauceHeader";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Plus, Trash, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query"; // Import UseMutationResult
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminMessageCategories: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories using the real function
  const { data: categories = [], isLoading, isError, error } = useQuery<MessageCategory[]>({ 
    queryKey: ['messageCategories'], 
    queryFn: getMessageCategories, 
  });

  // Mutation for deleting a category using the real function
  const deleteMutation: UseMutationResult<void, Error, string> = useMutation({
    mutationFn: deleteMessageCategory, 
    onSuccess: () => {
      toast({ title: "Success", description: "Category deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['messageCategories'] });
    },
    onError: (error: Error) => { // Use Error type
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete category", 
        variant: "destructive" 
      });
      console.error("Error deleting category:", error);
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      deleteMutation.mutate(id); // Pass the id to mutate
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <WebsauceHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Message Board Categories</h1>
          <Button onClick={() => navigate("/admin/message-categories/new")}>
            <Plus size={16} className="mr-2" />
            Add New Category
          </Button>
        </div>

        {isError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error?.message || "Failed to load categories. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <p>Loading categories...</p> // TODO: Add Skeleton loader
        ) : categories.length === 0 ? (
          <p>No categories found. Add one to get started.</p>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description || '-'}</TableCell>
                    <TableCell>{category.order ?? '-'}</TableCell> {/* Display order or dash */}
                    <TableCell>
                      {category.createdAt 
                        ? format(new Date(category.createdAt.seconds * 1000), 'PPP') 
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost"
                        size="icon"
                        className="mr-2"
                        onClick={() => navigate(`/admin/message-categories/edit/${category.id}`)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button 
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(category.id)}
                        // Corrected disabled state check for TanStack Query v5+
                        disabled={deleteMutation.isPending && deleteMutation.variables === category.id}
                      >
                        <Trash size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminMessageCategories; 