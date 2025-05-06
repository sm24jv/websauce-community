import React, { useEffect, useState } from 'react';
import WebsauceHeader from "@/components/WebsauceHeader";
import { MessageCategory, MessagePost } from "@/types";
import { getMessageCategories, createMessagePost, getMessagePostsForCategory, updateMessagePost, getMessagePostById, deleteMessagePost } from "@/lib/data";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle } from 'lucide-react';

interface CategorySidebarProps {
  categories: MessageCategory[];
  isLoading: boolean;
  activeCategoryId?: string;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({ categories, isLoading, activeCategoryId }) => {
  if (isLoading) {
    return (
      <div className="w-64 space-y-2 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <nav className="w-64 space-y-1 p-4 border-r border-gray-200 bg-white h-full overflow-y-auto">
       <Link
          to={`/message-board`}
          className={cn(
            "block px-3 py-2 rounded-md text-sm font-medium",
            !activeCategoryId
              ? "bg-websauce-100 text-websauce-700"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          )}
        >
          All Posts
        </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/message-board/${category.id}`}
          className={cn(
            "block px-3 py-2 rounded-md text-sm font-medium",
            activeCategoryId === category.id
              ? "bg-websauce-100 text-websauce-700"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          )}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
};

const MessageBoardPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId?: string }>();
  const { toast } = useToast();
  const { user, firebaseUser } = useAuth();

  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostContent, setEditPostContent] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  
  // Add state for delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<MessageCategory[]>({ 
    queryKey: ['messageCategories'], 
    queryFn: getMessageCategories 
  });

  const { 
    data: posts = [], 
    isLoading: isLoadingPosts,
    error: postsError,
    refetch: refetchPosts
  } = useQuery<MessagePost[], Error>({
    queryKey: ['messagePosts', categoryId || 'all'],
    queryFn: () => getMessagePostsForCategory(categoryId),
  });

  const selectedCategory = categories.find(c => c.id === categoryId);

  useEffect(() => {
    if (categoryId) {
      console.log("Selected category ID:", categoryId);
    }
  }, [categoryId]);

  const handlePublishPost = async () => {
    if (!user || !firebaseUser) {
      toast({ title: "Fout", description: "U moet ingelogd zijn om een post te maken.", variant: "destructive" });
      return;
    }
    if (!categoryId) {
      toast({ title: "Fout", description: "Selecteer eerst een categorie.", variant: "destructive" });
      return;
    }
    if (!postTitle.trim()) {
      toast({ title: "Fout", description: "Titel mag niet leeg zijn.", variant: "destructive" });
      return;
    }
    if (postContent.replace(/<(.|\n)*?>/g, '').trim().length === 0) {
      toast({ title: "Fout", description: "Bericht mag niet leeg zijn.", variant: "destructive" });
      return;
    }

    console.log("Submitting post with data:", { 
      postDetails: { title: postTitle, content: postContent, categoryId },
      authorDetails: { 
        uid: user.id,
        firstName: user.firstName, 
        lastName: user.lastName,
        photoURL: firebaseUser?.photoURL 
      },
      firebaseAuthUID: firebaseUser?.uid
    });

    setIsSubmittingPost(true);
    try {
      const authorInfo = {
        uid: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        photoURL: firebaseUser?.photoURL || null
      };
      const newPostId = await createMessagePost(
        { title: postTitle, content: postContent, categoryId },
        authorInfo
      );
      if (newPostId) {
        toast({ title: "Succes!", description: "Uw post is gepubliceerd." });
        setIsCreatePostModalOpen(false);
        setPostTitle('');
        setPostContent('');
        refetchPosts();
      } else {
        throw new Error("Failed to get new post ID");
      }
    } catch (error) {
      console.error("Failed to publish post:", error);
      toast({ title: "Publicatie Mislukt", description: "Kon uw post niet publiceren. Probeer het opnieuw.", variant: "destructive" });
    }
    setIsSubmittingPost(false);
  };

  const handleEditPost = async (post: MessagePost) => {
    setEditingPostId(post.id);
    setEditPostTitle(post.title);
    setEditPostContent(post.content);
    setIsEditPostModalOpen(true);
  };

  const handleSavePostEdit = async () => {
    if (!user || !editingPostId) {
      toast({ title: "Fout", description: "U moet ingelogd zijn om een post te bewerken.", variant: "destructive" });
      return;
    }
    if (!editPostTitle.trim()) {
      toast({ title: "Fout", description: "Titel mag niet leeg zijn.", variant: "destructive" });
      return;
    }
    if (editPostContent.replace(/<(.|\n)*?>/g, '').trim().length === 0) {
      toast({ title: "Fout", description: "Bericht mag niet leeg zijn.", variant: "destructive" });
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const success = await updateMessagePost(
        editingPostId,
        { title: editPostTitle, content: editPostContent },
        user.id
      );

      if (success) {
        toast({ title: "Succes!", description: "Uw post is bijgewerkt." });
        setIsEditPostModalOpen(false);
        setEditingPostId(null);
        setEditPostTitle('');
        setEditPostContent('');
        refetchPosts();
      } else {
        throw new Error("Failed to update post");
      }
    } catch (error) {
      console.error("Failed to update post:", error);
      toast({ title: "Bewerking Mislukt", description: "Kon uw post niet bijwerken. Probeer het opnieuw.", variant: "destructive" });
    }
    setIsSubmittingEdit(false);
  };

  const handleDeletePost = async () => {
    if (!user || !deletingPostId) {
      toast({ title: "Fout", description: "U moet ingelogd zijn om een post te verwijderen.", variant: "destructive" });
      return;
    }

    setIsDeletingPost(true);
    try {
      const success = await deleteMessagePost(deletingPostId, user.id);

      if (success) {
        toast({ title: "Succes!", description: "Uw post is verwijderd." });
        setIsDeleteDialogOpen(false);
        setDeletingPostId(null);
        refetchPosts();
      } else {
        throw new Error("Failed to delete post");
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast({ title: "Verwijdering Mislukt", description: "Kon uw post niet verwijderen. Probeer het opnieuw.", variant: "destructive" });
    }
    setIsDeletingPost(false);
  };

  const quillModules = {
    toolbar: [
      [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
      [{size: []}],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, 
       {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };
  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <WebsauceHeader />
      <div className="container mx-auto px-4 max-w-screen-lg flex-1 flex flex-col py-6">
        <div className="flex flex-1 overflow-hidden">
          <CategorySidebar 
            categories={categories} 
            isLoading={isLoadingCategories} 
            activeCategoryId={categoryId}
          />
          
          <main className="flex-1 p-6 overflow-y-auto ml-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {selectedCategory?.name || (categoryId ? 'Categorie laden...' : 'Alle Posts')}
              </h1>
              {categoryId && user && (
                <Dialog open={isCreatePostModalOpen} onOpenChange={setIsCreatePostModalOpen}>
                  <DialogTrigger asChild>
                    <Button>Nieuwe Post</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-3xl sm:h-[80vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle>Nieuwe Post Maken</DialogTitle>
                      <DialogDescription className="sr-only">
                        Maak een nieuwe post voor het prikbord. Geef een titel en schrijf uw bericht in de editor.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 px-1 flex-grow overflow-hidden flex flex-col">
                      <div className="mb-4">
                        <Label htmlFor="post-title" className="block mb-2">
                          Titel
                        </Label>
                        <Input 
                          id="post-title" 
                          value={postTitle} 
                          onChange={(e) => setPostTitle(e.target.value)} 
                          className="w-full" 
                          placeholder="Titel van uw post"
                        />
                      </div>
                      <div className="flex-grow flex flex-col">
                        <Label htmlFor="post-content" className="mb-2">Bericht</Label>
                        <div 
                          className="QuillEditorContainer flex-grow"
                          style={{ height: "calc(80vh - 280px)" }}
                        >
                          <ReactQuill 
                            theme="snow" 
                            value={postContent} 
                            onChange={setPostContent}
                            modules={quillModules}
                            formats={quillFormats}
                            placeholder="Schrijf hier uw bericht..."
                            className="bg-background text-foreground h-full"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="py-3 bg-background border-t border-gray-200">
                      <DialogClose asChild>
                        <Button variant="outline">Annuleren</Button>
                      </DialogClose>
                      <Button onClick={handlePublishPost} disabled={isSubmittingPost}>
                        {isSubmittingPost ? "Publiceren..." : "Publiceren"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            {isLoadingPosts && <p>Posts laden...</p>}
            {postsError && <p className="text-red-500">Fout bij het laden van posts: {postsError.message}</p>}
            {!isLoadingPosts && !postsError && posts.length === 0 && categoryId && (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">Nog geen posts in deze categorie.</p>
                <p className="text-gray-500 dark:text-gray-400">Wees de eerste om iets te posten!</p>
              </div>
            )}
            {!isLoadingPosts && !postsError && posts.length > 0 && (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="relative group">
                    {user && (post.authorId === user.id || user.role === 'admin') && (
                      <div className="absolute right-2 top-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditPost(post);
                          }}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          Bewerken
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeletingPostId(post.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Verwijderen
                        </Button>
                      </div>
                    )}
                    <Link to={`/message-board/post/${post.id}`} className="block hover:no-underline focus:outline-none focus:ring-2 focus:ring-websauce-500 rounded-lg">
                      <Card className="bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                        <CardHeader>
                          <CardTitle className="text-gray-900 dark:text-white group-hover:text-websauce-600">{post.title}</CardTitle>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={post.authorPhotoURL || undefined} alt={post.authorName} />
                              <AvatarFallback>{post.authorName?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
                            </Avatar>
                            <span>{post.authorName || 'Anoniem'}</span>
                            <span>•</span>
                            <span>
                              {post.createdAt ? format(post.createdAt.toDate(), 'PPP HH:mm', { locale: nl }) : 'Datum onbekend'}
                            </span>
                            {post.updatedAt && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                                (bewerkt)
                              </span>
                            )}
                            {!categoryId && post.categoryId && categories.find(c => c.id === post.categoryId) && (
                              <>
                                <span>•</span>
                                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                  {categories.find(c => c.id === post.categoryId)?.name}
                                </span>
                              </>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="text-gray-700 dark:text-gray-300 pt-2">
                          <div 
                            className="prose dark:prose-invert max-w-none text-sm mb-3 ql-editor"
                            dangerouslySetInnerHTML={{ __html: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : '') }} 
                          />
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <MessageCircle size={14} className="mr-1" /> 
                            <span>{post.commentCount || 0} Reacties</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                ))}
              </div>
            )}
            {!categoryId && !isLoadingPosts && !postsError && posts.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400">Nog geen posts op het prikbord.</p>
            )}
          </main>
        </div>
      </div>
      
      <Dialog open={isEditPostModalOpen} onOpenChange={setIsEditPostModalOpen}>
        <DialogContent className="sm:max-w-3xl sm:h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Post Bewerken</DialogTitle>
            <DialogDescription className="sr-only">
              Bewerk uw post. Geef een titel en bewerk uw bericht in de editor.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 px-1 flex-grow overflow-hidden flex flex-col">
            <div className="mb-4">
              <Label htmlFor="edit-post-title" className="block mb-2">
                Titel
              </Label>
              <Input 
                id="edit-post-title" 
                value={editPostTitle} 
                onChange={(e) => setEditPostTitle(e.target.value)} 
                className="w-full" 
                placeholder="Titel van uw post"
              />
            </div>
            <div className="flex-grow flex flex-col">
              <Label htmlFor="edit-post-content" className="mb-2">Bericht</Label>
              <div 
                className="QuillEditorContainer flex-grow"
                style={{ height: "calc(80vh - 240px)" }}
              >
                <ReactQuill 
                  theme="snow" 
                  value={editPostContent} 
                  onChange={setEditPostContent}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Schrijf hier uw bericht..."
                  className="bg-background text-foreground h-full"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="py-3 bg-background border-t border-gray-200">
            <DialogClose asChild>
              <Button variant="outline">Annuleren</Button>
            </DialogClose>
            <Button onClick={handleSavePostEdit} disabled={isSubmittingEdit}>
              {isSubmittingEdit ? "Opslaan..." : "Wijzigingen Opslaan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Post Verwijderen</DialogTitle>
            <DialogDescription>
              Weet je zeker dat je deze post wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
              Alle reacties op deze post worden ook verwijderd.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Annuleren
              </Button>
            </DialogClose>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeletePost}
              disabled={isDeletingPost}
            >
              {isDeletingPost ? "Verwijderen..." : "Verwijderen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessageBoardPage; 