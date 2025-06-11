class RedditFeed {
    constructor() {
        this.postsContainer = document.querySelector('.posts-container');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.currentSubreddit = 'all';
        this.subreddits = {
            'cscareerquestions': 'CS Career Questions',
            'webdev': 'Web Development',
            'learnprogramming': 'Learn Programming',
            'experienceddevs': 'Experienced Devs',
            'resumeexperts': 'Resume Help'
        };
        
        this.initializeEventListeners();
        this.loadPosts();
    }

    initializeEventListeners() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.currentSubreddit = button.dataset.subreddit;
                this.loadPosts();
            });
        });
    }

    async loadPosts() {
        this.postsContainer.innerHTML = '<div class="loading">Loading posts...</div>';
        
        try {
            let posts = [];
            if (this.currentSubreddit === 'all') {
                // Fetch posts from all subreddits
                for (const subreddit of Object.keys(this.subreddits)) {
                    const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=5`);
                    const data = await response.json();
                    posts = [...posts, ...data.data.children];
                }
            } else {
                // Fetch posts from specific subreddit
                const response = await fetch(`https://www.reddit.com/r/${this.currentSubreddit}/hot.json?limit=10`);
                const data = await response.json();
                posts = data.data.children;
            }

            this.displayPosts(posts);
        } catch (error) {
            this.postsContainer.innerHTML = '<div class="error">Error loading posts. Please try again later.</div>';
            console.error('Error fetching posts:', error);
        }
    }

    displayPosts(posts) {
        if (!posts.length) {
            this.postsContainer.innerHTML = '<div class="no-posts">No posts found.</div>';
            return;
        }

        this.postsContainer.innerHTML = posts
            .filter(post => !post.data.stickied) // Filter out stickied posts
            .map(post => this.createPostCard(post.data))
            .join('');
    }

    createPostCard(post) {
        const subredditDisplay = this.subreddits[post.subreddit] || post.subreddit;
        
        return `
            <article class="post-card">
                <div class="post-header">
                    <span class="post-subreddit">r/${subredditDisplay}</span>
                    <span class="post-meta">Posted by u/${post.author}</span>
                </div>
                <h2 class="post-title">
                    <a href="https://reddit.com${post.permalink}" target="_blank">
                        ${this.escapeHtml(post.title)}
                    </a>
                </h2>
                ${post.selftext ? `<div class="post-content">${this.truncateText(this.escapeHtml(post.selftext), 300)}</div>` : ''}
                <div class="post-footer">
                    <span>↑ ${post.score}</span>
                    <span>💬 ${post.num_comments} comments</span>
                </div>
            </article>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RedditFeed();
});