import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/HomePage.css'; // Import CSS file for styling

const HomePage = () => {
    const [videoLink, setVideoLink] = useState('');
    const [comments, setComments] = useState([]);
    const [totalComments, setTotalComments] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // State for filter selection
    const [showFilter, setShowFilter] = useState(false); // State to control filter visibility

    const extractVideoId = (link) => {
        const videoIdMatch = link.match(/[?&]v=([^&]+)/);
        if (videoIdMatch && videoIdMatch[1]) {
            return videoIdMatch[1];
        }

        const shortLinkMatch = link.match(/youtu\.be\/([^?]+)/);
        if (shortLinkMatch && shortLinkMatch[1]) {
            return shortLinkMatch[1];
        }

        return '';
    };

    const classifyComment = async (comment) => {
        try {
            const response = await axios.post('http://127.0.0.1:5000/predict', { comment });
            const prediction = response.data.prediction;
            return prediction === 'spam' ? 'red' : 'green';
        } catch (error) {
            console.error('Error classifying comment:', error);
            return 'black';
        }
    };

    const fetchAuthorDetails = async (authorChannelId) => {
        try {
            const response = await axios.get(`https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${authorChannelId}&key=${process.env.REACT_APP_API_KEY}`);
            const author = response.data.items[0].snippet;
            return {
                authorDisplayName: author.title,
                authorProfileImageUrl: author.thumbnails.default.url
            };
        } catch (error) {
            console.error('Error fetching author details:', error);
            return {
                authorDisplayName: 'Unknown',
                authorProfileImageUrl: ''
            };
        }
    };

    const handleVideoLinkChange = (event) => {
        setVideoLink(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const videoId = extractVideoId(videoLink);
        if (!videoId) {
            setError('Invalid YouTube video link!');
            return;
        }
    
        setLoading(true);
        setError(null);
        setShowFilter(true); // Show filter after clicking "Fetch Comments" button
    
        const API_KEY = process.env.REACT_APP_API_KEY; // Replace with your YouTube API key
        const maxResults = 100;
        const apiUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=${maxResults}&key=${API_KEY}`;
    
        let totalCommentsFetched = 0;
    
        try {
            let nextPageToken = '';
            do {
                const response = await axios.get(`${apiUrl}&pageToken=${nextPageToken}`);
                const items = response.data.items;
    
                // Process and render comments asynchronously
                for (const item of items) {
                    const commentText = item.snippet.topLevelComment.snippet.textDisplay;
                    const authorChannelId = item.snippet.topLevelComment.snippet.authorChannelId.value;
                    const textColor = await classifyComment(commentText);
                    const authorDetails = await fetchAuthorDetails(authorChannelId);
                    setComments(prevComments => [
                        ...prevComments,
                        {
                            text: commentText,
                            textColor,
                            authorDisplayName: authorDetails.authorDisplayName,
                            authorProfileImageUrl: authorDetails.authorProfileImageUrl
                        }
                    ]);
                    // Increment total comments count for each comment fetched
                    totalCommentsFetched++;
                    setTotalComments(totalCommentsFetched);
                }
    
                nextPageToken = response.data.nextPageToken;
            } while (nextPageToken);
            
            // Display toast message when classification is done
            toast.success('Classification done successfully!');
        } catch (error) {
            console.error('Error fetching comments:', error);
            setError('Error fetching comments. Please try again later.');
        } finally {
            setLoading(false);
        }
    };    

    // Function to decode HTML entities
    const decodeEntities = (html) => {
        var txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    };

    // Filter comments based on user selection
    const filteredComments = comments.filter(comment => {
        if (filter === 'all') {
            return true;
        } else if (filter === 'ham') {
            return comment.textColor === 'green';
        } else if (filter === 'spam') {
            return comment.textColor === 'red';
        }
    });

    return (
        <div className="homepage-container">
            <ToastContainer /> {/* ToastContainer component for displaying toast messages */}
            <nav className="navbar navbar-expand-lg navbar navbar-dark bg-primary">
                <Link className="navbar-brand" to="/HomePage">Home</Link>
                <div className="collapse navbar-collapse justify-content-end" id="navbarTogglerDemo03">
                    <Link className="btn btn-outline-light my-2 my-sm-0" to="/">Logout</Link>
                </div>
            </nav>
            <div className="container mt-4">
                <form onSubmit={handleSubmit} className="form">
                    <label className="label">
                        Enter YouTube video link:
                        <input type="text" value={videoLink} onChange={handleVideoLinkChange} className="form-control" required />
                    </label>
                    <button type="submit" className="btn btn-primary mt-2" disabled={loading}>
                        {loading ? 'Loading...' : 'Fetch Comments'}
                    </button>
                </form>
                {error && <p className="error">{error}</p>}
                <h2 className="total-comments">
                    Total comments fetched: {totalComments}
                    {comments.length > 0 &&
                        <span>
                            {' ('}
                            <span style={{ color: 'red' }}>
                                Spam: {comments.filter(comment => comment.textColor === 'red').length}
                            </span>
                            <span>, </span>
                            <span style={{ color: 'green' }}>
                                Ham: {comments.filter(comment => comment.textColor === 'green').length}
                            </span>
                            {')'}
                        </span>
                    }
                </h2>
                <div className="youtube-video" style={{ textAlign: "center" }}>
                    {videoLink && (
                        <iframe
                            width="560"
                            height="315"
                            src={`https://www.youtube.com/embed/${extractVideoId(videoLink)}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ display: "inline-block" }}
                        ></iframe>
                    )}
                </div>
                {/* Render filter dropdown only if comments are fetched */}
                {showFilter && (
                    <div className="filter-container">
                        <label htmlFor="filter">Filter:</label>
                        <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value)} className="form-control custom-select">
                            <option value="all">All</option>
                            <option value="ham">Ham</option>
                            <option value="spam">Spam</option>
                        </select>
                    </div>
                )}
                <ul className="comment-list">
                    {/* Render filtered comments */}
                    {filteredComments.map((comment, index) => (
                        <li key={index} className="comment" style={{ color: comment.textColor }}>
                            {/* Rendering comment using dangerouslySetInnerHTML after decoding HTML entities */}
                            <div className="author-info">
                                <img src={comment.authorProfileImageUrl} alt="Profile" className="profile-image-circle" />
                                <span className="author-name">@{comment.authorDisplayName}</span>
                            </div>
                            <div className="comment-text" dangerouslySetInnerHTML={{ __html: decodeEntities(comment.text) }} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default HomePage;
