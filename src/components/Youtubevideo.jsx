import React, { useState } from "react";
import FixedHeader from "./FixedHeader";
import "bootstrap/dist/css/bootstrap.min.css";

const initialVideos = [
  { id: "#VID1001", title: "React Tutorial", url: "https://www.youtube.com/watch?v=dGcsHMXbSOA", description: "Learn React step by step", published: true },
  { id: "#VID1002", title: "JavaScript Basics", url: "https://www.youtube.com/watch?v=W6NZfCO5SIk", description: "JS fundamentals explained", published: true },
  { id: "#VID1003", title: "CSS Flexbox Guide", url: "https://www.youtube.com/watch?v=JJSoEo8JSnc", description: "Master Flexbox layout", published: false },
];

const VideoList = () => {
  const [videos, setVideos] = useState(initialVideos);
  const [editVideo, setEditVideo] = useState(null);
  const [deleteVideo, setDeleteVideo] = useState(null);
  const [viewVideo, setViewVideo] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newVideo, setNewVideo] = useState({
    title: "",
    url: "",
    description: "",
    published: true,
  });

  // Add Video
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const newId = `#VID${1000 + videos.length + 1}`;
    setVideos([...videos, { ...newVideo, id: newId }]);
    setNewVideo({ title: "", url: "", description: "", published: true });
    setShowAddModal(false);
  };

  // Edit Video
  const handleEditSubmit = (e) => {
    e.preventDefault();
    setVideos(videos.map((v) => (v.id === editVideo.id ? editVideo : v)));
    setEditVideo(null);
  };

  // Delete Video
  const handleDelete = () => {
    setVideos(videos.filter((v) => v.id !== deleteVideo.id));
    setDeleteVideo(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f3f6" }}>
      <FixedHeader />

      <div className="container-fluid p-4" style={{ paddingTop: "90px" }}>
        <h2 className="mb-4 fw-bold text-primary">YouTube Videos Management</h2>

        {/* Toolbar */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <button className="btn btn-gradient-primary shadow-sm rounded-pill px-4" onClick={() => setShowAddModal(true)}>
            <span className="me-2">+</span> Add New Video
          </button>
        </div>

        {/* Videos Table */}
        <div className="card shadow-lg border-0 rounded-4">
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>ID</th>
                  <th>URL</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <tr key={video.id} className="align-middle hover-shadow">
                    <td>{video.title}</td>
                    <td>{video.id}</td>
                    <td><a href={video.url} target="_blank" rel="noopener noreferrer">{video.url}</a></td>
                    <td>{video.description}</td>
                    <td>
                      <span className={`badge ${video.published ? "bg-success" : "bg-danger"}`}>{video.published ? "Published" : "Unpublished"}</span>
                    </td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-primary me-1 shadow-sm" onClick={() => setViewVideo(video)}>👁️</button>
                      <button className="btn btn-sm btn-outline-info me-1 shadow-sm" onClick={() => setEditVideo(video)}>✏️</button>
                      <button className="btn btn-sm btn-outline-danger shadow-sm" onClick={() => setDeleteVideo(video)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Video Modal */}
        {showAddModal && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <form onSubmit={handleAddSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Add New Video</h5>
                    <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Title</label>
                      <input type="text" className="form-control" value={newVideo.title} onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">URL</label>
                      <input type="text" className="form-control" value={newVideo.url} onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea className="form-control" value={newVideo.description} onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={newVideo.published} onChange={(e) => setNewVideo({ ...newVideo, published: e.target.value === "true" })}>
                        <option value="true">Published</option>
                        <option value="false">Unpublished</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Add Video</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Video Modal */}
        {editVideo && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <form onSubmit={handleEditSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Video</h5>
                    <button type="button" className="btn-close" onClick={() => setEditVideo(null)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Title</label>
                      <input type="text" className="form-control" value={editVideo.title} onChange={(e) => setEditVideo({ ...editVideo, title: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">URL</label>
                      <input type="text" className="form-control" value={editVideo.url} onChange={(e) => setEditVideo({ ...editVideo, url: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea className="form-control" value={editVideo.description} onChange={(e) => setEditVideo({ ...editVideo, description: e.target.value })} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={editVideo.published} onChange={(e) => setEditVideo({ ...editVideo, published: e.target.value === "true" })}>
                        <option value="true">Published</option>
                        <option value="false">Unpublished</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setEditVideo(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Video Modal */}
        {viewVideo && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title">Video Details</h5>
                  <button type="button" className="btn-close" onClick={() => setViewVideo(null)}></button>
                </div>
                <div className="modal-body">
                  <p><strong>ID:</strong> {viewVideo.id}</p>
                  <p><strong>Title:</strong> {viewVideo.title}</p>
                  <p><strong>URL:</strong> <a href={viewVideo.url} target="_blank" rel="noopener noreferrer">{viewVideo.url}</a></p>
                  <p><strong>Description:</strong> {viewVideo.description}</p>
                  <p><strong>Status:</strong> {viewVideo.published ? "Published" : "Unpublished"}</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setViewVideo(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Video Modal */}
        {deleteVideo && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title text-danger">Delete Video</h5>
                  <button type="button" className="btn-close" onClick={() => setDeleteVideo(null)}></button>
                </div>
                <div className="modal-body">
                  Are you sure you want to delete <strong>{deleteVideo.title}</strong>?
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setDeleteVideo(null)}>Cancel</button>
                  <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <style>{`
        .btn-gradient-primary {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: #fff;
        }
        .btn-gradient-primary:hover {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff;
        }
        .hover-shadow:hover {
          box-shadow: 0 10px 20px rgba(0,0,0,0.12);
          transition: all 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default VideoList;
