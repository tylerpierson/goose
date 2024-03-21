import { useState, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom'; // Import useLocation
import NavBar from './components/NavBar/NavBar';
import AuthPage from './pages/AuthPage/AuthPage';
import HomePage from './pages/HomePage/HomePage';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './components/ResetPassword/ResetPassword'
import ProfilePage from './pages/ProfilePage/ProfilePage'
// import ForgotPasswordPage from './components/ForgotPasswordForm/ForgotPasswordForm';

import styles from './App.module.scss';
import * as userService from './utilities/users-service';

export default function App() {
    const [user, setUser] = useState(null);
    const [post, setPost] = useState(null);
    const [token, setToken] = useState('');
//added global functionality to not display nav bar on whichever page youd like
    const location = useLocation();
    const shouldNotDisplayNavBar = !['/auth', '/auth/forgot-password'].includes(location.pathname);

    // Create a signUp fn that connects to the backend
    const signUp = async(credentials) => {
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                // Headers that will be set in PostMan
                headers: {
                    'Content-Type': 'application/json'
                },
                // Turn the body into a readable JavaScript object 
                body: JSON.stringify(credentials)
            })
            const data = await response.json()
            setUser(data.user)
            setToken(data.token)
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
        } catch (error) {
            console.error(error)
        }
    }

    // This function will need to be a prop passed to the LoginForm via AuthPage
    const login = async (credentials) => {
        try {
            // https://i.imgur.com/3quZxs4.png
            // Step 1 is complete here once someone fills out the loginForm
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            })
            const data = await response.json()
            // Step 3
            const tokenData = data.token
            localStorage.setItem('token', tokenData)
            // The below code is additional to the core features of authentication
            // You need to decide what additional things you would like to accomplish when you
            // set up your stuff
            const userData = data.user
            localStorage.setItem('user', JSON.stringify(userData))
            setUser(userData)
        } catch (error) {
            console.error(error)
        }
    }

    // CreatePost
    // We need token authentication in order to verify that someone can make a post
    // Now that we have the token from the signup/login above, we will pass it into the following functions for authentication
    const createPost = async (postData, token) => {
        // https://i.imgur.com/3quZxs4.png
        // Step 4
        if(!token){
            return
        }
        try {
            // Ensure required fields are present
            if (!postData.content || !postData.projectTitle) {
                throw new Error('Content and project title are required'); // Throw error if required fields are missing
            }
    
            // If githubLink is provided, ensure required fields for GitHub integration are present
            if (postData.githubLink) {
                if (typeof postData.useReadmeAsDescription !== 'boolean') {
                    throw new Error('Invalid useReadmeAsDescription value'); // Throw error if useReadmeAsDescription is missing or invalid
                }
                // If useReadmeAsDescription is true, projectDescription will be automatically set to the Readme
                if (postData.useReadmeAsDescription && postData.projectDescription) {
                    throw new Error('Project description should not be provided when using README'); // Throw error if projectDescription is provided when using README
                }
            }
    
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(postData)
            });
    
            const data = await response.json();
            localStorage.setItem('post', JSON.stringify(postData));
            // Assuming setPost is a function to update the UI with the new post data
            setPost(postData);
            return data;
        } catch (error) {
            console.error(error);
            // Handle error as needed
        }
    }

    // ReadPost - we don't need authentication
    const getAllPosts = async () => {
        try {
            const response = await fetch('/api/posts')
            const data = await response.json()
            return data
        } catch (error) {
            console.error(error)            
        }
    }

    // Show and individual post - no need for authentication
    const getIndividualPost = async (id) => {
        try {
            const response = await fetch(`/api/posts/${id}`)
            const data = await response.json()
            return data
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchPosts()
      }, [])
      
      const fetchPosts = async () => {
        try {
          const response = await fetch('/api/posts', {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json()
          setPost(data.posts)
        } catch (error) {
          console.error('There was an error!', error)
        }
      };

    // UpdatePost
    const updatePost = async (newPostData, id, token) => {
        // https://i.imgur.com/3quZxs4.png
        // Step 4
        if(!token){
            return
        }
        try {
            const response = await fetch(`/api/posts/${id}`, {
                method: 'PUT',
                headers: {
                    // This part is only necessary when sending data, not when retrieving it, i.e. GET requests
                    // Tell it that we're sending JSON data
                    'Content-Type': 'application/json',
                    // Tell it that we have a user token
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newPostData)
            })
            const data = await response.json()
            return data
        } catch (error) {
            console.error(error)
        }
    }

    // DeletePost
    const deletePost = async (id, token) => {
        // https://i.imgur.com/3quZxs4.png
        // Step 4
        if(!token){
            return
        }
        try {
            const response = await fetch(`/api/posts/${id}`, {
                method: 'DELETE',
                headers: {
                    // Don't need content-type because we are not sending any data
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            return data
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (token) {                    
            const fetchUserData = async () => {
                console.log('fetching user data')
                try {
                    // Fetch user data from your backend
                    const response = await fetch('/api/user-data', {
                        headers: {
                            Authorization: `Bearer ${token}` // Assuming you're passing token as a prop
                        }
                    });
        
                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData); // Update the user state with the fetched data
                    } else {
                        // Handle error
                        throw new Error('response failed')
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };    
            // Call the fetchUserData function when the component mounts
            fetchUserData();
        }
    }, [token])

//added global functionality to not display nav bar on whichever page youd like

    // Like a post
const likePost = async (postId, token) => {
    try {
        if (!token) {
            return;
        }

        const response = await fetch(`/api/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
};

// Unlike a post
const unlikePost = async (postId, token) => {
    try {
        if (!token) {
            return;
        }

        const response = await fetch(`/api/posts/${postId}/unlike`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
};

   // Follow a developer
const followDeveloper = async (userId, developerId, token) => {
    try {
        if (!token) {
            return;
        }

        const response = await fetch('/api/follow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId, developerId })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
};

// Unfollow a developer
const unfollowDeveloper = async (userId, developerId, token) => {
    try {
        if (!token) {
            return;
        }

        const response = await fetch('/api/unfollow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId, developerId })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
};

    return (
        <>
            <div className={styles.App}>
                {shouldNotDisplayNavBar && (
                    <NavBar
                        token={token}
                        setUser={setUser}
                        user={user} // Pass the user prop to NavBar
                        setToken={setToken}                        
                        getIndividualPost={getIndividualPost}
                        deletePost={deletePost}
                        updatePost={updatePost}
                        post={post}
                    />)}                
                <Routes>
                    <Route path='/' element={
                        <HomePage
                            user={user} 
                            token={token}
                            setToken={setToken}
                            setUser={setUser}
                            createPost={createPost}
                            setPost={setPost}
                            post={post}
                            getAllPosts={getAllPosts}
                        />
                    } />

                    <Route path='/auth' element={
                        <AuthPage
                            setUser={setUser}
                            setToken={setToken}
                            signUp={signUp}
                            login={login}
                        />
                    }/>
                    <Route path="/auth/forgot-password" element={<ForgotPassword 
                     setUser={setUser}
                     setToken={setToken}
                     signUp={signUp}
                     login={login} />} />
                   <Route
                        path="/reset-password/:token"
                        element={  // Pass user, token, and setUser props down to ResetPassword
                            <ResetPassword 
                            user={user} 
                            token={token} 
                            setUser={setUser} 
                        />
                        }
                     />
                    <Route path='/profile/:userId' 
                    element={<ProfilePage 
                        user={user} 
                        token={token} 
                        setToken={setToken}
                        setUser={setUser}
                        getIndividualPost={getIndividualPost}
                        updatePost={updatePost}
                        fetchPosts={fetchPosts}
                        post={post}
                    />} />
                </Routes>
            </div>
        </>
    );
}