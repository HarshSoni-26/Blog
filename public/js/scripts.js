document.addEventListener('DOMContentLoaded', () => {
    const blogListElement = document.getElementById('blogList');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const addPostForm = document.getElementById('addPostForm');
    const logoutButton = document.getElementById('logoutButton');

    if (logoutButton) {
        logoutButton.addEventListener('click', logoutUser);
    }

    if (blogListElement) {
        fetchBlogs();
    }

    if (loginForm) {
        loginForm.addEventListener('submit', loginUser);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', signupUser);
    }

    if (addPostForm) {
        addPostForm.addEventListener('submit', addPost);
    }

    async function fetchBlogs() {
        const response = await fetch('http://localhost:3000/blogs');
        const blogs = await response.json();
        displayBlogs(blogs);
    }

    function displayBlogs(blogs) {
        blogListElement.innerHTML = '';
        blogs.forEach(blog => {
            const blogItem = document.createElement('div');
            blogItem.classList.add('blog-item');
            blogItem.innerHTML = `
                <h3>${blog.title}</h3>
                <p>by ${blog.author}</p>
                <button onclick="viewBlog('${blog._id}')">Read More</button>
            `;
            blogListElement.appendChild(blogItem);
        });
    }

    function viewBlog(blogId) {
        window.location.href = `blogPage.html?blogId=${blogId}`;
    }

    async function loginUser(event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();
        if (result.success) {
            localStorage.setItem('token', result.token);
            window.location.href = 'blogList.html';
        } else {
            alert(result.message);
        }
    }

    async function signupUser(event) {
        event.preventDefault();
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const response = await fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, password })
        });

        const result = await response.json();
        if (result.success) {
            window.location.href = 'login.html';
        } else {
            alert(result.message);
        }
    }

    async function addPost(event) {
        event.preventDefault();
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const content = document.getElementById('content').value;
        const image = document.getElementById('image').files[0];
        const user = parseJwt(localStorage.getItem('token'));
        const email = user.email;

        const formData = new FormData();
        formData.append('title', title);
        formData.append('author', author);
        formData.append('content', content);
        formData.append('image', image);
        formData.append('email', email)

        const response = await fetch('http://localhost:3000/blogs', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const result = await response.json();
        if (result.success) {
            window.location.href = 'blogList.html';
        } else {
            alert(result.message);
        }
    }

    async function loadBlog() {
        const urlParams = new URLSearchParams(window.location.search);
        const blogId = urlParams.get('blogId');
        const response = await fetch(`http://localhost:3000/blogs/${blogId}`);
        const blog = await response.json();
        document.getElementById('blogTitle').innerText = blog.title;
        document.getElementById('blogAuthor').innerText = `By ${blog.author}`;
        document.getElementById('blogContent').innerText = blog.content;
        if (blog.image) {
            document.getElementById('blogImage').src = `http://localhost:3000/${blog.image}`;
            document.getElementById('blogImage').style.display = 'block';
        }
        const user = parseJwt(localStorage.getItem('token'));
        if (user && user.email === blog.email) {
            document.getElementById('deleteButton').style.display = 'block';
            document.getElementById('deleteButton').addEventListener('click', async () => {
                const response = await fetch(`http://localhost:3000/blogs/${blogId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const result = await response.json();
                if (result.success) {
                    window.location.href = 'blogList.html';
                } else {
                    alert(result.message);
                }
            });
        }
    }

    function parseJwt(token) {
        if (!token) return null;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    if (window.location.pathname.endsWith('blogPage.html')) {
        loadBlog();
    }
});

function viewBlog(blogId) {
    window.location.href = `blogPage.html?blogId=${blogId}`;
}

function logoutUser() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}
