import { useState } from "react";
import { 
  Search, Filter, Trash2, Archive, User, Phone, Mail, Calendar,
  Image as ImageIcon
} from "lucide-react";

const ForumPostsSection = ({ posts, onDelete, onArchive }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const types = ["All", "Lost", "Found"];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "All" || post.type === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type) => {
    return type === "lost" ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800";
  };

  const formatDate = (dateString) => {
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
              placeholder="Search pets or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 p-2 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 w-full focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50"
            />
          </div>

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
        </div>
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <div className="max-w-sm mx-auto">
            <p className="text-gray-500">
              {searchQuery || typeFilter !== "All"
                ? "No posts match your search"
                : "No forum posts available"
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              {/* Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(post.type)}`}>
                    {post.type === "lost" ? "Lost" : "Found"}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(post.date)}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900">{post.petName}</h3>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Description */}
                <div>
                  <p className="text-sm text-gray-700">{post.description}</p>
                </div>

                {/* Images */}
                {post.images && post.images.length > 0 && (
                  <div className="flex gap-2">
                    {post.images.slice(0, 3).map((image, index) => (
                      <div key={index} className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                    {post.images.length > 3 && (
                      <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                        +{post.images.length - 3}
                      </div>
                    )}
                  </div>
                )}

                {/* Contact Information */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className={post.anonymous ? "text-gray-500 italic" : "text-gray-700"}>
                      {post.anonymous ? "Anonymous" : post.user}
                    </span>
                  </div>
                  
                  {!post.anonymous && (
                    <>
                      {post.contactNumber && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{post.contactNumber}</span>
                        </div>
                      )}
                      {post.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{post.email}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onArchive(post.id)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
                  >
                    <Archive size={14} />
                    Archive
                  </button>
                  <button
                    onClick={() => onDelete(post.id)}
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