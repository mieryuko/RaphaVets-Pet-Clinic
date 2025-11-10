import React, { useState, useEffect, useRef } from "react";
import Header from "../template/Header";
import Sidebar from "../template/SideBar";
import api from "../../api/axios";
import { se } from "date-fns/locale";

function Forum() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [filter, setFilter] = useState("All");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inputKey, setInputKey] = useState(Date.now());
  const [lightbox, setLightbox] = useState({ open: false, src: null, alt: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFoundConfirm, setShowFoundConfirm] = useState(false);
  const [postToMarkFound, setPostToMarkFound] = useState(null);

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

  
  //** Sample posts data for testing **
  const [posts, setPosts] = useState([
    {
      id: 1,
      type: "Lost",
      user: "You",
      petName: "Luna",
      images: [
        { id: "sample-1", url: "/images/sad-dog.png", name: "sad-dog.png" },
        {
          id: "sample-2",
          url: "/images/dog-profile.png",
          name: "dog-profile.png",
        },
        {
          id: "sample-2",
          url: "/images/dog-profile.png",
          name: "dog-profile.png",
        },
        {
          id: "sample-2",
          url: "/images/dog-profile.png",
          name: "dog-profile.png",
        },
        {
          id: "sample-2",
          url: "/images/dog-profile.png",
          name: "dog-profile.png",
        }
      ],
      desc: "Lost near Pembo, Taguig. Gray fur, blue collar. Please message if found!",
      contact: "09123456789",
      date: "Nov 5, 2025",
    },
    {
      id: 2,
      type: "Found",
      user: "Jordan Frando",
      petName: "Unknown",
      images: [
        {
          id: "sample-2",
          url: "/images/dog-profile.png",
          name: "dog-profile.png",
        },
      ],
      desc: "Found wandering near 7th Street. No tag but very friendly.",
      contact: "jordan@example.com",
      date: "Nov 7, 2025",
    },
  ]);
  
 /*
  const [posts, setPosts] = useState([]);

  const fetchedOnce = useRef(false);

  const fetchPosts = async () => {
      try {
        const res = await api.get("/forum"); // adjust the endpoint
        const data = res.data.posts;

        setPosts(data);
        const message = res.data.message || "✅ Forum posts fetched successfully.";
        console.log(message);
        alert(message);
      } catch (err) {
        const message = err.response?.data?.message || "❌ Error fetching forum posts.";
        console.error(message);
        alert(message);
      }
    };

  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;
    fetchPosts();
  }, []);
  */
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
      const existingCount = prev.images?.length || 0;
      const allowed = Math.max(0, 5 - existingCount);
      const toTake = files.slice(0, allowed);

      const created = toTake.map((f) => ({
        id: genId("img-"),
        url: URL.createObjectURL(f),
        name: f.name || "image",
        file: f,
      }));

      return { ...prev, images: [...(prev.images || []), ...created] };
    });

    e.target.value = "";
    setInputKey(Date.now());
  };

  const removeImageFromEditing = (imgId) => {
    setNewPost((prev) => ({
      ...prev,
      images: prev.images.filter((i) => {
        if (i.id === imgId && i.id.startsWith("img-"))
          URL.revokeObjectURL(i.url);
        return i.id !== imgId;
      }),
    }));
  };

  const handleCreateOrUpdatePost = () => {
    if (!newPost.desc.trim()) return;

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
        console.log("✅ Post created:", createdPost);
        
        //fetchPosts();
        setShowCreateModal(false);
        setNewPost({ ...emptyPostTemplate, user: newPost.user });
        setInputKey(Date.now());
      })
      .catch((err) => {
        const message =
          err.response?.data?.message || "❌ Error creating post.";
        console.error(message);
        alert(message);
      });
  };

  const handleEditPost = (post) => {
    const clone = JSON.parse(JSON.stringify(post));
    setNewPost(clone);
    setInputKey(Date.now());
    setShowCreateModal(true);
  };

  const handleMarkAsFound = (postId) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, type: "Found" } : p))
    );
    setShowViewModal(false);

    setSuccessMessage("Post has been marked as found.");
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage("");
    }, 3000);
  };

  const userPosts = posts.filter((p) => p.user === "You");

  const closeLightbox = () => {
    setLightbox({ open: false, src: null, alt: "" });
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

      <div className="flex flex-row gap-5 px-5 sm:px-12">
        <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

        <div
          className={`transition-all duration-500 flex flex-col gap-6 w-full ${
            !isMenuOpen ? "md:w-full" : "md:w-[calc(100%-260px)]"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 h-[calc(100vh-80px)]">
            {/* LEFT WRAPPER */}
            <div className="flex flex-col gap-4 p-4 bg-white rounded-xl overflow-y-auto">
              <h1 className="font-baloo text-xl sm:text-3xl px-2">
                Lost & Found Forum
              </h1>
              <p className="text-gray-500 text-sm sm:text-base px-2">
                Report missing pets or share details about pets you’ve found.
              </p>

              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => {
                    setSelectedPost(post);
                    setShowViewModal(true);
                  }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer p-5 border border-gray-100"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#E3FAF7] flex items-center justify-center text-[#05A1B6] font-bold">
                      {post.user?.[0] || "U"}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold">{post.user}</span>
                      <span className="text-xs text-gray-400">{post.date}</span>
                    </div>
                    <span
                      className={`ml-auto text-xs px-3 py-1 rounded-full font-semibold ${
                        post.type === "Lost"
                          ? "bg-[#FFE5E5] text-[#C62828]"
                          : "bg-[#E0F2F1] text-[#00695C]"
                      }`}
                    >
                      {post.type}
                    </span>
                  </div>

                  {post.images?.length > 0 && (
                    <div
                      className={`grid gap-2 mb-3 ${
                        post.images.length === 1
                          ? "grid-cols-1"
                          : post.images.length === 2
                          ? "grid-cols-2"
                          : "grid-cols-3 sm:grid-cols-4"
                      }`}
                    >
                      {post.images.map((img, i) => (
                        <img
                          key={i}
                          src={img.url || img}
                          alt={`pet-${i}`}
                          className="rounded-lg w-full aspect-square object-cover cursor-zoom-in hover:opacity-90 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightbox({
                              open: true,
                              src: img.url || img,
                              alt: img.name || `pet-${i}`,
                            });
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <p className="text-sm leading-relaxed text-gray-700 break-words">
                    {post.desc}
                  </p>
                  {post.contact && (
                    <p className="mt-2 text-xs text-gray-500 break-words">
                      📞 Contact:{" "}
                      <span className="font-medium">{post.contact}</span>
                    </p>
                  )}
                  {post.email && (
                    <p className="mt-1 text-xs text-gray-500 break-words">
                      📧 Email:{" "}
                      <span className="font-medium">{post.email}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* RIGHT WRAPPER */}
            <div className="flex flex-col gap-4 p-4 bg-white rounded-xl">
              <div className="mt-4 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full border border-gray-300 rounded-3xl p-2 pl-10 text-gray-700 focus:ring-2 focus:ring-[#5EE6FE] outline-none"
                />
              </div>

              <div className="flex gap-2 mt-4 sm:mt-0">
                {["All", "Lost", "Found"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      filter === tab
                        ? "bg-[#5EE6FE] text-white shadow-md"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-[#5EE6FE]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Create Post */}
              <div className="bg-gradient-to-br from-[#E3FAF7] to-[#FDE2E4] rounded-xl shadow-sm p-5 border border-gray-100">
                <h3 className="font-semibold mb-2 text-gray-700">
                  Create a Post
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Help the community by posting about a lost or found pet.
                </p>
                <button
                  onClick={() => {
                    setNewPost({ ...emptyPostTemplate, user: "You" });
                    setInputKey(Date.now());
                    setShowCreateModal(true);
                  }}
                  className="w-full bg-[#5EE6FE] text-white rounded-full py-2 font-semibold hover:bg-[#3ecbe0] transition-all"
                >
                  + New Post
                </button>
              </div>

              {/* Your Posts */}
              {userPosts.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                  <h3 className="font-semibold mb-3 text-gray-700">
                    Your Posts
                  </h3>
                  {userPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex justify-between items-center border-b last:border-none pb-2 mb-2"
                    >
                      <span className="text-sm break-words">
                        {post.desc.length > 15
                          ? `${post.desc.slice(0, 15)}...`
                          : post.desc}
                      </span>
                      <div className="flex gap-2">
                        {post.type === "Lost" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPostToMarkFound(post.id);
                              setShowFoundConfirm(true);
                            }}
                            className="text-lg text-green-600 font-semibold hover:underline"
                            title="Mark as Found"
                          >
                            <i className="fas fa-check-circle"></i>
                          </button>
                        )}

                        {post.type === "Lost" && (
                          <button
                            onClick={() => handleEditPost(post)}
                            className="text-lg text-blue-600 font-semibold hover:underline"
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setPostToDelete(post.id);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-lg text-red-600 font-semibold hover:underline"
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
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[1100px] p-6 animate-popUp max-h-[95vh] overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-6 h-full">
              {/* LEFT: Form */}
              <div className="lg:w-1/2 overflow-y-auto pr-2">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  {newPost.id ? "Edit Post" : "Create New Post"}
                </h2>

                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  value={newPost.type}
                  onChange={(e) =>
                    setNewPost({ ...newPost, type: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 mb-4 text-gray-700 focus:ring-2 focus:ring-[#5EE6FE] outline-none"
                >
                  <option value="Lost">Lost</option>
                  <option value="Found">Found</option>
                </select>

                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={newPost.desc}
                  onChange={(e) =>
                    setNewPost({ ...newPost, desc: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 mb-4 text-gray-700 focus:ring-2 focus:ring-[#5EE6FE] outline-none resize-none h-36"
                  placeholder="Describe the pet, location, and other details..."
                />

                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Contact
                </label>
                <input
                  type="text"
                  value={newPost.contact}
                  onChange={(e) =>
                    setNewPost({ ...newPost, contact: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 mb-4 text-gray-700 focus:ring-2 focus:ring-[#5EE6FE] outline-none"
                  placeholder="Phone number or email"
                />

                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={newPost.email || ""}
                  onChange={(e) =>
                    setNewPost({ ...newPost, email: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 mb-4 text-gray-700 focus:ring-2 focus:ring-[#5EE6FE] outline-none"
                  placeholder="Email address"
                />

                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={newPost.anonymous}
                    onChange={(e) =>
                      setNewPost({ ...newPost, anonymous: e.target.checked })
                    }
                    className="mr-2 w-4 h-4 text-[#5EE6FE] border-gray-300 rounded focus:ring-[#5EE6FE]"
                  />
                  <label className="text-sm text-gray-700">
                    Post anonymously
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateOrUpdatePost}
                    className="px-4 py-2 rounded-lg bg-[#5EE6FE] text-white hover:bg-[#3ecbe0] font-semibold transition-all"
                  >
                    {newPost.id ? "Update" : "Post"}
                  </button>
                </div>
              </div>

              {/* RIGHT: Image Upload */}
              <div className="lg:w-1/2 bg-gray-50 rounded-lg p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-700">
                    Images (up to 5)
                  </h4>
                  <span className="text-xs text-gray-500">
                    {newPost.images.length}/5
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {newPost.images.map((img) => (
                    <div key={img.id} className="relative w-full aspect-square">
                      <img
                        src={img.url || img}
                        alt={img.name || "preview"}
                        className="w-full h-full object-cover rounded-lg border border-gray-200 cursor-zoom-in hover:opacity-90"
                        onClick={() =>
                          setLightbox({
                            open: true,
                            src: img.url || img,
                            alt: img.name || "preview",
                          })
                        }
                      />
                      <button
                        onClick={() => removeImageFromEditing(img.id)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {newPost.images.length < 5 && (
                    <div className="relative w-full aspect-square">
                      <label
                        htmlFor="multiImageInput"
                        className="cursor-pointer w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-[#5EE6FE] hover:bg-[#e3faf7]/50 transition-all"
                      >
                        <span className="text-3xl text-[#5EE6FE]">＋</span>
                        <span className="text-xs text-gray-500">Add Image</span>
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightbox.open && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] animate-fadeIn"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-3xl w-[90%] bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightbox.src}
              alt={lightbox.alt}
              className="w-full h-auto max-h-[90vh] object-contain"
            />
            <button
              onClick={closeLightbox}
              className="absolute top-3 right-3 bg-black/60 text-white rounded-full w-8 h-8 text-lg flex items-center justify-center hover:bg-black transition"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-popUp"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this post?
            </p>
            <div className="flex justify-end gap-3">
              {/* Cancel button */}
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setPosts((prev) => prev.filter((p) => p.id !== postToDelete));
                  setShowDeleteConfirm(false);

                  setSuccessMessage("🗑️ Post deleted successfully!");
                  setShowSuccess(true);

                  setTimeout(() => {
                    setShowSuccess(false);
                    setSuccessMessage("");
                  }, 3000);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed top-5 right-5 z-50 w-80 bg-green-600 text-white rounded-xl shadow-lg overflow-hidden animate-popUp">
          <div className="p-4">{successMessage}</div>
          {/* Bottom progress bar */}
          <div className="h-1 bg-white animate-progress"></div>
        </div>
      )}

      {showFoundConfirm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
          onClick={() => setShowFoundConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-popUp"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Confirm Mark as Found
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure this pet has been found? This will mark the post as
              "Found".
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowFoundConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleMarkAsFound(postToMarkFound);
                  setShowFoundConfirm(false);
                }}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Forum;
