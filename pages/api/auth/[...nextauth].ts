import NextAuth, { NextAuthOptions } from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";

const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

export const authOptions: NextAuthOptions = {
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID || "",
      clientSecret: process.env.AUTH0_CLIENT_SECRET || "",
      issuer: process.env.AUTH0_ISSUER,
      style: {
        logo: "/auth0.svg",
        logoDark: "/auth0-dark.svg",
        bg: "#fff",
        text: "#EB5424",
        bgDark: "#fff",
        textDark: "#161b22",
      },

      async profile(profile, tokens) {
        try {
          const apiUrl = "https://old.online.ntnu.no/api/v1/profile/";

          const headers = {
            Authorization: `Bearer ${tokens.access_token}`,
          };

          const response = await fetch(apiUrl, { headers });

          if (!response.ok) {
            throw new Error("Failed to fetch user profile");
          }

          const userInfo = await response.json();

          const commiteeUrl = `https://old.online.ntnu.no/api/v1/group/online-groups/?members__user=${userInfo.id}`;
          const committeeResponse = await fetch(commiteeUrl, { headers });
          if (!committeeResponse.ok)
            throw new Error("Failed to fetch committees");

          const committeeData = await committeeResponse.json();

          // const committees = committee.results.map((committee: any) => ({
          //   name: committee.name_short,
          //   id: committee.id,
          // }));

          // console.log(committee);

          return {
            id: userInfo.id,
            subId: profile.sub,
            name: userInfo.first_name + " " + userInfo.last_name,
            email: userInfo.email,
            //phone: userInfo.phone_number,
            //grade: userInfo.year,
            committees: committeeData.results.map((committee: any) =>
              committee.name_short.toLowerCase()
            ),
            isCommittee: userInfo.is_committee,
          };
        } catch (error) {
          console.error(error);
          throw new Error("Failed to fetch user profile");
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // server side
    async jwt({ token, account, user }) {
      try {
        if (account && account.access_token) {
          token.accessToken = account?.access_token;
        }
        if (user) {
          token.id = user.id;
          token.phone = user.phone;
          token.grade = user.grade;
          token.subId = user.subId;
          token.committees = user.committees;
          token.isCommittee = user.isCommittee;
          token.role = adminEmails.includes(user.email) ? "admin" : "user";
        }
        return token;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch user profile");
      }
    },
    // client side
    async session({ session, token }) {
      try {
        if (session.user) {
          session.accessToken = token.accessToken as string;

          session.user.role = token.role as "admin" | "user";
          session.user.owId = token.subId as string;
          session.user.phone = token.phone as string;
          session.user.grade = token.grade as number;
          session.user.id = token.id as string;
          session.user.committees = token.committees as string[];
          session.user.isCommittee = token.isCommittee as boolean;
        }
        return session;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch user profile");
      }
    },
  },
};

export default NextAuth(authOptions);
