const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const toggleBookmark = async (req, res) => {
try {

const db = getDB();

if (!req.user?.email) {
return res.status(401).json({
success: false,
message: "Login required",
});
}

const promptId =
new ObjectId(req.params.id);

const prompt =
await db.collection("prompts").findOne({
_id: promptId,
});

if (!prompt) {
return res.status(404).json({
success: false,
message: "Prompt not found",
});
}

const exists =
await db.collection("bookmarks")
.findOne({
promptId,
userEmail:
req.user.email,
});

if (exists) {

await db.collection("bookmarks")
.deleteOne({
_id:
exists._id,
});

await db.collection("prompts")
.updateOne(
{
_id:
promptId,
},
{
$inc: {
bookmarkCount: -1,
},
}
);

const updated =
await db.collection("prompts")
.findOne({
_id:
promptId,
});

return res.json({

success: true,

bookmarked: false,

bookmarkCount:
Math.max(
updated?.bookmarkCount || 0,
0
),

message:
"Bookmark Removed",

});
}

await db.collection("bookmarks")
.insertOne({

promptId,

userEmail:
req.user.email,

createdAt:
new Date(),

});

await db.collection("prompts")
.updateOne(
{
_id:
promptId,
},
{
$inc: {
bookmarkCount: 1,
},
}
);

const updated =
await db.collection("prompts")
.findOne({
_id:
promptId,
});

return res.json({

success: true,

bookmarked: true,

bookmarkCount:
updated.bookmarkCount,

message:
"Bookmarked",

});

}

catch(error){

console.log(error);

return res.status(500).json({
success:false,
message:error.message,
});

}

};

const getBookmarks = async (req,res)=>{

try{

const db=getDB();

if(!req.user?.email){

return res.status(401).json({
success:false,
message:"Login required",
});

}

const saved=
await db.collection("bookmarks")
.aggregate([

{
$match:{
userEmail:
req.user.email,
},
},

{
$lookup:{
from:"prompts",

localField:
"promptId",

foreignField:
"_id",

as:"prompt",
},
},

{
$unwind:
"$prompt",
},

{
$replaceRoot:{
newRoot:
"$prompt",
},
},

{
$sort:{
createdAt:-1,
},
},

])
.toArray();

return res.json({

success:true,

saved,

});

}

catch(error){

console.log(error);

return res.status(500).json({
success:false,
message:error.message,
});

}

};

module.exports={
toggleBookmark,
getBookmarks,
};