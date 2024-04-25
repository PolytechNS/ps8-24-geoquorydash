const {createUserCollection} = require('../../models/users/users');
const { ObjectId } = require('mongodb');

class SkinManager {
    async getSkinURL(userObjectID) {
        try {
            const usersCollection = await createUserCollection();
            const user = await usersCollection.findOne({ _id: new ObjectId(userObjectID) });
            if (user) {
                console.log("Un user a bien été trouvé dans les skins, son skin est : " + user.skinURL);
                return user.skinURL;
            } else {
                console.log("User not found in skin");
            }
        } catch (error) {
            console.log("Error dans les skins : " + error)
        }
    }
}

const skinManagerInstance = new SkinManager();
module.exports = skinManagerInstance;