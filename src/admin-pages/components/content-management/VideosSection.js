import { Plus, Edit, Trash2, Video } from "lucide-react";

const VideosSection = ({ videos, onAdd, onEdit, onDelete }) => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Educational Videos</h2>
          <p className="text-gray-600 text-sm">YouTube videos for pet education</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          <Plus size={18} />
          <span>Add Video</span>
        </button>
      </div>

      <div className="grid gap-4">
        {videos.map((video) => (
          <div key={video.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-12 bg-red-100 rounded flex items-center justify-center">
                  <Video size={24} className="text-red-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      {video.category}
                    </span>
                    <h3 className="font-semibold text-gray-900">{video.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{video.shortDescription}</p>
                  <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm hover:underline">
                    Watch video →
                  </a>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(video)}
                  className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(video.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {videos.length === 0 && (
          <div className="text-center py-12">
            <Video size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No videos yet</h3>
            <p className="text-gray-500 mb-4">Add educational videos for pet owners</p>
            <button
              onClick={onAdd}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Add Video
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideosSection;