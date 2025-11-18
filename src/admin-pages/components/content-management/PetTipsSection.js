import { useState } from "react";
import { 
  Plus, Edit2, Trash2, Search, Filter, Eye
} from "lucide-react";

import DeleteModal from "./DeleteTipModal";

const PetTipsSection = ({ petTips, onAdd, onEdit, onDelete, loading, allCategories = [], allStatuses = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tipToDelete, setTipToDelete] = useState(null);

  // Get categories - use allCategories from database if provided, otherwise extract from petTips
  const categories = ["All", ...(allCategories.length > 0 
    ? allCategories.map(cat => cat.name || cat.categoryName) 
    : [...new Set(petTips.map(tip => tip.category).filter(Boolean))]
  )];

  // Get statuses - use allStatuses from database if provided, otherwise extract from petTips
  const statuses = ["All", ...(allStatuses.length > 0 
    ? allStatuses.map(status => status.name || status.pubStatus) 
    : [...new Set(petTips.map(tip => tip.status).filter(Boolean))]
  )];

  // Count tips per category for display
  const getCategoryCount = (categoryName) => {
    if (categoryName === "All") return petTips.length;
    return petTips.filter(tip => tip.category === categoryName).length;
  };

  // Count tips per status for display
  const getStatusCount = (statusName) => {
    if (statusName === "All") return petTips.length;
    return petTips.filter(tip => tip.status === statusName).length;
  };

  const filteredTips = petTips.filter(tip => {
    const matchesSearch = tip.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tip.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || tip.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || tip.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Published": return "bg-green-100 text-green-800";
      case "Draft": return "bg-yellow-100 text-yellow-800";
      case "Archived": return "bg-gray-100 text-gray-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const handleDeleteClick = (tip) => {
    setTipToDelete(tip);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (tipToDelete) {
      onDelete(tipToDelete.id);
      setDeleteModalOpen(false);
      setTipToDelete(null);
    }
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
              placeholder="Search tips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 p-2 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 w-full focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50"
            />
          </div>

          {/* Category Filter - Shows ALL categories from database */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 w-48 focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50"
          >
            {categories.map((category) => {
              const count = getCategoryCount(category);
              return (
                <option key={category} value={category}>
                  {category === "All" ? `All Categories (${count})` : `${category} (${count})`}
                </option>
              );
            })}
          </select>

          {/* Status Filter - Shows ALL statuses from database */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 w-48 focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50"
          >
            {statuses.map((status) => {
              const count = getStatusCount(status);
              return (
                <option key={status} value={status}>
                  {status === "All" ? `All Status (${count})` : `${status} (${count})`}
                </option>
              );
            })}
          </select>
        </div>

        <button
          onClick={onAdd}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          <span>Add New</span>
        </button>
      </div>

      {/* Results Info */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredTips.length} of {petTips.length} tips
        {categoryFilter !== "All" && ` in "${categoryFilter}"`}
        {statusFilter !== "All" && ` with status "${statusFilter}"`}
        {searchQuery && ` matching "${searchQuery}"`}
      </div>

      {/* Loading State */}
      {loading && petTips.length === 0 && (
        <div className="text-center p-8 text-gray-500">
          Loading pet tips...
        </div>
      )}

      {/* Table */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-sm text-gray-600 font-semibold">Title</th>
              <th className="p-3 text-sm text-gray-600 font-semibold">Description</th>
              <th className="p-3 text-sm text-gray-600 font-semibold">Category</th>
              <th className="p-3 text-sm text-gray-600 font-semibold">Status</th>
              <th className="p-3 text-sm text-gray-600 font-semibold">Last Updated</th>
              <th className="p-3 text-sm text-gray-600 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filteredTips.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-6 text-gray-400">
                  {petTips.length === 0 ? "No pet tips found. Click 'Add New' to create one." : "No tips match your search criteria."}
                </td>
              </tr>
            ) : (
              filteredTips.map((tip) => (
                <tr
                  key={tip.id}
                  className="border-t border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="p-3 text-sm">
                    <div className="font-medium text-gray-900">{tip.title}</div>
                  </td>
                  <td className="p-3 text-sm text-gray-600 max-w-xs">
                    <div className="line-clamp-2">{tip.shortDescription}</div>
                  </td>
                  <td className="p-3 text-sm">
                    <span className="inline-block px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {tip.category || "Uncategorized"}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(tip.status)}`}>
                      {tip.status || "Draft"}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-500">
                    {formatDate(tip.updated_at || tip.updatedAt || tip.created_at || tip.createdAt)}
                  </td>
                  <td className="p-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(tip)}
                        disabled={loading}
                        className="text-blue-500 hover:text-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(tip)}
                        disabled={loading}
                        className="text-red-500 hover:text-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        item={tipToDelete}
        loading={loading}
        type="tip"
      />
    </div>
  );
};

export default PetTipsSection;