import React, { useState, useEffect } from 'react';
import styles from './ProfilePage.module.scss'
import { useParams } from 'react-router-dom';
import ProfileImage from '../../components/ProfileImage/ProfileImage';
import FollowList from '../../components/FollowList/FollowList';
import ProfilePostList from '../../components/ProfilePostList/ProfilePostList';
import { getUser } from '../../utilities/users-service';

const ensureHttps = (url) => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url;
  }
  return url;
};

export default function ProfilePage(fetchPosts) {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch user data using getUser function
                const fetchedUser = await getUser(id);
                setUser(fetchedUser);

                // Fetch all posts
                const fetchedPosts = await getAllPosts();
                setPosts(fetchedPosts);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        fetchData(); // Call fetchData function
    }, [id]); // Add id to dependency array to re-fetch data when id changes

    const getAllPosts = async () => {
        try {
            const response = await fetch('/api/posts')
            const data = await response.json()
            return data
        } catch (error) {
            console.error(error)            
        }
    }

    return (
        <>
            <div className={styles.ProfilePage}>
                <div className={styles.topContainer}>
                    <div className={styles.userContainer}>
                        <div className={styles.userHeading}>
                            <h2 className={styles.userName}>{user && user.name}</h2>
                            <div className={styles.imgAndEditContainer}>
                                <ProfileImage 
                                    className={styles.ProfileImage}
                                    user={user}
                                />
                                {
                                    user ? <button className={styles.editBtn}>Edit User Information</button> : ''
                                }
                            </div>
                            <div className={styles.userLinks}>
                                {user && (
                                    <a className={styles.ghLink} href={user.gitHubLink ? ensureHttps(user.gitHubLink) : '#'}>
                                        <img className={styles.ghLogo} src='https://i.imgur.com/F796Bnt.png' />
                                    </a>
                                )}
                                {user && (
                                    <a className={styles.portfolioLink} href={user.portfolioLink ? ensureHttps(user.portfolioLink) : '#'}>
                                        <img className={styles.portfolioLogo} src='https://i.imgur.com/FZvlk3y.png' />
                                    </a>
                                )}
                            </div>
                        </div>
                        {user && user.bio && (
                            <p className={styles.userBio}>{user.bio}</p>
                        )}
                        {!user || !user.bio && (
                            <p className={styles.userBio}>No Bio at this time.</p>
                        )}
                    </div>
                    <FollowList 
                        posts={posts}
                    />
                </div>
                <ProfilePostList 
                    posts={posts}
                    fetchPosts={fetchPosts}
                />
            </div>
        </>
    );
}
