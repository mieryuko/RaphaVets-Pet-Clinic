import { useState, useEffect } from "react";
import Header from "../template/Header";
import { Video, FileText, MessageSquare, Archive, ChevronDown, ChevronUp } from "lucide-react";
import api from "../../api/axios";

// Import components from organized structure
import {
  PetTipsSection,
  PetTipModal,
  VideosSection,
  VideoModal,
} from "../components/content-management";
import ForumPostsSection from "../components/content-management/ForumPostsSection";

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState("pet-tips");
  const [showPetTipModal, setShowPetTipModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showStats, setShowStats] = useState(true); // New state for stats visibility

  // State for data from backend
  const [petTips, setPetTips] = useState([]);
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [icons, setIcons] = useState([]);
  const [publicationStatuses, setPublicationStatuses] = useState([]);

  const [videoCategories, setVideoCategories] = useState([]);


  // Handle new video category creation
  const handleNewVideoCategoryCreated = async (newCategory) => {
    console.log('New video category created:', newCategory);
    await fetchVideoCategories(); // Refresh the video categories list
  };
  // Fetch videos
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/content/videos/videos/");
      setVideos(response.data.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
      alert('Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  // Fetch video categories
  const fetchVideoCategories = async () => {
    try {
      const response = await api.get("/admin/content/videos/categories");
      setVideoCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching video categories:', error);
    }
  };

  // Mock data for forum posts (not from backend)
  const [forumPosts, setForumPosts] = useState([
    {
      id: 1,
      type: "lost",
      description: "Lost near Central Park area. Last seen wearing a blue collar with identification tags. Very friendly and responds to the name Max. Has a small white patch on chest.",
      date: "2024-01-15",
      realName: "John Doe",
      anonymous: false,
      contactNumber: "+1 (555) 123-4567",
      email: "john@email.com",
      images: ["img1.jpg", "img2.jpg", "img3.jpg"],
      status: "active"
    },
    {
      id: 2,
      type: "found",
      description: "Found this beautiful Siamese cat near 5th Avenue. No collar or identification. Appears to be well-groomed and friendly. Currently being cared for while we look for the owner.",
      date: "2024-01-14",
      realName: "Sarah Wilson",
      anonymous: true,
      contactNumber: "+1 (555) 987-6543",
      email: "sarah@email.com",
      images: ["img1.jpg"],
      status: "archived"
    },
    {
      id: 3,
      type: "lost",
      description: "My Persian cat went missing from the Westside area. She's very shy and might hide if approached. Has distinctive blue eyes and long white fur. Please contact immediately if spotted.",
      date: "2024-01-13",
      realName: "Mike Chen",
      anonymous: false,
      contactNumber: "+1 (555) 456-7890",
      email: "mike@email.com",
      images: [],
      status: "active"
    }
  ]);

  // Stats state
  const [stats, setStats] = useState({
    publishedTips: 0,
    publishedVideos: 0,
    archives: 0,
    forumPosts: 0
  });

  

  // Fetch all data on component mount (except forum posts)
  useEffect(() => {
    fetchPetCareTips();
    fetchVideos(); 
    fetchCategories();
    fetchVideoCategories(); 
    fetchIcons();
    fetchPublicationStatuses();
  }, []);

  // Update stats when data changes
  useEffect(() => {
    updateStats();
  }, [petTips, videos, forumPosts]);

  // Fetch pet care tips
  const fetchPetCareTips = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/content/pet-care-tips");
      setPetTips(response.data.data);
    } catch (error) {
      console.error('Error fetching pet care tips:', error);
      alert('Failed to fetch pet care tips');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await api.get("/admin/content/pet-care-categories");
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch icons
  const fetchIcons = async () => {
    try {
      const response = await api.get("/admin/content/pet-care-tips/icons");
      setIcons(response.data.data);
    } catch (error) {
      console.error('Error fetching icons:', error);
    }
  };

  // Fetch publication statuses
  const fetchPublicationStatuses = async () => {
    try {
      const response = await api.get("/admin/content/publication-statuses");
      setPublicationStatuses(response.data.data);
    } catch (error) {
      console.error('Error fetching publication statuses:', error);
    }
  };

  // Handle new category creation
  const handleNewCategoryCreated = (newCategory) => {
    console.log('New category created:', newCategory);
    setCategories(prev => [...prev, newCategory]);
  };

  // Update stats
  const updateStats = () => {
    const publishedTips = petTips.filter(tip => tip.status === "Published").length;
    const publishedVideos = videos.filter(video => video.status === "Published").length;
    const archives = petTips.filter(tip => tip.status === "Archived").length + 
                    videos.filter(video => video.status === "Archived").length;
    
    setStats({
      publishedTips,
      publishedVideos,
      archives,
      forumPosts: forumPosts.length
    });
  };

  // Handle add/edit pet tip
  const handleAddPetTip = async (data) => {
    try {
      setLoading(true);


      const requestData = {
        title: data.title,
        shortDescription: data.shortDescription,
        detailedContent: data.detailedContent,
        learnMoreURL: data.learnMoreURL || '',
        iconID: data.iconID,
        petCareCategoryID: data.petCareCategoryID,
        pubStatusID: data.pubStatusID || 1
      };

      console.log('Final request data to backend:', requestData);

      let response;
      
      if (editingItem) {
        console.log('Updating existing tip with ID:', editingItem.id);
        response = await api.put(`/admin/content/pet-care-tips/updatePetCare/${editingItem.id}`, requestData);
      } else {
        console.log('Creating new tip');
        response = await api.post("/admin/content/pet-care-tips/createPetCare", requestData);
      }

      console.log('Backend response:', response.data);

      if (response.data.success) {
        await fetchPetCareTips();
        setShowPetTipModal(false);
        setEditingItem(null);
      } else {
        alert(response.data.message || 'Failed to save pet tip');
      }
    } catch (error) {
      console.error('Error saving pet tip:', error);
      console.error('Error details:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to save pet tip');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserId = async () => {
    try {
      const response = await api.get('/auth/current-user');
      if (response.data.success) {
        return response.data.data.accId;
      }
    } catch (error) {
      console.error('Error getting current user from API:', error);
    }
    
    return "no id";
  };

  // Handle delete pet tip
  const handleDeletePetTip = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pet tip?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.delete(`/admin/content/pet-care-tips/deletePetCare/${id}`);

      if (response.data.success) {
        await fetchPetCareTips();
      } else {
        alert(response.data.message || 'Failed to delete pet tip');
      }
    } catch (error) {
      console.error('Error deleting pet tip:', error);
      alert(error.response?.data?.message || 'Failed to delete pet tip');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit pet tip
  const handleEditPetTip = (item) => {
    console.log('Editing item data:', {
      id: item.id,
      title: item.title,
      pubStatusID: item.pubStatusID,
      status: item.status,
      iconID: item.iconID,
      petCareCategoryID: item.petCareCategoryID
    });
    
    setEditingItem(item);
    setShowPetTipModal(true);
  };

  // Handle edit video
  const handleEditVideo = (item) => {
    console.log('Editing video data:', {
      id: item.id,
      videoTitle: item.title,
      videoURL: item.videoURL,
      videoCategoryID: item.videoCategoryID,
      pubStatusID: item.pubStatusID,
      status: item.status
    });
    
    setEditingItem(item);
    setShowVideoModal(true);
  };

  // Handle add/edit video
  const handleAddVideo = async (data) => {
    try {
      setLoading(true);
      
      const currentUserId = await getCurrentUserId();
      
      if (!currentUserId) {
        alert('User not authenticated. Please log in again.');
        return;
      }

      const requestData = {
        videoTitle: data.videoTitle,
        videoURL: data.videoURL,
        videoCategoryID: data.videoCategoryID,
        pubStatusID: data.pubStatusID || 1
      };

      let response;
      
      if (editingItem) {
        response = await api.put(`/admin/content/videos/update/${editingItem.id}`, requestData);
      } else {
        response = await api.post("/admin/content/videos/create", requestData);
      }

      if (response.data.success) {
        await fetchVideos();
        setShowVideoModal(false);
        setEditingItem(null);
      } else {
        alert(response.data.message || 'Failed to save video');
      }
    } catch (error) {
      console.error('Error saving video:', error);
      alert(error.response?.data?.message || 'Failed to save video');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete video
  const handleDeleteVideo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.delete(`/admin/content/videos/delete/${id}`);

      if (response.data.success) {
        await fetchVideos();
      } else {
        alert(response.data.message || 'Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert(error.response?.data?.message || 'Failed to delete video');
    } finally {
      setLoading(false);
    }
  };

  // Forum post handlers - using mock data only
  const handleDeleteForumPost = (id) => {
    if (window.confirm('Are you sure you want to delete this forum post?')) {
      setForumPosts(prevPosts => prevPosts.filter(post => post.id !== id));
    }
  };

  const handleArchiveForumPost = (id, newStatus) => {
    setForumPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === id ? { ...post, status: newStatus } : post
      )
    );
  };

  return (
    <div className="flex flex-col h-screen bg-[#FBFBFB] p-6 gap-1 font-sans">
      <Header title=" Content Management" />

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">Loading...</div>
        </div>
      )}

      {/* Stats Section Header with Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Overview</h2>
        <button
          onClick={() => setShowStats(!showStats)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300"
        >
          {showStats ? (
            <>
              <ChevronUp size={16} />
              Hide Stats
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Show Stats
            </>
          )}
        </button>
      </div>

      {/* Stats Cards with Smooth Collapse/Expand */}
      <div className={`
        transition-all duration-500 ease-in-out overflow-hidden
        ${showStats ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 mb-0'}
      `}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 transform transition-transform duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold">Published Tips</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.publishedTips}</p>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 transform transition-transform duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-semibold">Published Videos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.publishedVideos}</p>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Video className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 transform transition-transform duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-semibold">Archives</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.archives}</p>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Archive className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200 transform transition-transform duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-semibold">Forum Posts</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.forumPosts}</p>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <MessageSquare className="h-6 w-6 text-orange-500" />
              </div>
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
            onEdit={handleEditPetTip}
            onDelete={handleDeletePetTip}
            loading={loading}
            allCategories={categories}
            allStatuses={publicationStatuses}
          />
        )}

        {/* Videos Tab */}
        {activeTab === "videos" && (
          <VideosSection
            videos={videos}
            onAdd={() => setShowVideoModal(true)}
            onEdit={handleEditVideo}
            onDelete={handleDeleteVideo}
            loading={loading}
            allCategories={videoCategories}
            allStatuses={publicationStatuses} 
          />
        )}

        {/* Forum Posts Tab */}
        {activeTab === "forum-posts" && (
          <ForumPostsSection
            posts={forumPosts}
            onDelete={handleDeleteForumPost}
            onArchive={handleArchiveForumPost}
          />
        )}
      </div>

      {/* Modals */}
      {showPetTipModal && (
        <PetTipModal
          item={editingItem}
          categories={categories}
          icons={icons}
          publicationStatuses={publicationStatuses}
          onClose={() => {
            setShowPetTipModal(false);
            setEditingItem(null);
          }}
          onSave={handleAddPetTip}
          loading={loading}
          onNewCategoryCreated={handleNewCategoryCreated}
        />
      )}

      {showVideoModal && (
        <VideoModal
          item={editingItem}
          categories={videoCategories}
          publicationStatuses={publicationStatuses}
          onClose={() => {
            setShowVideoModal(false);
            setEditingItem(null);
          }}
          onSave={handleAddVideo}
          loading={loading}
          onNewCategoryCreated={handleNewVideoCategoryCreated}
        />
      )}
    </div>
  );
};

export default ContentManagement;