import db from "../config/db.js";


export const createPost = async (req, res) => {
    const {postType, description, contact, email, isAnonymous} = req.body;
    const accID = req.user.id;

    {/* Validate required fields */}
    if(!postType || !['Lost', 'Found'].includes(postType)){
        return res.status(400).json({ message: "❌ Invalid post type." });
    }
    if(!description?.trim()){
        return res.status(400).json({ message: "❌ Description is required." });
    }
    if(!contact?.trim() && !email?.trim()){
        return res.status(400).json({ message: "❌ Either contact or email is required." });
    }
    if(contact?.trim() && !/^(09\d{9}|\+63\d{10})$/.test(contact)){
        return res.status(400).json({ message: "❌ Invalid contact number format." });
    }
    if(email?.trim() && !/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email)){
        return res.status(400).json({ message: "❌ Invalid email format." });
    }

    {/* Validate images */}
    if(req.files?.length < 1){
        return res.status(400).json({ message: "❌ At least one image is required." });
    }
    if(req.files.length > 5){
        return res.status(400).json({ message: "❌ Maximum of 5 images allowed." });
    }

    const dbConn = await db.getConnection();
    try {
    await dbConn.beginTransaction();
    const [result] = await dbConn.query(
        "INSERT INTO forum_posts_tbl (accID, postType, description, contact, email, isAnonymous) VALUES (?, ?, ?, ?, ?, ?)",
        [accID, postType, description, contact, email, isAnonymous]
    );

    const forumID = result.insertId

    if (req.files?.length > 0) {
        const imageData = req.files.map(file => [forumID, file.filename]);
        await dbConn.query(
            "INSERT INTO forum_images_tbl (forumID, imageName) VALUES ?",
            [imageData]
        );
    }

    await dbConn.commit();
    res.status(201).json({ id: result.insertId, accID, postType, description, contact, email, isAnonymous });
  } catch (error) {
    await dbConn.rollback();
    console.error("❌ Error creating post:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    dbConn.release();
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const [posts] = await db.query(
      "SELECT " +
        "p.forumID, " +
        "p.postType, " +
        "p.description, " +
        "p.contact, " +
        "p.email, " +
        "if(p.isAnonymous, 'Anonymous', CONCAT(a.firstName, ' ', a.lastName)) AS userName, " +
        "p.createdAt  " +
      "FROM forum_posts_tbl p " +
      "JOIN account_tbl a ON p.accID = a.accID " +
      "WHERE p.isDeleted = FALSE AND a.isDeleted = FALSE " +
      "ORDER BY p.createdAt DESC " +
      "LIMIT 20"
    );
    const postIds = posts.map(post => post.forumID);

    const [images] = await db.query(
      `SELECT * FROM forum_images_tbl WHERE forumID IN (?)`,
      [postIds]
    );

    const cleanedPosts = posts.map(post => ({
      id: post.forumID,
      type: post.postType,
      user: post.userName,
      petName: post.petName || "Unknown",
      images: images
        .filter(img => img.forumID === post.forumID)
        .map(img => ({
          id: img.id,
          url: `${req.protocol}://${req.get('host')}/api/forum/images/${img.imageName}`,
          imageName: img.imageName,
        })),
      desc: post.description,
      contact: (() => {
        if(post.contact && post.email) return `${post.contact} / ${post.email}`;
        if(post.contact) return post.contact;
        if(post.email) return post.email;
        return "No contact info provided";
      })(),
      date: new Date(post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
    }));


    res.status(200).json({
      message: "✅ Posts fetched successfully",
      posts: cleanedPosts
    });
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    res.status(500).json({ message: error.message });
  }
};