import React, { useState, useEffect, useRef } from "react";
import Header from "../template/Header";
import Sidebar from "../template/SideBar";
import api from "../../api/axios";
import { se } from "date-fns/locale";
import { pre } from "framer-motion/client";
import socket from "../../socket"; // Import socket

function Forum() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [filter, setFilter] = useState("All");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inputKey, setInputKey] = useState(Date.now());
  const [isYourPostsOpen, setIsYourPostsOpen] = useState(true); 
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });

  const openLightbox = (images, startIndex = 0) => {
    setLightbox({ open: true, images, index: startIndex });
  };

  const closeLightbox = () => {
    setLightbox({ open: false, images: [], index: 0 });
  };
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFoundConfirm, setShowFoundConfirm] = useState(false);
  const [postToMarkFound, setPostToMarkFound] = useState(null);
  const [originalPost, setOriginalPost] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const emptyPostTemplate = {
    user: "You",
    type: "Lost",
    desc: "",
    images: [],
    contact: "",
    email: "",
    anonymous: false,
    date: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };

  const [newPost, setNewPost] = useState({ ...emptyPostTemplate });

  const [posts, setPosts] = useState([]);

  const fetchedOnce = useRef(false);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/forum");
      const data = res.data.posts;
      console.log("Raw Image Data", data[0]?.images);
      setPosts(data);
      const message = res.data.message || "✅ Forum posts fetched successfully.";
      console.log(message);
    } catch (err) {
      const message = err.response?.data?.message || "❌ Error fetching forum posts.";
      console.error(message);
    }
  };

  // ===========================================
  // 🔌 REAL-TIME SOCKET LISTENER FOR NEW POSTS
  // ===========================================
  useEffect(() => {
    console.log('🔌 Setting up real-time forum post listener...');
    
    // Listen for new forum posts
    socket.on('new_forum_post', (newPost) => {
      console.log('📢 [Socket] New real-time post received:', newPost);
      
      // Add the new post to the beginning of the posts array
      setPosts(prevPosts => [newPost, ...prevPosts]);
      
      // Show a small notification
      setSuccessMessage("New post arrived!");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage("");
      }, 2000);
    });

    // Listen for post deletions
  socket.on('delete_forum_post', ({ postId }) => {
    console.log('🗑️ [Socket] Post deleted:', postId);
    
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    
    // Also close modal if the deleted post is currently being viewed
    if (selectedPost?.id === postId) {
      setShowViewModal(false);
      setSelectedPost(null);
    }
    
    // Show a notification
    setSuccessMessage("A post was deleted");
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage("");
    }, 2000);
  });

    // Cleanup listener on component unmount
    return () => {
      console.log('🔌 Cleaning up real-time forum post listener');
      socket.off('new_forum_post');
    };
  }, []);

  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;
    fetchPosts();
  }, []);
  
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved) setDarkMode(saved === "true");
  }, []);
  
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const filteredPosts = posts.filter((p) => {
    const matchesFilter = filter === "All" ? true : p.type === filter;
    const matchesSearch =
      p.desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.user && p.user?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.petName &&
        p.petName?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const genId = (prefix = "") =>
    `${prefix}${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setNewPost((prev) => {
      const existingCount = prev.images?.filter(img => !img.removed).length || 0;
      const allowed = Math.max(0, 5 - existingCount);
      const toTake = files.slice(0, allowed);

      const created = toTake.map((f) => ({
        id: genId("img-"),
        url: URL.createObjectURL(f),
        name: f.name || "image",
        file: f,
        isDB: false,
        ...(prev.id && { removed: false })
      }));

      return { ...prev, images: [...(prev.images || []), ...created] };
    });

    e.target.value = "";
    setInputKey(Date.now());
  };

  const removeImageFromEditing = (imgId) => {
    setNewPost(prev => ({
      ...prev,
      images: prev.images.filter(img =>
        img.isDB ? true : img.id !== imgId
      ).map(img =>
        img.isDB && img.id === imgId ? { ...img, removed: true } : img
      )
    }));
  };

  const undoRemoveImage = (imgId) => {
    setNewPost(prev => ({
      ...prev,
      images: prev.images.map(img =>
        img.isDB && img.id === imgId
          ? { ...img, removed: false }
          : img
      )
    }));
  };

  const validatePrivacyConsent = () => {
    if (!privacyConsent) {
      setErrorMessage("❌ You must agree to the data privacy policy before posting.");
      setShowErrorModal(true);
      return false;
    }
    return true;
  };

  const handleCreateOrUpdatePost = () => {
    if (!newPost.desc.trim()){
      setErrorMessage("❌ Please provide a description");
      setShowErrorModal(true);
      return;
    }
    const imageCount = newPost.images.filter(img => !img.removed).length;
    if(imageCount > 5){
      setErrorMessage("❌ You can only upload up to 5 images.");
      setShowErrorModal(true);
      return;
    }

    // Check privacy consent for new posts
    if (!newPost.id && !validatePrivacyConsent()) {
      return;
    }

    // Create new post
    if(!newPost.id){
      const formData = new FormData();
      formData.append("postType", newPost.type);
      formData.append("description", newPost.desc);
      formData.append("contact", newPost.contact);
      formData.append("email", newPost.email);
      formData.append("isAnonymous", newPost.anonymous ? "1" : "0");

      newPost.images.forEach((img) => {
        if (img.file) {
          formData.append("image", img.file);
        }
      });

      api
        .post("/forum", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => {
          const createdPost = res.data;
          console.log("Post created:", createdPost);

          setShowCreateModal(false);
          setNewPost({ ...emptyPostTemplate, user: newPost.user });
          setPrivacyConsent(false);
          setInputKey(Date.now());

          setSuccessMessage("Post created successfully!");
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            setSuccessMessage("");
          }, 3000);
        })
        .catch((err) => {
          const message = err.response?.data?.message || "❌ Error creating post.";
          console.error(message);
          setErrorMessage(message);
          setShowErrorModal(true);
        });
      return;
    }
    // Update existing post
    const updates = {};

    if (newPost.desc !== originalPost.desc) updates.description = newPost.desc;
    if (newPost.contact !== originalPost.contact) updates.contact = newPost.contact;
    if (newPost.email !== originalPost.email) updates.email = newPost.email;
    if ((newPost.anonymous || false) !== (originalPost.anonymous || false)) {
      updates.isAnonymous = newPost.anonymous ? "1" : "0";
    }
    
    const deletedImages = originalPost.images
      .filter(orig => newPost.images.some(newImg => newImg.id === orig.id && newImg.removed))
      .map(img => img.id);

    const newImages = newPost.images.filter(img => img.file && !img.removed);


    if (Object.keys(updates).length === 0 && deletedImages.length === 0 && newImages.length === 0) {
      setErrorMessage("No changes made to the post.");
      setShowErrorModal(true);
      return;
    }

    const formData = new FormData();
    Object.entries(updates).forEach(([key, value]) => { 
      formData.append(key, value);
    });
    deletedImages.forEach(id => formData.append("deletedImages[]", id));
    newImages.forEach(img => formData.append("image", img.file));

    api.put(`/forum/${newPost.id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => {
      const updatedPost = res.data;
      console.log("Post updated:", updatedPost);

      setShowCreateModal(false);
      setNewPost({ ...emptyPostTemplate, user: newPost.user });
      setOriginalPost(null);
      setPrivacyConsent(false);
      setInputKey(Date.now());

      setSuccessMessage("Post updated successfully!");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage("");
      }, 3000);
    })
    .catch((err) => {
      const message = err.response?.data?.message || "❌ Error updating post.";
      console.error(message);
      setErrorMessage(message);
      setShowErrorModal(true);
    });
  };

  const handleEditPost = (post) => {
    const clone = structuredClone(post);
    if (clone.images) {
      clone.images = clone.images.map(img => ({
        ...img,
        id: img.id, 
        removed: false ,
        isDB: true,
      }));
    }
    setNewPost(clone);
    setOriginalPost(clone);
    setInputKey(Date.now());
    setShowCreateModal(true);
  };

  const handleMarkAsFound = async (postId) => {
    try {
      await api.put(`/forum/${postId}`, { postType: "Found" });
      setShowViewModal(false);

      setSuccessMessage("Post marked as Found!");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      const message = err.response?.data?.message || " Error updating post.";
      console.error(message);
      setErrorMessage(message);
      setShowErrorModal(true);
    }
  };

  const handleDeletePost = async () => {
    try {
      await api.delete(`/forum/${postToDelete}`);

      setSuccessMessage("Post deleted successfully!");
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      const message = err.response?.data?.message || "❌ Error deleting post.";
      console.error(message);
      setErrorMessage(message);
      setShowErrorModal(true);
    }
  };

  const accID = localStorage.getItem("userId");
  const userPosts = posts.filter((p) => p.accID == accID);


  // Data Privacy Modal
  const PrivacyPolicyModal = ({ onClose, onAccept }) => {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-3 sm:p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-popUp">
          <div className="p-4 sm:p-5 md:p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
              Data Privacy Notice
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="fa-solid fa-times text-lg sm:text-xl"></i>
            </button>
          </div>
          
          <div className="p-4 sm:p-5 md:p-6 overflow-y-auto max-h-[60vh]">
            <div className="space-y-4 text-xs sm:text-sm text-gray-700">
              <p className="font-medium text-[#2FA394]">Last Updated: February 2026</p>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">1. Information We Collect</h3>
                <p>When you post in our forum, we may collect:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Your name (if not posting anonymously)</li>
                  <li>Contact information you choose to share (phone, email)</li>
                  <li>Images you upload of pets</li>
                  <li>Descriptions and details about lost/found pets</li>
                  <li>IP address and timestamps of posts</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">2. How We Use Your Information</h3>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>To help reunite lost pets with their owners</li>
                  <li>To facilitate community communication about found pets</li>
                  <li>To improve our forum and services</li>
                  <li>To prevent fraudulent or inappropriate posts</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">3. Information Sharing</h3>
                <p>Your posted information will be visible to other community members. We do not sell your personal data to third parties. We may share information:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>With veterinary clinics to help identify pets</li>
                  <li>When required by law enforcement</li>
                  <li>To protect the safety of our community</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">4. Your Rights</h3>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>You may request deletion of your posts</li>
                  <li>You can choose to post anonymously</li>
                  <li>You can contact us to update or remove your information</li>
                  <li>You may withdraw consent at any time by deleting your posts</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">5. Data Retention</h3>
                <p>We retain forum posts until you delete them or request removal. Images and descriptions may remain visible to the community until removed.</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                <p className="text-yellow-800 text-xs sm:text-sm">
                  <i className="fa-solid fa-shield-heart mr-2"></i>
                  By posting in our forum, you acknowledge that your information will be publicly visible to other community members. Please do not share sensitive personal information.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 md:p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#2FA394] text-white hover:bg-[#24907e] font-semibold transition-all text-xs sm:text-sm"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`font-sansation min-h-screen ${
        darkMode ? "bg-[#121212] text-white" : "bg-[#F7F9FA] text-gray-800"
      }`}
    >
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        setIsMenuOpen={setIsMenuOpen}
      />

      <div className="flex flex-col md:flex-row gap-4 md:gap-5 px-4 sm:px-6 md:px-8 lg:px-12">
        <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

        <div
          className={`transition-all duration-500 flex flex-col gap-4 sm:gap-6 w-full ${
            !isMenuOpen ? "md:w-full" : "md:w-[calc(100%-260px)]"
          }`}
        >
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 sm:gap-5 md:gap-6 min-h-[calc(100vh-100px)]">
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl overflow-y-auto max-h-[calc(100vh-100px)]">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2">
                <h1 className="font-baloo text-xl sm:text-2xl md:text-3xl">
                  Lost Pets Board
                </h1>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Report missing pets or share details about pets you've found.
                </p>
              </div>

              {/* Posts */}
              {filteredPosts.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <i className="fa-solid fa-paw text-3xl sm:text-4xl mb-3 text-gray-300"></i>
                  <p className="text-sm sm:text-base">No posts found</p>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => {
                      setSelectedPost(post);
                      setShowViewModal(true);
                    }}
                    className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer p-3 sm:p-4 md:p-5 border border-gray-100"
                  >
                    {/* Post Header */}
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#E3FAF7] flex items-center justify-center text-[#05A1B6] font-bold text-xs sm:text-sm flex-shrink-0">
                        {post.user?.[0] || "U"}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-semibold text-sm sm:text-base truncate">{post.user}</span>
                        <span className="text-[10px] sm:text-xs text-gray-400">{post.date}</span>
                      </div>
                      <span
                        className={`ml-auto text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full font-semibold whitespace-nowrap flex-shrink-0 ${
                          post.type === "Lost"
                            ? "bg-[#FFE5E5] text-[#C62828]"
                            : "bg-[#E0F2F1] text-[#00695C]"
                        }`}
                      >
                        {post.type}
                      </span>
                    </div>

                    {/* Images Grid */}
                    {post.images?.length > 0 && (
                      <div
                        className={`grid gap-1 sm:gap-2 mb-2 sm:mb-3 ${
                          post.images.length === 1
                            ? "grid-cols-1 max-w-[200px] sm:max-w-[250px] md:max-w-[300px]" // Limit width for single image
                            : post.images.length === 2
                            ? "grid-cols-2"
                            : post.images.length === 3
                            ? "grid-cols-3"
                            : "grid-cols-3 sm:grid-cols-4"
                        }`}
                      >
                        {post.images.slice(0, 4).map((img, i) => (
                          <div key={i} className="relative aspect-square">
                            <img
                              src={img.url || img}
                              alt={`pet-${i}`}
                              className="rounded-lg w-full h-full object-cover cursor-zoom-in hover:opacity-90 transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                const urls = post.images.map(x => x.url || x);
                                openLightbox(urls, i);
                              }}
                            />
                            {post.images.length > 4 && i === 3 && (
                              <div
                                className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center text-white font-semibold text-sm sm:text-base cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const urls = post.images.map(x => x.url || x);
                                  openLightbox(urls, 3); // start at 4th image
                                }}
                              >
                                +{post.images.length - 4}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-xs sm:text-sm leading-relaxed text-gray-700 break-words line-clamp-3">
                      {post.desc}
                    </p>
                    
                    {/* Contact Info */}
                    {(post.contact || post.email) && (
                      <div className="mt-2 space-y-0.5">
                        {post.contact && (
                          <p className="text-[10px] sm:text-xs text-gray-500 break-words flex items-center gap-1">
                            <i className="fa-solid fa-phone text-[#5EE6FE]"></i>
                            <span className="font-medium truncate">{post.contact}</span>
                          </p>
                        )}
                        {post.email && (
                          <p className="text-[10px] sm:text-xs text-gray-500 break-words flex items-center gap-1">
                            <i className="fa-solid fa-envelope text-[#5EE6FE]"></i>
                            <span className="font-medium truncate">{post.email}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* RIGHT COLUMN - Sidebar */}
            <div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl max-h-[calc(100vh-100px)] overflow-y-auto sticky top-[100px]">
              {/* Search Bar */}
              <div className="relative mt-1 sm:mt-2">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full border border-gray-300 rounded-full p-2 pl-8 sm:pl-10 text-xs sm:text-sm text-gray-700 focus:ring-2 focus:ring-[#5EE6FE] outline-none"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-3 flex-wrap">
                {["All", "Lost", "Found"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-none ${
                      filter === tab
                        ? "bg-[#5EE6FE] text-white shadow-md"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-[#5EE6FE]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Create Post Card */}
              <div className="bg-gradient-to-br from-[#E3FAF7] to-[#FDE2E4] rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-5 border border-gray-100 mt-2">
                <h3 className="font-semibold mb-1 sm:mb-2 text-gray-700 text-sm sm:text-base">
                  Create a Post
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                  Help the community by posting about a lost or found pet.
                </p>
                <button
                  onClick={() => {
                    setNewPost({ ...emptyPostTemplate, user: "You" });
                    setPrivacyConsent(false);
                    setInputKey(Date.now());
                    setShowCreateModal(true);
                  }}
                  className="w-full bg-[#5EE6FE] text-white rounded-full py-1.5 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-[#3ecbe0] transition-all"
                >
                  + New Post
                </button>
              </div>

              {/* Data Privacy Notice - Sidebar */}
              <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-100">
                <div className="flex items-start gap-2">
                  <i className="fa-solid fa-shield-heart text-blue-600 text-sm sm:text-base mt-0.5"></i>
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm text-blue-800 mb-1">
                      Your Privacy Matters
                    </h4>
                    <p className="text-[10px] sm:text-xs text-blue-700">
                      We care about your data. Read our{" "}
                      <button
                        onClick={() => setShowPrivacyModal(true)}
                        className="underline font-medium hover:text-blue-900"
                      >
                        privacy policy
                      </button>{" "}
                      to learn how we protect your information.
                    </p>
                  </div>
                </div>
              </div>

              {/* Your Posts - Collapsible */}
              {userPosts.length > 0 && (
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-5 border border-gray-100">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setIsYourPostsOpen(!isYourPostsOpen)}
                  >
                    <h3 className="font-semibold text-gray-700 text-sm sm:text-base">
                      Your Posts ({userPosts.length})
                    </h3>
                    <button className="text-gray-500 hover:text-[#5EE6FE] transition-colors">
                      <i className={`fa-solid fa-chevron-${isYourPostsOpen ? 'up' : 'down'} text-xs sm:text-sm`}></i>
                    </button>
                  </div>
                  
                  {isYourPostsOpen && (
                    <div className="space-y-2 max-h-64 overflow-y-auto mt-3">
                      {userPosts.map((post) => (
                        <div
                          key={post.id}
                          className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 border-b last:border-none pb-2 mb-2"
                        >
                          <span className="text-xs sm:text-sm break-words flex-1">
                            {post.desc.length > 20
                              ? `${post.desc.slice(0, 20)}...`
                              : post.desc}
                          </span>
                          <div className="flex gap-2 self-end xs:self-auto">
                            {post.type === "Lost" && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPostToMarkFound(post.id);
                                    setShowFoundConfirm(true);
                                  }}
                                  className="text-sm sm:text-lg text-green-600 hover:text-green-700"
                                  title="Mark as Found"
                                >
                                  <i className="fas fa-check-circle"></i>
                                </button>

                                <button
                                  onClick={() => handleEditPost(post)}
                                  className="text-sm sm:text-lg text-blue-600 hover:text-blue-700"
                                  title="Edit"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => {
                                setPostToDelete(post.id);
                                setShowDeleteConfirm(true);
                              }}
                              className="text-sm sm:text-lg text-red-600 hover:text-red-700"
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-[1100px] p-3 sm:p-4 md:p-6 animate-popUp max-h-[95vh] overflow-y-auto">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 md:gap-6">
              {/* On mobile: Image Upload first, Form second */}
              {/* On desktop: Form left, Image Upload right */}
              
              {/* Image Upload - Shows first on mobile, right side on desktop */}
              <div className="lg:w-1/2 order-1 lg:order-2 bg-gray-50 rounded-lg p-3 sm:p-4 flex flex-col gap-3 sm:gap-4">
                <div className="flex items-center justify-between sticky top-0 bg-gray-50 py-2 z-10">
                  <h4 className="font-semibold text-gray-700 text-xs sm:text-sm">
                    Images (up to 5)
                  </h4>
                  <span className="text-[10px] sm:text-xs text-gray-500">
                    {newPost.images.filter(img => !img.removed).length}/5
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 sm:gap-2 overflow-y-auto max-h-[300px] sm:max-h-[400px] p-1">
                  {newPost.images.map((img, index) => (
                    <div 
                      key={`${img.id}-${index}`}
                      className={`relative w-full aspect-square transition-all duration-300 ${
                        newPost.id && img.removed ? 'opacity-50 grayscale' : ''
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.name || "preview"}
                        className="w-full h-full object-cover rounded-lg border border-gray-200 cursor-zoom-in hover:opacity-90"
                        onClick={() =>
                          setLightbox({
                            open: true,
                            src: img.url,
                            alt: img.name || "preview",
                          })
                        }
                      />
                      
                      {newPost.id ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (img.removed) {
                              undoRemoveImage(img.id);
                            } else {
                              removeImageFromEditing(img.id);
                            }
                          }}
                          className={`absolute top-0.5 right-0.5 rounded-full w-4 h-4 sm:w-5 sm:h-5 text-[8px] sm:text-xs flex items-center justify-center transition-all ${
                            img.removed 
                              ? 'bg-green-500 text-white hover:bg-green-600' 
                              : 'bg-black/50 text-white hover:bg-black/70'
                          }`}
                        >
                          {img.removed ? '↶' : '×'}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setNewPost(prev => ({
                              ...prev,
                              images: prev.images.filter(image => image.id !== img.id)
                            }));
                          }}
                          className="absolute top-0.5 right-0.5 rounded-full w-4 h-4 sm:w-5 sm:h-5 text-[8px] sm:text-xs flex items-center justify-center bg-black/50 text-white hover:bg-black/70 transition-all"
                        >
                          ×
                        </button>
                      )}
                      
                      {newPost.id && img.removed && (
                        <div className="absolute inset-0 bg-red-100/20 border border-red-300 rounded-lg flex items-center justify-center">
                          <span className="text-red-500 text-[8px] sm:text-xs font-medium">Removed</span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {newPost.images.filter(img => !img.removed).length < 5 && (
                    <div className="relative w-full aspect-square">
                      <label
                        htmlFor="multiImageInput"
                        className="cursor-pointer w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-[#5EE6FE] hover:bg-[#e3faf7]/50 transition-all"
                      >
                        <span className="text-lg sm:text-2xl text-[#5EE6FE]">＋</span>
                        <span className="text-[8px] sm:text-xs text-gray-500">Add</span>
                      </label>
                      <input
                        key={inputKey}
                        id="multiImageInput"
                        type="file"
                        name="image"
                        accept=".png, .jpg, .jpeg, .webp"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                {newPost.id && newPost.images.filter(img => img.removed).length > 0 && (
                  <div className="flex items-center justify-between mt-2 p-1.5 sm:p-2 bg-yellow-50 rounded-lg border border-yellow-200 sticky bottom-0 bg-yellow-50">
                    <span className="text-[10px] sm:text-xs text-yellow-700">
                      {newPost.images.filter(img => img.removed).length} image(s) removed
                    </span>
                    <button
                      onClick={() => {
                        setNewPost(prev => ({
                          ...prev,
                          images: prev.images.map(img => ({
                            ...img,
                            removed: false
                          }))
                        }));
                      }}
                      className="text-[10px] sm:text-xs text-yellow-700 hover:text-yellow-900 font-medium underline"
                    >
                      Restore All
                    </button>
                  </div>
                )}
              </div>

              {/* LEFT: Form - Shows second on mobile, left side on desktop */}
              <div className="lg:w-1/2 order-2 lg:order-1 overflow-y-auto pr-1 sm:pr-2">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 sticky top-0 bg-white z-10 pb-2">
                  {newPost.id ? "Edit Post" : "Create New Post"}
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-gray-700">
                      Type
                    </label>
                    <select
                      value={newPost.type}
                      onChange={(e) =>
                        setNewPost({ ...newPost, type: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm text-gray-700 focus:ring-2 focus:ring-[#5EE6FE] outline-none"
                    >
                      <option value="Lost">Lost</option>
                      <option value="Found">Found</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={newPost.desc}
                      onChange={(e) =>
                        setNewPost({ ...newPost, desc: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm text-gray-700 focus:ring-2 focus:ring-[#5EE6FE] outline-none resize-none h-20 sm:h-24"
                      placeholder="Describe the pet, location, and other details..."
                    />
                  </div>

                  <div>
                    <label className="block mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-gray-700">
                      Contact
                    </label>
                    <input
                      type="text"
                      value={newPost.contact}
                      onChange={(e) =>
                        setNewPost({ ...newPost, contact: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm text-gray-700 focus:ring-2 focus:ring-[#5EE6FE] outline-none"
                      placeholder="Phone number or email"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newPost.email || ""}
                      onChange={(e) =>
                        setNewPost({ ...newPost, email: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm text-gray-700 focus:ring-2 focus:ring-[#5EE6FE] outline-none"
                      placeholder="Email address"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newPost.anonymous}
                      onChange={(e) =>
                        setNewPost({ ...newPost, anonymous: e.target.checked })
                      }
                      className="mr-2 w-3 h-3 sm:w-4 sm:h-4 text-[#5EE6FE] border-gray-300 rounded focus:ring-[#5EE6FE]"
                    />
                    <label className="text-xs sm:text-sm text-gray-700">
                      Post anonymously
                    </label>
                  </div>

                  {/* Data Privacy Consent - Only for new posts */}
                  {!newPost.id && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          id="privacyConsent"
                          checked={privacyConsent}
                          onChange={(e) => setPrivacyConsent(e.target.checked)}
                          className="mt-1 w-3 h-3 sm:w-4 sm:h-4 text-[#2FA394] border-gray-300 rounded focus:ring-[#5EE6FE] flex-shrink-0"
                        />
                        <div>
                          <label htmlFor="privacyConsent" className="text-xs sm:text-sm font-medium text-gray-700">
                            I agree to the{" "}
                            <button
                              type="button"
                              onClick={() => setShowPrivacyModal(true)}
                              className="text-[#2FA394] underline hover:text-[#24907e]"
                            >
                              Data Privacy Policy
                            </button>
                          </label>
                          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                            By checking this box, you acknowledge that your information will be publicly visible and you consent to our data collection practices.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 sm:gap-3 pt-2 sticky bottom-0 bg-white py-2 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setPrivacyConsent(false);
                      }}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all text-xs sm:text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateOrUpdatePost}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#5EE6FE] text-white hover:bg-[#3ecbe0] font-semibold transition-all text-xs sm:text-sm"
                    >
                      {newPost.id ? "Update" : "Post"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightbox.open && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] animate-fadeIn p-3 sm:p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-lg overflow-hidden flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* prev arrow */}
            {lightbox.images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox(l => ({
                    ...l,
                    index: (l.index - 1 + l.images.length) % l.images.length
                  }));
                }}
                className="absolute left-2 text-white bg-black/40 rounded-full p-2 hover:bg-black/60 transition"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
            )}

            <img
              src={lightbox.images[lightbox.index]}
              alt={`image-${lightbox.index + 1}`}
              className="w-full h-auto max-h-[90vh] object-contain"
            />

            {/* next arrow */}
            {lightbox.images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox(l => ({
                    ...l,
                    index: (l.index + 1) % l.images.length
                  }));
                }}
                className="absolute right-2 text-white bg-black/40 rounded-full p-2 hover:bg-black/60 transition"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            )}

            <button
              onClick={closeLightbox}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/60 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 text-sm sm:text-lg flex items-center justify-center hover:bg-black transition"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md p-4 sm:p-5 md:p-6 animate-popUp"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">
              Confirm Deletion
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-5 md:mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all text-xs sm:text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeletePost();
                  setShowDeleteConfirm(false);
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold transition-all text-xs sm:text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 sm:top-5 right-4 sm:right-5 z-50 w-64 sm:w-80 bg-green-600 text-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden animate-popUp">
          <div className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm">{successMessage}</div>
          <div className="h-1 bg-white animate-progress"></div>
        </div>
      )}

      {/* Found Confirmation Modal */}
      {showFoundConfirm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={() => setShowFoundConfirm(false)}
        >
          <div
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md p-4 sm:p-5 md:p-6 animate-popUp"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">
              Confirm Mark as Found
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-5 md:mb-6">
              Are you sure this pet has been found? This will mark the post as "Found".
            </p>
            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setShowFoundConfirm(false)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all text-xs sm:text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleMarkAsFound(postToMarkFound);
                  setShowFoundConfirm(false);
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-all text-xs sm:text-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={() => setShowErrorModal(false)}
        >
          <div
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md p-4 sm:p-5 md:p-6 animate-popUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                Error
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-5 md:mb-6">
              {errorMessage}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold transition-all text-xs sm:text-sm"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <PrivacyPolicyModal
          onClose={() => setShowPrivacyModal(false)}
          onAccept={() => setPrivacyConsent(true)}
        />
      )}
    </div>
  );
}

export default Forum;