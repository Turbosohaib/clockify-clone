import { getSession } from "next-auth/react";

/**
 * Server side props function runs on serverside
 * Checks whether the user is logged in or not and takes appropriate action
 * 
 * This is our root index page which redirects the user to appropriate link
 * This file will be executed if someone visits the app url without mentioning any specific path in there
 * 
 * @param {*} param 
 * @returns 
 */
export async function getServerSideProps({ req }) {
    // Get user session from the request headers
    const session = await getSession({ req });

    // If user is logged in then redirect to dashboard
    // If not then redirect the user to the signin page for login
    if (session) {
        return {
            redirect: {
                destination: "/dashboard",
            }
        };
    } else {
        return {
            redirect: {
                destination: "/login",
            }
        };
    }
}

/**
 * Our default root index page component function
 * 
 * @param {*} props
 * @returns 
 */
export default function Index() {
    return <div></div>;
}
