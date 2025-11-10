import { useState } from "react";
import { 
  Plus, Edit2, Trash2, Search, Filter, Video, Eye
} from "lucide-react";

const VideosSection = ({ videos, onAdd, onEdit, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const categories = ["All", "Training", "Health Tips", "Grooming", "Behavior", "Nutrition"];
  const statuses = ["All", "Published", "Draft"];

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || video.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || video.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Published": return "bg-green-100 text-green-800";
      case "Draft": return "bg-yellow-100 text-yellow-800";
      default: return "bg-blue-100 text-blue-800";
    }
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
      <div className="flex gap-2 mb-4 flex-wrap items-center justify-between">
        <div className="flex gap-2 items-center">
          {/* Search Bar */}
          <div className="relative w-full max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 p-2 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 w-full focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 w-36 focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50"
          >
            <option value="All">All Categories</option>
            {categories.filter(cat => cat !== "All").map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 w-36 focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50"
          >
            <option value="All">All Status</option>
            {statuses.filter(status => status !== "All").map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition font-medium text-sm"
        >
          <Plus size={16} />
          <span>Add New</span>
        </button>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-sm text-gray-600 font-semibold">Video</th>
              <th className="p-3 text-sm text-gray-600 font-semibold">Description</th>
              <th className="p-3 text-sm text-gray-600 font-semibold">Category</th>
              <th className="p-3 text-sm text-gray-600 font-semibold">Status</th>
              <th className="p-3 text-sm text-gray-600 font-semibold">Last Updated</th>
              <th className="p-3 text-sm text-gray-600 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVideos.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-6 text-gray-400">
                  No videos found.
                </td>
              </tr>
            ) : (
              filteredVideos.map((video) => (
                <tr
                  key={video.id}
                  className="border-t border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="p-3 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center border border-red-100">
                        <Video className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="font-medium text-gray-900">{video.title}</div>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-600 max-w-xs">
                    <div className="line-clamp-2">{video.shortDescription}</div>
                  </td>
                  <td className="p-3 text-sm">
                    <span className="inline-block px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {video.category}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(video.status)}`}>
                      {video.status || "Draft"}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-500">
                    {formatDate(video.updatedAt || video.createdAt)}
                  </td>
                  <td className="p-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(video)}
                        className="text-blue-500 hover:text-blue-700 transition"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(video.id)}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VideosSection;