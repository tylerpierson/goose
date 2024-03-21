import React from 'react';
import styles from './FollowList.module.scss';
import Follow from '../Follow/Follow';

const EmptyState = () => (
    <div className={styles.emptyState}>No posts available.</div>
);

export default function FollowList({ posts }) {
    // Check if posts array is empty
    if (posts.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className={styles.postList}>
            {posts.map(postData => (
                <Follow 
                    key={postData._id} 
                    user={postData.user}
                    likes={postData.likes}
                />
            ))}
        </div>
    );
}