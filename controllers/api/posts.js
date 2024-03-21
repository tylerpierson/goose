const Post = require('../../models/Post')
const User = require('../../models/User')
const { fetchReadmeContent } = require('../../services/githubAPI')

module.exports = {
    create,
    index,
    show,
    update,
    destroy,
    jsonPost,
    jsonPosts,
    likePost,
    unlikePost
}

function jsonPost(_, res) {
    res.json(res.locals.data.post);
}

function jsonPosts(_, res) {
    res.json(res.locals.data.posts);
}


// Create
async function create(req, res, next) {
    try {
        const userId = req.user._id;
        const { githubLink, useReadmeAsDescription, projectDescription } = req.body;

        let description = projectDescription; // Initialize with provided projectDescription
        // If GitHub link is provided and user wants to use README content as description
        if (githubLink && useReadmeAsDescription) {
            // Extract owner and repo name from the GitHub link
            const [_, owner, repo] = githubLink.split('/');
             // Fetch README content from GitHub repository
            const readmeContent = await fetchReadmeContent(owner, repo);
            req.body.projectDescription = readmeContent; // Update projectDescription with README content
}


        const post = await Post.create({ user: userId, ...req.body, description });
        const foundUser = await User.findByIdAndUpdate(userId, { $push: { posts: post._id } });
        res.locals.data.post = post;           
        next()
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(400).json({ msg: error.message });
    }
}

// Read
async function index(_, res) {
    try {
        const posts = await Post.find({}).populate('likes', 'user');
        res.locals.data.posts = posts;
        console.log("Retrieved posts:", posts);
        res.json(posts);
    } catch (error) {
        console.error("Error retrieving posts:", error);
        res.status(400).json({ msg: error.message });
    }
}

async function show(req, res) {
    try {
        const post = await Post.findById(req.params.id);
        res.locals.data.post = post;
        console.log("Retrieved post:", post);
        res.json(post);
    } catch (error) {
        console.error("Error retrieving post:", error);
        res.status(400).json({ msg: error.message });
    }
}

// Update
async function update(req, res) {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.locals.data.post = post;
        console.log("Updated post:", post);
        res.json(post);
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(400).json({ msg: error.message });
    }
}

// Delete
async function destroy(req, res) {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);

        // Remove post from user's posts array
        await User.updateOne({ posts: req.params.id }, { $pull: { posts: req.params.id } });
        res.locals.data.post = post;
        console.log("Deleted post:", post);
        res.json(post);
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(400).json({ msg: error.message });
    }
}

// Like Post
async function likePost(req, res, next) {
    try {
        const userId = req.user._id
        const foundUser = await User.findOne({ _id: userId })
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(404).json({ message: 'Post not found' })
        }
        // Add post to likedPosts array of the user if not already present
        if (!foundUser.likedPosts.includes(post._id)) {
            // req.user.likedPosts.push(post._id)
            // await User.findByIdAndUpdate(userId, { $push: { likedPosts: post._id } })
            foundUser.likedPosts.push(post._id)
            await foundUser.save()
        } else {
            throw new Error('Post already liked by the user')
        }
        // Add user to likes array of the post if not already present
        if (!post.likes.includes(userId)) {
            post.likes.push(userId)
            await post.save()
        }
        res.locals.data.post = post        
        res.locals.data.notification = {
            type: 'like',
            fromUser: userId,
            toUser: post.user,
            post: post._id
        }
        next()
    } catch (error) {
        console.error("Error liking post:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

// Unlike Post
async function unlikePost(req, res) {
    try {        
        // save user
        const user = await User.findOne({ _id: req.user._id })
        console.log(user)
        // save post
        const post = await Post.findOne({ _id: req.params.id })

        // remove post from user.likedPosts arr
        // save liked post index
        console.log(user.likedPosts)
        const likedPostIdx = user.likedPosts.indexOf(post._id)
        console.log(`liked post index: ${likedPostIdx}`)
        console.log(`user likedPosts: ${user.likedPosts}`)

        // splice
        user.likedPosts.splice(likedPostIdx,1)
        // console.log(user)    

        // save
        await user.save()

        // remove user from post.likes arr
        const postLikesIdx = post.likes.indexOf(user._id)

        // splice
        post.likes.splice(postLikesIdx, 1)

        // save
        await post.save()

        res.json({post, user})


        // remove user from post.likes arr
        // save both
        // send json



        
        // const post = await Post.findById(req.params.id)
        // const foundUser = await User.findOne({ _id: req.user._id })
        
        // if (!post) {
        //     return res.status(404).json({ message: 'Post not found' })
        // }        
        
        // if (!foundUser.likedPosts.includes(post._id)) {
        //     throw new Error('Post is not liked by the user')
        // }
        
        // if (!post.likes.includes(req.user._id)) {
        //     throw new Error('User has not liked the post')
        // }        

        // foundUser.likedPosts = foundUser.likedPosts.filter(likedPostId => likedPostId.toString() !== post._id.toString())
        // await foundUser.save()
        // console.log(`Updated user likedPost arr: ${foundUser.likedPosts}`)
        
        // post.likes = post.likes.filter(like => like.toString() !== req.user._id.toString())
        // await post.save()

        // res.locals.data.post = post

        // res.json({post, foundUser});
    } catch (error) {
        console.error("Error unliking post:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}
