import React from 'react';
import styles from './ProfilePostList.module.scss';
import ProfilePost from '../ProfilePost/ProfilePost';

const EmptyState = () => (
    <div className={styles.emptyState}>No posts available.</div>
);

export default function ProfilePostList({posts}) {
    // Check if posts array is empty
    if (posts.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className={styles.postList}>
            {posts.map(postData => (
                <ProfilePost 
                    key={postData._id} 
                    postId={postData._id}
                    user={postData.user}
                    projectTitle={postData.projectTitle} 
                    projectDescription={postData.projectDescription} 
                    githubLink={postData.githubLink} 
                    image={postData.image} 
                />
            ))}
        </div>
    );
}
