import Credentials from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/mongodb"; 
import {User} from '@/database/user.model';
import NextAuth from "next-auth";

export const {handlers, auth, signIn, signOut } = NextAuth({
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email"},
                password: { label: "Password", type: "password" }    
            },
            async authorize(credentials){
                let user = null;
                
                if(!credentials?.email || !credentials?.password){
                    return null;
                }
                
                await connectToDatabase();
                user = await User.findOne({ email: credentials.email }).select('+password');
                if(!user){
                    throw new Error('No user found with the given email');
                }
                const isPasswordValid = await user.comparePassword(credentials.password);
                if(!isPasswordValid){
                    return null;
                }
                
                return { id: user._id.toString(), email: user.email  };
            }
        })
    ],
    session: { strategy: 'jwt' },
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({token, user}) {
            if (user) {
                token.id = user.id as string;
                token.email = user.email as string;
            }
            return token;
        },
        async session({session, token}) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
            }
            return session;
        }
    }
})