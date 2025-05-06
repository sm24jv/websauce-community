import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MessagePost, MessageCategory, MessageComment } from '@/types';
import { getMessagePostById, getMessageCategories, getMessageComments, createMessageComment, updateMessageComment, updateMessagePost, deleteMessagePost } from '@/lib/data';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import WebsauceHeader from '@/components/WebsauceHeader';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

interface CategorySidebarProps {
  categories: MessageCategory[];
  isLoading: boolean;
  activeCategoryId?: string;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({ categories, isLoading, activeCategoryId }) => {
  if (isLoading) {
    return (
      <nav className="w-64 space-y-1 p-4 border-r border-gray-200 bg-white h-full overflow-y-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        ))}
      </nav>
    );
  }

  return (
    <nav className="w-64 space-y-1 p-4 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-full overflow-y-auto flex-shrink-0">
       <Link
          to={`/message-board`}
          className={cn(
            "block px-3 py-2 rounded-md text-sm font-medium",
            !activeCategoryId
              ? "bg-websauce-100 text-websauce-700 dark:bg-websauce-700 dark:text-websauce-100"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
          )}
        >
          Alle Posts
        </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/message-board/${category.id}`}
          className={cn(
            "block px-3 py-2 rounded-md text-sm font-medium",
            activeCategoryId === category.id
              ? "bg-websauce-100 text-websauce-700 dark:bg-websauce-700 dark:text-websauce-100"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
          )}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
};

const SinglePostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { user, firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // Add state for comment editing
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Add state for post editing
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [editPostTitle, setEditPostTitle] = useState("");
  const [editPostContent, setEditPostContent] = useState("");
  const [isSubmittingPostEdit, setIsSubmittingPostEdit] = useState(false);
  
  // Add state for delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  const { 
    data: post,
    isLoading: isLoadingPost,
    error: postError 
  } = useQuery<MessagePost | null, Error>({
    queryKey: ['singleMessagePost', postId], 
    queryFn: () => postId ? getMessagePostById(postId) : Promise.resolve(null),
    enabled: !!postId,
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<MessageCategory[]>({ 
    queryKey: ['messageCategories'], 
    queryFn: getMessageCategories 
  });

  const { 
    data: comments = [], 
    isLoading: isLoadingComments,
    error: commentsError,
    refetch: refetchComments
  } = useQuery<MessageComment[], Error>({
    queryKey: ['messageComments', postId], 
    queryFn: async () => {
      if (!postId) return [];
      const fetchedComments = await getMessageComments(postId);
      console.log('[SinglePostPage] Fetched comments in queryFn:', fetchedComments);
      return fetchedComments;
    },
    enabled: !!postId,
  });

  // Log comments whenever the comments data changes or the component re-renders
  console.log('[SinglePostPage] Comments data from useQuery:', comments);

  // Add handler for edit comment button
  const handleEditComment = (comment: MessageComment) => {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content);
    setIsEditModalOpen(true);
  };

  // Add handler for saving edited comment
  const handleSaveCommentEdit = async () => {
    if (!user || !editingCommentId) {
      toast({ 
        title: "Fout", 
        description: "U moet ingelogd zijn om een reactie te bewerken.", 
        variant: "destructive" 
      });
      return;
    }
    
    if (editCommentContent.replace(/<(.|\n)*?>/g, '').trim().length === 0) {
      toast({ 
        title: "Fout", 
        description: "Reactie mag niet leeg zijn.", 
        variant: "destructive" 
      });
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const success = await updateMessageComment(
        editingCommentId,
        editCommentContent,
        user.id
      );

      if (success) {
        toast({ title: "Succes!", description: "Uw reactie is bijgewerkt." });
        setIsEditModalOpen(false);
        setEditingCommentId(null);
        setEditCommentContent("");
        refetchComments();
      } else {
        throw new Error("Failed to update comment");
      }
    } catch (error) {
      console.error("Failed to update comment:", error);
      toast({ 
        title: "Bewerking Mislukt", 
        description: "Kon uw reactie niet bijwerken. Probeer het opnieuw.", 
        variant: "destructive" 
      });
    }
    setIsSubmittingEdit(false);
  };

  const handlePublishComment = async () => {
    if (!user || !firebaseUser || !postId) {
      toast({ title: "Fout", description: "U moet ingelogd zijn en de post moet geldig zijn om een reactie te plaatsen.", variant: "destructive" });
      return;
    }
    if (newCommentContent.replace(/<(.|\n)*?>/g, '').trim().length === 0) {
      toast({ title: "Fout", description: "Reactie mag niet leeg zijn.", variant: "destructive" });
      return;
    }

    setIsSubmittingComment(true);
    try {
      const authorDetails = {
        uid: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        photoURL: firebaseUser.photoURL,
      };
      const newCommentId = await createMessageComment(postId, newCommentContent, authorDetails);

      if (newCommentId) {
        toast({ title: "Succes!", description: "Uw reactie is geplaatst." });
        setIsCommentModalOpen(false);
        setNewCommentContent("");
        refetchComments();
      } else {
        throw new Error("Failed to get new comment ID");
      }
    } catch (error) {
      console.error("Failed to publish comment:", error);
      toast({ title: "Publicatie Mislukt", description: "Kon uw reactie niet plaatsen. Probeer het opnieuw.", variant: "destructive" });
    }
    setIsSubmittingComment(false);
  };

  // Add a function to handle post edit button click
  const handleEditPost = () => {
    if (!post) return;
    setEditPostTitle(post.title);
    setEditPostContent(post.content);
    setIsEditPostModalOpen(true);
  };
  
  // Add function to save post edits
  const handleSavePostEdit = async () => {
    if (!user || !postId || !post) {
      toast({ 
        title: "Fout", 
        description: "U moet ingelogd zijn om een post te bewerken.", 
        variant: "destructive" 
      });
      return;
    }
    
    if (editPostTitle.trim().length === 0) {
      toast({ 
        title: "Fout", 
        description: "Titel mag niet leeg zijn.", 
        variant: "destructive" 
      });
      return;
    }
    
    if (editPostContent.replace(/<(.|\n)*?>/g, '').trim().length === 0) {
      toast({ 
        title: "Fout", 
        description: "Bericht mag niet leeg zijn.", 
        variant: "destructive" 
      });
      return;
    }
    
    setIsSubmittingPostEdit(true);
    try {
      const success = await updateMessagePost(
        postId,
        { title: editPostTitle, content: editPostContent },
        user.id
      );
      
      if (success) {
        toast({ title: "Succes!", description: "Uw post is bijgewerkt." });
        setIsEditPostModalOpen(false);
        
        // Refresh post data
        queryClient.invalidateQueries({ queryKey: ['singleMessagePost', postId] });
      } else {
        throw new Error("Failed to update post");
      }
    } catch (error) {
      console.error("Failed to update post:", error);
      toast({ 
        title: "Bewerking Mislukt", 
        description: "Kon uw post niet bijwerken. Probeer het opnieuw.", 
        variant: "destructive" 
      });
    }
    setIsSubmittingPostEdit(false);
  };

  // Add function to delete post and all its comments
  const handleDeletePost = async () => {
    if (!user || !postId) {
      return;
    }
    
    setIsDeletingPost(true);
    try {
      const success = await deleteMessagePost(postId, user.id);
      
      if (success) {
        toast({ title: "Succes!", description: "Post is verwijderd." });
        // Navigate back to the message board
        navigate("/message-board");
      } else {
        throw new Error("Failed to delete post");
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast({ 
        title: "Verwijderen Mislukt", 
        description: "Kon de post niet verwijderen. Probeer het opnieuw.", 
        variant: "destructive" 
      });
    }
    setIsDeletingPost(false);
    setIsDeleteDialogOpen(false);
  };

  const quillModules = {
    toolbar: [
      [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
      [{size: []}],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };
  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  if (isLoadingPost || isLoadingCategories) return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <WebsauceHeader />
      <div className="container mx-auto px-4 max-w-screen-lg flex-1 flex flex-col py-6 text-center">
        <p>Pagina laden...</p> 
      </div>
    </div>
  );

  if (postError) return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <WebsauceHeader />
      <div className="container mx-auto px-4 max-w-screen-lg flex-1 flex flex-col py-6">
        <p className="text-red-500">Fout bij het laden van de post: {postError.message}</p>
        <Link to="/message-board">
          <Button variant="link">Terug naar Prikbord</Button>
        </Link>
      </div>
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <WebsauceHeader />
      <div className="container mx-auto px-4 max-w-screen-lg flex-1 flex flex-col py-6 text-center">
        <p>Post niet gevonden.</p>
        <Link to="/message-board">
          <Button variant="link">Terug naar Prikbord</Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <WebsauceHeader />
      <div className="container mx-auto px-4 max-w-screen-lg flex-1 flex flex-col py-6">
        <div className="flex flex-1 overflow-hidden">
          <CategorySidebar 
            categories={categories} 
            isLoading={isLoadingCategories}
            activeCategoryId={post?.categoryId}
          />
          
          <main className="flex-1 p-6 overflow-y-auto ml-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
            <Card className="bg-transparent shadow-none border-none">
              <CardHeader className="px-0 pt-0">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{post.title}</CardTitle>
                  <div className="flex space-x-2">
                    {user && (user.id === post.authorId || user.role === 'admin') && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleEditPost}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          Bewerken
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setIsDeleteDialogOpen(true)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Verwijderen
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.authorPhotoURL || undefined} alt={post.authorName} />
                    <AvatarFallback>{post.authorName?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
                  </Avatar>
                  <span>Door: {post.authorName || 'Anoniem'}</span>
                  <span>•</span>
                  <span>
                    Gepost op: {post.createdAt ? format(post.createdAt.toDate(), 'PPP HH:mm', { locale: nl }) : 'Datum onbekend'} 
                  </span>
                  {post.updatedAt && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                      (bewerkt)
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 px-0 pb-0 border-b border-gray-200 dark:border-gray-700 mb-6">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </CardContent>

              <CardFooter className="px-0 flex flex-col items-start">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Reacties ({comments.length})</h3>
                
                {user && (
                  <Dialog open={isCommentModalOpen} onOpenChange={setIsCommentModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="mb-6">Reactie Toevoegen</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl sm:h-[75vh] flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Reactie Toevoegen</DialogTitle>
                        <DialogDescription className="sr-only">
                          Voeg een reactie toe aan deze post. Gebruik de editor hieronder.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4 px-1 flex-grow overflow-hidden flex flex-col">
                        <Label htmlFor="comment-content" className="mb-2 block">Uw Reactie</Label>
                        
                        <div 
                          className="QuillEditorContainer flex-grow"
                          style={{ height: "calc(75vh - 200px)" }}
                        >
                          <ReactQuill 
                            theme="snow" 
                            value={newCommentContent} 
                            onChange={setNewCommentContent}
                            modules={quillModules}
                            formats={quillFormats}
                            placeholder="Schrijf hier uw reactie..."
                            className="bg-background text-foreground h-full"
                          />
                        </div>
                      </div>
                      <DialogFooter className="py-3 bg-background border-t border-gray-200">
                        <DialogClose asChild>
                          <Button variant="outline">Annuleren</Button>
                        </DialogClose>
                        <Button onClick={handlePublishComment} disabled={isSubmittingComment}>
                          {isSubmittingComment ? "Plaatsen..." : "Plaats Reactie"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {isLoadingComments && <p>Reacties laden...</p>}
                {commentsError && <p className="text-red-500">Fout bij het laden van reacties: {commentsError.message}</p>}
                {!isLoadingComments && !commentsError && comments.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400">Nog geen reacties. Wees de eerste!</p>
                )}
                {!isLoadingComments && !commentsError && comments.length > 0 && (
                  <div className="space-y-4 w-full">
                    {comments.map((comment) => (
                      <Card key={comment.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src={comment.authorPhotoURL || undefined} alt={comment.authorName} />
                            <AvatarFallback>{comment.authorName?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-sm text-gray-800 dark:text-white">
                                  {comment.authorName || 'Anoniem'}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  • {comment.createdAt ? format(comment.createdAt.toDate(), 'PPP HH:mm', { locale: nl }) : 'Datum onbekend'}
                                </span>
                                {comment.updatedAt && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                                    (bewerkt)
                                  </span>
                                )}
                              </div>
                              {user && (comment.authorId === user.id || user.role === 'admin') && (
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleEditComment(comment)}
                                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                  >
                                    Bewerken
                                  </Button>
                                </div>
                              )}
                            </div>
                            <div 
                              className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                              dangerouslySetInnerHTML={{ __html: comment.content }}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
                {/* Second Add Comment Button - visible if user is logged in and there are comments or it's not loading/erroring */}
                {user && !isLoadingComments && !commentsError && (
                  <div className="mt-6">
                     <Dialog open={isCommentModalOpen} onOpenChange={setIsCommentModalOpen}>
                        <DialogTrigger asChild>
                           <Button variant="outline">Reactie Toevoegen</Button>
                        </DialogTrigger>
                     </Dialog>
                  </div>
                )}
              </CardFooter>
            </Card>
          </main>
        </div>
        
        {/* Add edit comment modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-3xl sm:h-[75vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Reactie Bewerken</DialogTitle>
              <DialogDescription className="sr-only">
                Bewerk uw reactie. Gebruik de editor hieronder.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 px-1 flex-grow overflow-hidden flex flex-col">
              <Label htmlFor="edit-comment-content" className="mb-2 block">Uw Reactie</Label>
              
              <div 
                className="QuillEditorContainer flex-grow"
                style={{ height: "calc(75vh - 200px)" }}
              >
                <ReactQuill 
                  theme="snow" 
                  value={editCommentContent} 
                  onChange={setEditCommentContent}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Schrijf hier uw reactie..."
                  className="bg-background text-foreground h-full"
                />
              </div>
            </div>
            <DialogFooter className="py-3 bg-background border-t border-gray-200">
              <DialogClose asChild>
                <Button variant="outline">Annuleren</Button>
              </DialogClose>
              <Button onClick={handleSaveCommentEdit} disabled={isSubmittingEdit}>
                {isSubmittingEdit ? "Opslaan..." : "Wijzigingen Opslaan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Add post edit modal */}
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
              <Button onClick={handleSavePostEdit} disabled={isSubmittingPostEdit}>
                {isSubmittingPostEdit ? "Opslaan..." : "Wijzigingen Opslaan"}
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
    </div>
  );
};

export default SinglePostPage; 