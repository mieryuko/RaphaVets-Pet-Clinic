import { useState } from "react";
import { Edit, Trash2, MessageSquare } from "lucide-react";

const ForumPostsSection = ({ posts, onDelete }) => {
  const [filter, setFilter] = useState("all");

  const filteredPosts = posts.filter(post => 
    filter === "all" || post.type === filter
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Forum Posts</h2>
          <p className="text-gray-600 text-sm">Manage missing and found pet reports</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Posts</option>
            <option value="missing">Missing Pets</option>
            <option value="found">Found Pets</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    post.type === 'missing' 
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {post.type === 'missing' ? 'Missing' : 'Found'}
                  </span>
                  <span className="text-sm text-gray-500">by {post.user}</span>
                  <span className="text-sm text-gray-500">{post.date}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    post.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {post.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{post.petName}</h3>
                    <p className="text-sm text-gray-600">{post.breed} • {post.petType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <strong>Location:</strong> {post.location}
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-700 text-sm">{post.description}</p>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200">
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(post.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No forum posts</h3>
            <p className="text-gray-500">No forum posts match your current filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumPostsSection;