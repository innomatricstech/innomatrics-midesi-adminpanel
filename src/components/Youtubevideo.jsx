import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
// NOTE: FixedHeader component is assumed to be defined elsewhere
import FixedHeader from "./FixedHeader";
// Import Firebase functions
import {
  db,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "../firebase"; // Adjust the path as necessary

const VideoList = () => {
  const [videos, setVideos] = useState([]); // Stores all videos from Firestore
  const [filteredVideos, setFilteredVideos] = useState([]); // Stores videos after applying search
  const [searchTerm, setSearchTerm] = useState(""); // Stores the search input value
  const [loading, setLoading] = useState(false);

  const [editVideo, setEditVideo] = useState(null);
  const [deleteVideo, setDeleteVideo] = useState(null);
  const [viewVideo, setViewVideo] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newVideo, setNewVideo] = useState({
    title: "",
    videoUrl: "",
  });

  // 1. 🔹 Real-time fetch ALL videos (READ)
  useEffect(() => {
    const videosCollectionRef = collection(db, "youtubeVideos");

    // This listener fetches ALL data once and keeps the 'videos' state synced
    const unsub = onSnapshot(videosCollectionRef, (snapshot) => {
      const data = snapshot.docs.map((document) => ({
        id: document.id, 
        ...document.data(),
      }));
      setVideos(data);
    }, (error) => {
      console.error("Error fetching videos:", error);
    });

    return () => unsub();
  }, []);

  // 2. 🔹 Search/Filter Logic
  useEffect(() => {
    if (!searchTerm.trim()) {
      // If search term is empty, show all videos
      setFilteredVideos(videos);
    } else {
      // Filter based on Title or Document ID
      const filtered = videos.filter(
        (v) =>
          (v.title && 
            v.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (v.id && 
            v.id.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredVideos(filtered);
    }
  }, [searchTerm, videos]); // Re-run filter whenever search term or videos list changes

  // 🔹 Add Video (CREATE)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newVideo.title || !newVideo.videoUrl) {
      alert("Title and URL are required.");
      return;
    }
    try {
      setLoading(true);
      const newDocRef = await addDoc(collection(db, "youtubeVideos"), {
        title: newVideo.title,
        videoUrl: newVideo.videoUrl,
        createdAt: serverTimestamp(),
      });
      await updateDoc(newDocRef, {
        id: newDocRef.id
      });
      setNewVideo({ title: "", videoUrl: "" });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding video:", error);
      alert("Failed to add video. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Edit Video (UPDATE)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editVideo) return;
    try {
      setLoading(true);
      const videoRef = doc(db, "youtubeVideos", editVideo.id);
      await updateDoc(videoRef, {
        title: editVideo.title,
        videoUrl: editVideo.videoUrl,
        updatedAt: serverTimestamp(),
      });
      setEditVideo(null);
    } catch (error) {
      console.error("Error updating video:", error);
      alert("Failed to update video. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete Video (DELETE)
  const handleDelete = async () => {
    if (!deleteVideo) return;
    try {
      setLoading(true);
      await deleteDoc(doc(db, "youtubeVideos", deleteVideo.id));
      setDeleteVideo(null);
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("Failed to delete video.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f3f6" }}>
      {/* Pass the search term handler to FixedHeader */}
      <FixedHeader onSearchChange={setSearchTerm} /> 

      <div className="container-fluid p-4" style={{ paddingTop: "90px" }}>
        <h2 className="mb-4 fw-bold text-primary">YouTube Videos Management</h2>

        {/* Toolbar */}
        <div className="d-flex justify-content-end align-items-center mb-3 flex-wrap gap-2">
          <button
            className="btn btn-gradient-primary shadow-sm rounded-pill px-4"
            onClick={() => setShowAddModal(true)}
            disabled={loading}
          >
            <span className="me-2">+</span> Add New Video
          </button>
          {loading && <div className="text-primary fw-bold">Loading...</div>}
        </div>

        {/* Videos Table: Use filteredVideos here */}
        <div className="card shadow-lg border-0 rounded-4">
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>ID (Firestore Doc ID)</th>
                  <th>URL</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVideos.length > 0 ? (
                  filteredVideos.map((video) => (
                    <tr key={video.id} className="align-middle hover-shadow">
                      <td>{video.title}</td>
                      <td>{video.id ? video.id.substring(0, 8) + '...' : 'N/A'}</td>
                      <td><a href={video.videoUrl} target="_blank" rel="noopener noreferrer">{video.videoUrl}</a></td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-primary me-1 shadow-sm" onClick={() => setViewVideo(video)} disabled={loading}>👁️</button>
                        <button className="btn btn-sm btn-outline-info me-1 shadow-sm" onClick={() => setEditVideo(video)} disabled={loading}>✏️</button>
                        <button className="btn btn-sm btn-outline-danger shadow-sm" onClick={() => setDeleteVideo(video)} disabled={loading}>🗑️</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">
                      {searchTerm ? `No videos found matching "${searchTerm}".` : 'No videos found in Firestore.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- Modals (Add, Edit, View, Delete) remain the same --- */}

        {/* Add Video Modal */}
        {showAddModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <form onSubmit={handleAddSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Add New Video</h5>
                    <button type="button" className="btn-close" onClick={() => setShowAddModal(false)} disabled={loading}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Title</label>
                      <input type="text" className="form-control" value={newVideo.title} onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })} required disabled={loading} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">URL (videoUrl in Firestore)</label>
                      <input type="text" className="form-control" value={newVideo.videoUrl} onChange={(e) => setNewVideo({ ...newVideo, videoUrl: e.target.value })} required disabled={loading} />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)} disabled={loading}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? "Adding..." : "Add Video"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Video Modal */}
        {editVideo && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <form onSubmit={handleEditSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Video</h5>
                    <button type="button" className="btn-close" onClick={() => setEditVideo(null)} disabled={loading}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Title</label>
                      <input type="text" className="form-control" value={editVideo.title} onChange={(e) => setEditVideo({ ...editVideo, title: e.target.value })} required disabled={loading} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">URL (videoUrl in Firestore)</label>
                      <input type="text" className="form-control" value={editVideo.videoUrl} onChange={(e) => setEditVideo({ ...editVideo, videoUrl: e.target.value })} required disabled={loading} />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setEditVideo(null)} disabled={loading}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Video Modal */}
        {viewVideo && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title">Video Details</h5>
                  <button type="button" className="btn-close" onClick={() => setViewVideo(null)}></button>
                </div>
                <div className="modal-body">
                  <p><strong>ID (Doc ID):</strong> {viewVideo.id}</p>
                  <p><strong>Title:</strong> {viewVideo.title}</p>
                  <p><strong>URL:</strong> <a href={viewVideo.videoUrl} target="_blank" rel="noopener noreferrer">{viewVideo.videoUrl}</a></p>
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
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
              <div className="modal-content shadow-lg rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title text-danger">Delete Video</h5>
                  <button type="button" className="btn-close" onClick={() => setDeleteVideo(null)} disabled={loading}></button>
                </div>
                <div className="modal-body">
                  Are you sure you want to delete <strong>{deleteVideo.title}</strong> (ID: {deleteVideo.id.substring(0, 8)}...)?
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setDeleteVideo(null)} disabled={loading}>Cancel</button>
                  <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                    {loading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <style>{`
        /* ... existing styles ... */
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