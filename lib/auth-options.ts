import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { supabaseAdmin } from '@/lib/supabase';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],

    session: {
        strategy: 'jwt',
    },

    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google') {
                try {
                    // Use providerAccountId as stable user ID
                    const userId = account.providerAccountId;

                    const { error } = await supabaseAdmin
                        .from('users')
                        .upsert(
                            {
                                id: userId,
                                email: user.email!,
                                name: user.name,
                                image: user.image,
                                updated_at: new Date().toISOString(),
                            },
                            { onConflict: 'id' }
                        );

                    if (error) {
                        console.error('Supabase upsert error:', error);
                        return false;
                    }

                    user.id = userId; // set ID for JWT
                    return true;
                } catch (err) {
                    console.error('Sign-in error:', err);
                    return false;
                }
            }
            return true;
        },

        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },

    pages: {
        signIn: '/signin',
    },

    secret: process.env.NEXTAUTH_SECRET!,
};
