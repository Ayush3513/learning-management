import { clerkMiddleware, createClerkClient, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Initialize clerkClient
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY, // Ensure you have this environment variable set
});

const isStudentRoute = createRouteMatcher(["/user/(.*)"]);
const isTeacherRoute = createRouteMatcher(["/teacher/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.sub;

  // Check if userId is validnpm 
  if (!userId) {
    // Handle the case where the user is not signed in
    console.log("User is not signed in.");
    return NextResponse.next(); // or redirect to a sign-in page if needed
  }

  // Fetch user metadata from Clerk
  const user = await clerkClient.users.getUser(userId);
  const userRole = user?.publicMetadata?.userType || "student";

  console.log(userRole);

  if (isStudentRoute(req)) {
    if (userRole !== "student") {
      const url = new URL("/teacher/courses", req.url);
      return NextResponse.redirect(url);
    }
  }

  if (isTeacherRoute(req)) {
    if (userRole !== "teacher") {
      const url = new URL("/user/courses", req.url);
      return NextResponse.redirect(url);
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};