import axios from "axios";
import { useEffect, useState } from "react";

function Posts() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Fetch posts
  const fetchPosts = () => {
    axios.get("http://127.0.0.1:8000/api/posts")
      .then(res => {
        setPosts(res.data);
      })
      .catch(err => {
        console.error(err);
      });
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Submit new post
  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post("http://127.0.0.1:8000/api/posts", {
      title: title,
      description: description
    })
    .then(res => {
      alert("Post created successfully!");

      // clear form
      setTitle("");
      setDescription("");

      // refresh list
      fetchPosts();
    })
    .catch(err => {
      console.error(err);
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Posts Page</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ display: "block", marginBottom: "10px", padding: "8px", width: "300px" }}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={{ display: "block", marginBottom: "10px", padding: "8px", width: "300px" }}
        />

        <button type="submit">Add Post</button>
      </form>

      {/* LIST */}
      {posts.length === 0 ? (
        <p>No posts found</p>
      ) : (
        posts.map(post => (
          <div key={post.id} style={{
            border: "1px solid #ccc",
            marginBottom: "10px",
            padding: "10px",
            borderRadius: "5px"
          }}>
            <h3>{post.title}</h3>
            <p>{post.description}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Posts;