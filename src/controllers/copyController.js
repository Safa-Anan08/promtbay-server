const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const copyPrompt = async (req, res) => {
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
await db.collection("prompts")
.findOne({
_id: promptId,
});

if (!prompt) {
return res.status(404).json({
success: false,
message: "Prompt not found",
});
}

const exists =
await db.collection("copies")
.findOne({
promptId,
userEmail:
req.user.email,
});

if (exists) {

await db.collection("copies")
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
$inc:{
copyCount:-1,
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

success:true,

copied:false,

action:"removed",

copyCount:
Math.max(
updated?.copyCount || 0,
0
),

message:
"Copy removed",

});
}

await db.collection("copies")
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
$inc:{
copyCount:1,
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

success:true,

copied:true,

action:"added",

copyCount:
updated.copyCount,

message:
"Prompt copied",

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

const getCopiedPrompts = async (req,res)=>{

try{

const db=getDB();

if(!req.user?.email){

return res.status(401).json({
success:false,
message:"Login required",
});

}

const copied =
await db.collection("copies")
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

copied,

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

module.exports = {
copyPrompt,
getCopiedPrompts,
};