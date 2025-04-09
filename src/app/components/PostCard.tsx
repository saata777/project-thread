"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import Image from "next/image";

interface Post {
  id: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string;
  content: string;
  imageUrl?: string;
  likes?: string[];
}

interface Comment {
  id: string;
  content: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string;
  createdAt: any;
}

export default function PostCard({ post }: { post: Post }) {
  const { currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(
    post.likes?.includes(currentUser?.uid ?? "") || false
  );
  const [likeCount, setLikeCount] = useState<number>(post.likes?.length || 0);
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedComment, setEditedComment] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editedPostContent, setEditedPostContent] = useState(post.content);

  const menuRef = useRef<HTMLDivElement>(null);
  const postMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (
        postMenuRef.current &&
        !postMenuRef.current.contains(event.target as Node)
      ) {
        setShowPostMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleCommentInput = () => {
    setShowCommentInput(!showCommentInput);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const togglePostMenu = () => {
    setShowPostMenu(!showPostMenu);
  };

  const navigateToUserProfile = (userId: string) => {
    if (currentUser && currentUser.uid === userId) {
      window.location.href = `/profile`;
    } else {
      window.location.href = `/userprofile?userId=${userId}`;
    }
  };

  useEffect(() => {
    const postRef = doc(db, "posts", post.id);
    const unsubscribe = onSnapshot(postRef, (doc) => {
      if (doc.exists()) {
        const postData = doc.data();
        setIsLiked(postData.likes?.includes(currentUser?.uid) || false);
        setLikeCount(postData.likes?.length || 0);
      }
    });
    return () => unsubscribe();
  }, [post.id, currentUser]);

  useEffect(() => {
    if (!showComments) return;

    const q = query(
      collection(db, "posts", post.id, "comments"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(
        snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      );
    });
    return unsubscribe;
  }, [showComments, post.id]);

  const handleLike = async () => {
    if (!currentUser) return;

    const postRef = doc(db, "posts", post.id);

    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(currentUser.uid),
        });
        setLikeCount((prev) => prev - 1);
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(currentUser.uid),
        });
        await addDoc(collection(db, "activities"), {
          type: "like",
          userId: post.userId,
          byUser: currentUser.displayName,
          postId: post.id,
          createdAt: serverTimestamp(),
        });
        setLikeCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const addComment = async () => {
    if (!comment.trim() || !currentUser) return;

    try {
      await addDoc(collection(db, "posts", post.id, "comments"), {
        content: comment,
        userId: currentUser.uid,
        userDisplayName: currentUser.displayName,
        userPhotoURL: currentUser.photoURL,
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, "activities"), {
        type: "comment",
        userId: post.userId,
        byUser: currentUser.displayName,
        postId: post.id,
        content: comment,
        createdAt: serverTimestamp(),
      });
      setComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditedComment(content);
  };

  const saveEditedComment = async (commentId: string) => {
    if (!editedComment.trim() || !currentUser) return;

    try {
      const commentRef = doc(db, "posts", post.id, "comments", commentId);
      await updateDoc(commentRef, { content: editedComment });
      setEditingCommentId(null);
      setEditedComment("");
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const commentRef = doc(db, "posts", post.id, "comments", commentId);
      await deleteDoc(commentRef);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const deletePost = async () => {
    if (!currentUser || currentUser.uid !== post.userId) return;

    try {
      const postRef = doc(db, "posts", post.id);
      await deleteDoc(postRef);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleEditPost = () => {
    setIsEditingPost(true);
    setShowPostMenu(false);
  };

  const saveEditedPost = async () => {
    if (!editedPostContent.trim() || !currentUser) return;

    try {
      const postRef = doc(db, "posts", post.id);
      await updateDoc(postRef, { content: editedPostContent });
      setIsEditingPost(false);
    } catch (error) {
      console.error("Error editing post:", error);
    }
  };

  return (
    <div className="p-4 border-b-[2px] text-white border-[#272727]">
      <div className="flex items-start mb-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden mr-3">
          {post.userPhotoURL && (
            <Image
              src={post.userPhotoURL}
              alt={post.userDisplayName}
              onClick={() => navigateToUserProfile(post.userId)}
              className="w-full h-full object-cover cursor-pointer"
              width={40}
              height={40}
            />
          )}
        </div>
        <div className="relative flex-1">
          <div className="font-medium">
            <a
              onClick={() => navigateToUserProfile(post.userId)}
              className="text-white hover:underline cursor-pointer"
            >
              {post.userDisplayName}
            </a>
          </div>

          {currentUser && currentUser.uid === post.userId && (
            <div className="relative" ref={postMenuRef}>
              <button
                className="text-gray-500 absolute top-[-20px] right-0 rotate-90 text-xl"
                onClick={togglePostMenu}
              >
                ⋮
              </button>
              {showPostMenu && (
                <div className="absolute right-0 top-6 mt-2 w-48 bg-[#2b2b2b] border rounded shadow-lg z-10">
                  <button
                    onClick={handleEditPost}
                    className="block w-full text-left px-4 py-2 text-sm text-blue-500 hover:bg-[#1f1f1f]"
                  >
                    Edit Post
                  </button>
                  <button
                    onClick={deletePost}
                    className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#1f1f1f]"
                  >
                    Delete 🗑️
                  </button>
                </div>
              )}
            </div>
          )}

          {isEditingPost ? (
            <div className="mt-3">
              <textarea
                value={editedPostContent}
                onChange={(e) => setEditedPostContent(e.target.value)}
                className="w-full p-2 border rounded-lg text-sm resize-none"
                rows={3}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => setIsEditingPost(false)}
                  className="px-3 py-1 border rounded text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditedPost}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              {post.imageUrl && (
                <Image
                  src={post.imageUrl}
                  alt="Post image"
                  className="mt-3 rounded-lg max-w-full h-[500px] object-cover"
                  width={500}
                  height={500}
                />
              )}
              <p className="mb-4">{post.content}</p>
            </>
          )}
        </div>
      </div>

      {!isEditingPost && (
        <>
          <div className="flex space-x-4 text-base text-gray-500 py-2 mb-3">
            <button
              onClick={handleLike}
              className={`flex items-center ${
                isLiked ? "text-red-500" : "hover:text-blue-500"
              }`}
            >
              ♡ {likeCount}
            </button>
            <button
              onClick={() => {
                setShowComments(!showComments);
                toggleCommentInput();
              }}
              className="hover:text-blue-500"
            >
              💬 {comments.length}
            </button>
          </div>

          {showCommentInput && currentUser && (
            <div className="mb-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 focus:outline-none bg-[#242424]  rounded-lg text-sm resize-none"
                placeholder="Write a comment..."
                rows={2}
              />
              <button
                onClick={addComment}
                className="mt-1 bg-[#292929] text-white px-3 py-1 rounded text-sm hover:bg-[#2d2d2d]"
              >
                Post Comment
              </button>
            </div>
          )}

          {showComments && (
            <div className="space-y-3 mt-3 pl-4 border-l-2 border-gray-200">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start">
                  <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 overflow-hidden">
                    {comment.userPhotoURL && (
                      <Image
                        src={comment.userPhotoURL}
                        alt={comment.userDisplayName}
                        className="w-full h-full object-cover"
                        width={32}
                        height={32}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {comment.userDisplayName}
                    </div>
                    {editingCommentId === comment.id ? (
                      <textarea
                        value={editedComment}
                        onChange={(e) => setEditedComment(e.target.value)}
                        className="w-full p-2 focus:outline-none bg-[#2a2a2a] resize-none rounded-lg text-sm"
                      />
                    ) : (
                      <p className="text-sm">{comment.content}</p>
                    )}
                    <div className="text-gray-500 text-xs">
                      {comment.createdAt?.toDate()
                        ? format(comment.createdAt.toDate(), "MMM d, h:mm a")
                        : "Just now"}
                    </div>
                    {currentUser?.uid === comment.userId && (
                      <div className="flex space-x-2 mt-1">
                        {editingCommentId === comment.id ? (
                          <button
                            onClick={() => saveEditedComment(comment.id)}
                            className="text-blue-500 text-xs"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleEditComment(comment.id, comment.content)
                            }
                            className="text-blue-500 text-xs"
                          >
                            Edit
                          </button>
                        )}
                        <div className="relative" ref={menuRef}>
                          <button
                            className="text-gray-500 text-xs"
                            onClick={toggleMenu}
                          >
                            ⋮
                          </button>
                          {showMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                              <button
                                onClick={() => deleteComment(comment.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                              >
                                Delete Comment
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
