import mongoose from 'mongoose';

// THIS SCHEMA REPRESENTS ALL THE USERS WHOS LIKED ME
export const likeSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId, // SO, THIS WILL BE ME USERID
  likes: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      type: {
        type: String,
        enum: ['LOVE', 'FRIENDSHIP', 'BOTH'],
        required: true
      }
    }
  ]
});

const Like = mongoose.model('Like', likeSchema);

export default Like;
