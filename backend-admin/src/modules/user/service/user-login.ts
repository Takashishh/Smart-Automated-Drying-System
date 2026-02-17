import type { FastifyInstance } from "fastify";
import { ServiceError } from "../../../error/service-error.js";

interface UserLoginBody {
  email: string;
  password: string;
}

export async function userLoginService(
  fastify: FastifyInstance,
  body: UserLoginBody
) {
  try {
    // Get user by email from Firestore
    const usersSnapshot = await fastify.db
      .collection("users")
      .where("email", "==", body.email)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      throw new ServiceError(401, "Invalid email or password");
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc!.data() ?? {};

    // Check if user account is activat

    const apiKey = process.env.FIREBASE_API_KEY || process.env.FIREBASE_WEB_API_KEY;
    if (!apiKey) {
      throw new ServiceError(500, "Auth configuration error");
    }

    try {
      // Verify password using Firebase Identity Toolkit
      const signInResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: body.email,
            password: body.password,
            returnSecureToken: true
          })
        }
      );

      if (!signInResponse.ok) {
        const errorData = await signInResponse.json().catch(() => ({}));
        fastify.log.error({ error: errorData }, "Firebase auth failed");
        throw new ServiceError(401, "Invalid email or password");
      }

      const signInData = await signInResponse.json();
      const uid = signInData?.localId;
      if (!uid) {
        throw new ServiceError(401, "Invalid email or password");
      }

      // Create a custom token for the user
      const customToken = await fastify.firebaseAdmin.auth().createCustomToken(uid);
      
      return {
        token: customToken,
        user: {
          uid: userDoc!.id,
          email: userData.email,
          displayName: userData.displayName || `${userData.firstName} ${userData.lastName}`,
          firstName: userData.firstName,
          lastName: userData.lastName,
          emailVerified: userData.emailVerified || false,
          photoUrl: userData.photoUrl || null,
          contactNumber: userData.contactNumber || null,
          address: userData.address || null,
          status: userData.status,
          devices: userData.devices || []
        }
      };
    } catch (authError) {
      fastify.log.error(authError);
      throw new ServiceError(401, "Invalid email or password");
    }

  } catch (err) {
    if (err instanceof ServiceError) {
      throw err;
    }
    fastify.log.error(err);
    throw new ServiceError(500, "Internal Server Error");
  }
}
