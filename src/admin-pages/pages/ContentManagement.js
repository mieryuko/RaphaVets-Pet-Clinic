import { useState } from "react";
import Header from "../template/Header";
import { Video, FileText, MessageSquare, Archive } from "lucide-react";

// Import components from organized structure
import {
  PetTipsSection,
  PetTipModal,
  VideosSection,
  VideoModal,
  ForumPostsSection
} from "../components/content-management";

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState("pet-tips");
  const [showPetTipModal, setShowPetTipModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Sample data
  const [petTips, setPetTips] = useState([
    {
      id: 1,
      icon: "scissors",
      category: "Hygiene",
      title: "Brush Your Dog's Fur Daily",
      shortDescription: "Prevents mats and reduces shedding",
      longDescription: "Use a suitable brush to remove loose hair and prevent tangles...",
      url: "https://example.com/dog-grooming",
      status: "Published",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15"
    },
    {
      id: 2,
      icon: "dumbbell",
      category: "Exercise",
      title: "Give 30-Minute Walks Daily",
      shortDescription: "Keeps your dog healthy and active",
      longDescription: "Walk your dog twice a day or a single 30-minute session...",
      url: "https://example.com/dog-walking",
      status: "Draft",
      createdAt: "2024-01-14",
      updatedAt: "2024-01-14"
    }
  ]);

  const [videos, setVideos] = useState([
    {
      id: 1,
      category: "Training",
      title: "Basic Obedience Training",
      shortDescription: "Essential commands every dog should know",
      youtubeUrl: "https://youtube.com/watch?v=example"
    }
  ]);

  const petCategories = ["Health", "Nutrition", "Exercise", "Hygiene", "Behavior"];
  const videoCategories = ["Training", "Health Tips", "Grooming", "Behavior"];

  // Calculate stats
  const totalPublishedTips = petTips.filter(tip => tip.status === "Published").length;
  const totalPublishedVideos = 12;
  const totalArchives = petTips.filter(tip => tip.status === "Archived").length + 8;
  const totalForumPosts = 45;

  const handleAddPetTip = (data) => {
    if (editingItem) {
      setPetTips(petTips.map(tip => tip.id === editingItem.id ? { ...data, id: editingItem.id } : tip));
    } else {
      setPetTips([...petTips, { ...data, id: Date.now() }]);
    }
    setShowPetTipModal(false);
    setEditingItem(null);
  };

  const handleAddVideo = (data) => {
    if (editingItem) {
      setVideos(videos.map(video => video.id === editingItem.id ? { ...data, id: editingItem.id } : video));
    } else {
      setVideos([...videos, { ...data, id: Date.now() }]);
    }
    setShowVideoModal(false);
    setEditingItem(null);
  };

  const handleEdit = (item, type) => {
    setEditingItem(item);
    if (type === 'pet-tips') {
      setShowPetTipModal(true);
    } else if (type === 'videos') {
      setShowVideoModal(true);
    }
  };

  const handleDelete = (id, type) => {
    if (type === 'pet-tips') {
      setPetTips(petTips.filter(tip => tip.id !== id));
    } else if (type === 'videos') {
      setVideos(videos.filter(video => video.id !== id));
    } else if (type === 'forum-posts') {
      setForumPosts(forumPosts.filter(post => post.id !== id));
    }
  };

  const [forumPosts, setForumPosts] = useState([
    {
      id: 1,
      type: "lost",
      petName: "Max",
      description: "Golden retriever lost near Central Park. Wearing blue collar.",
      date: "2024-01-15",
      user: "john_doe",
      anonymous: false,
      contactNumber: "+1 (555) 123-4567",
      email: "john@email.com",
      images: ["img1.jpg", "img2.jpg"]
    },
    {
      id: 2,
      type: "found",
      petName: "Unknown Cat",
      description: "Found Siamese cat near 5th Avenue. No collar.",
      date: "2024-01-14",
      user: "sarah_wilson",
      anonymous: true,
      contactNumber: "",
      email: "",
      images: ["img1.jpg"]
    },
    {
      id: 3,
      type: "lost",
      petName: "Bella",
      description: "Persian cat missing from Westside area. Very shy.",
      date: "2024-01-13",
      user: "mike_chen",
      anonymous: false,
      contactNumber: "+1 (555) 987-6543",
      email: "mike@email.com",
      images: []
    }
  ]);

  return (
    <div className="flex flex-col h-screen bg-[#FBFBFB] p-6 gap-2 font-sans">
      <Header title="Content Management" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-semibold">Published Tips</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalPublishedTips}</p>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-semibold">Published Videos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalPublishedVideos}</p>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Video className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-semibold">Archives</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalArchives}</p>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Archive className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-semibold">Forum Posts</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalForumPosts}</p>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <MessageSquare className="h-6 w-6 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-2 relative">
        {[
          { id: "pet-tips", name: "Pet Tips", icon: FileText },
          { id: "videos", name: "Videos", icon: Video },
          { id: "forum-posts", name: "Forum Posts", icon: MessageSquare }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-5 py-2 font-semibold text-sm transition-colors ${
              activeTab === tab.id
                ? "text-[#5EE6FE]"
                : "text-gray-600 hover:text-[#5EE6FE]"
            }`}
          >
            <div className="flex items-center gap-2">
              <tab.icon size={18} />
              <span>{tab.name}</span>
            </div>
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 w-full h-1 bg-[#5EE6FE] rounded-t-lg" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {/* Pet Tips Tab */}
        {activeTab === "pet-tips" && (
          <PetTipsSection
            petTips={petTips}
            onAdd={() => setShowPetTipModal(true)}
            onEdit={(item) => handleEdit(item, 'pet-tips')}
            onDelete={(id) => handleDelete(id, 'pet-tips')}
          />
        )}

        {/* Videos Tab */}
        {activeTab === "videos" && (
          <VideosSection
            videos={videos}
            onAdd={() => setShowVideoModal(true)}
            onEdit={(item) => handleEdit(item, 'videos')}
            onDelete={(id) => handleDelete(id, 'videos')}
          />
        )}

        {/* Forum Posts Tab */}
        {activeTab === "forum-posts" && (
          <ForumPostsSection
            posts={forumPosts}
            onDelete={(id) => handleDelete(id, 'forum-posts')}
          />
        )}
      </div>

      {/* Modals */}
      {showPetTipModal && (
        <PetTipModal
          item={editingItem}
          categories={petCategories}
          onClose={() => {
            setShowPetTipModal(false);
            setEditingItem(null);
          }}
          onSave={handleAddPetTip}
        />
      )}

      {showVideoModal && (
        <VideoModal
          item={editingItem}
          categories={videoCategories}
          onClose={() => {
            setShowVideoModal(false);
            setEditingItem(null);
          }}
          onSave={handleAddVideo}
        />
      )}
    </div>
  );
};

export default ContentManagement;