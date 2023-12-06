import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import clientPromise from "../../../util/mongodb";
import bcrypt from "bcrypt";
import { EJSON } from "bson";

// const uri = process.env.MONGODB_URI;

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Add your authentication logic here
        const { email, password } = credentials;

        try {
          const client = await clientPromise;
          const db = client.db("Projects_timesheet");
          const user = EJSON.serialize(await db.collection("Users").findOne({ email }));

          if (user) {
            // User found, compare the provided password with the stored hashed password
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (isPasswordValid) {
              // Passwords match, user is authenticated
              console.log('User authenticated!');
              console.log(user);
              return {
                id: user._id.$oid,
                email: user.email
              };
            } else {
              // Passwords do not match
              console.log('User failed!');
              return null;
            }
          } else {
            // User not found
            return null;
          }

          // if (user && password === user.password) {
          //   // If the user is found and the password matches, return the user object
          //   console.log('User authenticated!');
          //   return user;
          // } else {
          //   // If the user is not found or the password is incorrect, return null
          //   console.log('User failed!');
          //   return null;
          // }
        } catch (error) {
          // Handle error connecting to MongoDB or during authentication
          console.error('Error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      const client = await clientPromise;
      const db = client.db("Projects_timesheet");
      const dbUser = EJSON.serialize(await db.collection("Users").findOne({ email: token.email }));

      // Send properties to the client, like an access_token and user id from a provider.
      session.user.id = dbUser._id.$oid;
      return session
    }
  },
  pages: {
    signIn: '/signin'
  }
}

export default NextAuth(authOptions);

// export async function connectToDatabase() {
//   const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//   try {
//     // Connect to the MongoDB database
//     await client.connect();
//     console.log('Connected to MongoDB');
//     return client;
//   } catch (error) {
//     console.error('Error connecting to MongoDB:', error);
//     throw error;
//   }
// }