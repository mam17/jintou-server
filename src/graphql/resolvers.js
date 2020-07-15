import { PubSub } from 'apollo-server-express';
import {
  editProfile,
  getProfilesToHome,
  updateProfileLocation,
  addProfileImage,
  removeProfileImage
} from '../services/profile';
import Profile from '../models/Profile';
import { sendMessage } from '../services/chat';
import Chat from '../models/Chat';
import { like } from '../services/like';
import Match from '../models/Match';
import { unlike } from '../services/unlike';
import { saveUserConfig } from '../services/user';

const pubsub = new PubSub();

const UPDATE_CHAT = 'UPDATE_CHAT';

const resolvers = {
  Subscription: {
    updateChat: {
      subscribe: () => pubsub.asyncIterator([UPDATE_CHAT])
    }
  },
  Query: {
    user: async (_, __, { user }) => {
      const { name, email, configs } = user;
      return { name, email, configs };
    },
    profile: async (_, __, { user: { _id } }) => {
      const profile = await Profile.findById(_id);
      if (!profile) {
        return {};
      }
      return profile;
    },
    home: async (_, __, { user }) => {
      const profiles = await getProfilesToHome({ user });
      return profiles;
    },
    chat: async (_, { matchId }, { user: { _id } }) => {
      const chat = await Chat.findOne({ _id: matchId, 'participants._id': _id });
      return chat;
    },
    matches: async (_, __, { user: { _id } }) => {
      const matches = await Match.find({ 'matches._id': _id });
      return matches;
    }
  },
  Mutation: {
    editProfile: async (_, args, { user }) => {
      const profile = await editProfile({ user, ...args });
      return profile;
    },
    sendMessage: async (_, { matchId, message }, { user: { _id } }) => {
      const chat = await sendMessage({ matchId, senderId: _id, message });

      await pubsub.publish(UPDATE_CHAT, {
        updateChat: chat
      });

      return chat;
    },
    likeSomeone: async (_, { userLikedId }, { user }) => {
      const match = await like({ userLikedId, user });
      return match;
    },
    unlikeSomeone: async (_, { userUnlikedId }, { user }) => {
      await unlike({ user, userUnlikedId });
    },
    sendGeoLocation: async (_, args, { user: { _id } }) => {
      await updateProfileLocation({ ...args, userId: _id });
    },
    saveUserConfigs: async (_, data, { user }) => {
      await saveUserConfig({
        ...data,
        user
      });
    },
    addProfileImage: async (_, { file }, { user }) => {
      await addProfileImage({ file, user });
    },
    removeProfileImage: async (_, { imageId }, { user }) => {
      await removeProfileImage({ imageId, user });
    }
  }
};

export default resolvers;
