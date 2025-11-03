import React, { useState } from "react";

export default function ContentManager() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "Proper Pet Vaccination Schedule",
      image: "https://placekitten.com/300/200",
      date: "Oct 25 2025",
    },
  ]);

  const handleUpload = (e) => setImage(URL.createObjectURL(e.target.files[0]));
  const publish = () => {
    if (!title || !content) return alert("Fill in title & content");
    setPosts([
      { id: Date.now(), title, image, date: new Date().toDateString() },
      ...posts,
    ]);
    setTitle("");
    setContent("");
    setImage(null);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-[#2FA394]">Content Manager</h2>

      {/* Composer */}
      <div className="bg-white rounded-2xl shadow p-5 mb-6 border border-gray-100">
        <input
          type="text"
          placeholder="Post title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:ring-2 focus:ring-[#5EE6FE]"
        />
        <textarea
          rows="4"
          placeholder="Write your pet-care tip..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:ring-2 focus:ring-[#5EE6FE]"
        />
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-3">
          <input type="file" accept="image/*" onChange={handleUpload} className="text-sm" />
          {image && (
            <img src={image} alt="preview" className="w-24 h-16 object-cover rounded-lg border" />
          )}
        </div>
        <button
          onClick={publish}
          className="bg-[#2FA394] text-white py-2 px-5 rounded-lg hover:bg-[#278e82] transition"
        >
          Publish
        </button>
      </div>

      {/* Posts */}
      <h3 className="font-semibold mb-3 text-[#2FA394]">Recent Posts</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl shadow p-4 border border-gray-100 hover:shadow-md transition"
          >
            {p.image && (
              <img src={p.image} alt={p.title} className="w-full h-32 object-cover rounded-lg mb-2" />
            )}
            <h4 className="font-medium">{p.title}</h4>
            <p className="text-xs text-gray-500">{p.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
