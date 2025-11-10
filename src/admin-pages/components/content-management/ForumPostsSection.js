import { useState } from "react";
import { 
  Search, Filter, Trash2, Phone, Mail, Calendar,
  Image as ImageIcon, User, Archive, ArchiveRestore
} from "lucide-react";

const ForumPostsSection = ({ posts, onDelete, onArchive }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const types = ["All", "Lost", "Found"];
  const statuses = ["All", "Active", "Archived"];

  // Add more defensive programming
  const safePosts = Array.isArray(posts) ? posts : [];
  
  const filteredPosts = safePosts.filter(post => {
    // Add null checks for post properties
    if (!post) return false;
    
    const description = post.description || "";
    const type = post.type || "";
    const status = post.status || "active";
    
    const matchesSearch = description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "All" || type === typeFilter.toLowerCase();
    const matchesStatus = statusFilter === "All" || status === statusFilter.toLowerCase();
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeColor = (type) => {
    return type === "lost" ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800";
  };

  const getStatusColor = (status) => {
    return status === "archived" ? "bg-gray-100 text-gray-800" : "bg-blue-100 text-blue-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      {/* Search & Filter */}
      <div className="flex gap-2 mb-6 flex-wrap items-center">
        <div className="flex gap-2 items-center">
          {/* Search Bar */}
          <div className="relative w-full max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 p-2 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 w-full focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-2 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 w-32 focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50"
          >
            <option value="All">All Types</option>
            {types.filter(type => type !== "All").map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 w-32 focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <div className="max-w-sm mx-auto">
            <p className="text-gray-500">
              {searchQuery || typeFilter !== "All" || statusFilter !== "All"
                ? "No posts match your search"
                : "No forum posts available"
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div 
              key={post?.id || Math.random()} 
              className={`bg-white rounded-2xl border shadow-sm flex flex-col h-full ${
                post?.status === "archived" 
                  ? "border-gray-300 bg-gray-50 opacity-75" 
                  : "border-gray-200"
              }`}
            >
              {/* Header - Fixed height */}
              <div className="p-4 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(post?.type)}`}>
                      {post?.type === "lost" ? "Lost" : "Found"}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(post?.status)}`}>
                      {post?.status === "archived" ? "Archived" : "Active"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(post?.date)}</span>
                  </div>
                </div>
              </div>

              {/* Content - Flexible area that grows */}
              <div className="p-4 space-y-4 flex-grow">
                {/* Description */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Description:</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap min-h-[80px]">
                    {post?.description || "No description available"}
                  </p>
                </div>

                {/* Images */}
                {post?.images && post.images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Images ({post.images.length}):</h4>
                    <div className="flex gap-2">
                      {post.images.slice(0, 5).map((image, index) => (
                        <div key={index} className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      ))}
                      {post.images.length > 5 && (
                        <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                          +{post.images.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="bg-blue-50 rounded-lg p-3 space-y-2 border border-blue-200">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-blue-500" />
                    <span className={post?.anonymous ? "text-blue-600 italic" : "text-blue-700 font-medium"}>
                      {post?.anonymous ? "Anonymous User" : (post?.realName || "Unknown User")}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {post?.contactNumber && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Phone className="h-4 w-4 text-blue-500" />
                        <span>{post.contactNumber}</span>
                      </div>
                    )}
                    {post?.email && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span>{post.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions - Fixed at bottom */}
              <div className="p-4 border-t border-gray-100 rounded-b-2xl flex-shrink-0 mt-auto">
                <div className="flex justify-end gap-2">
                  {/* Archive/Restore Button */}
                  <button
                    onClick={() => onArchive(post?.id, post?.status === "archived" ? "active" : "archived")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors duration-200 text-sm font-medium ${
                      post?.status === "archived" 
                        ? "bg-green-600 text-white hover:bg-green-700" 
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    {post?.status === "archived" ? (
                      <>
                        <ArchiveRestore size={14} />
                        Restore
                      </>
                    ) : (
                      <>
                        <Archive size={14} />
                        Archive
                      </>
                    )}
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => onDelete(post?.id)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ForumPostsSection;