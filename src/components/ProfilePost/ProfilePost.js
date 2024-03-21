import React from 'react';
import { useParams } from 'react-router-dom';
import styles from './ProfilePost.module.scss'
import LikeBtn from '../../components/LikeBtn/LikeBtn'

export default function ProfilePost({props, fetchPosts}) {
    const { userId } = useParams();

        // DeletePost
        const deletePost = async (token) => {
            // https://i.imgur.com/3quZxs4.png
            // Step 4
            if(!token){
                return
            }
            try {
                const response = await fetch(`/api/posts/${props.postId}`, {
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

        const handleDelete = async () => {
            try {
                // Call the deletePost function with the post id and token as arguments
                const deletedPost = await deletePost(props.postId, props.token);
                console.log(`${props.postId} has been deleted`);
                // If the post is successfully deleted, you might want to update the UI to reflect the change
                // You can do this by fetching the updated list of posts or updating the existing list of posts
                fetchPosts()
            } catch (error) {
                console.error('Error deleting post:', error);
                // Handle any errors that occur during the deletion process
            }
        };

    return (
        props.user === userId ?
        <>
        <div className={styles.ProfilePost}>
            <div className={styles.TitleImgContainer}>
                <h4 className={styles.ProjectTitle}>{props.projectTitle}</h4> 
                {props.image === '' || props.image ? <img className={styles.ProjectImage} src={props.image} /> : ''}
            </div>
            <p className={styles.ProjectDescription}>{props.projectDescription}</p>
            <a href={props.githubLink ? props.githubLink : '#'} target={props.githubLink ? "_blank" : null}><img className={styles.ProjectLogo} src="https://i.imgur.com/F796Bnt.png"/></a>
            <LikeBtn />
            <button className={styles.deleteBtn} onClick={handleDelete}>Delete Post</button>
        </div>
        </>
        : null
    );
}