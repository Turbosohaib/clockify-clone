import Head from "next/head";
import Router from "next/router";
import { useState } from "react";
import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export async function getServerSideProps({ req }) {
  // Get user session from the request headers
  const session = await getSession({ req });
  console.log(session);
  if (session) {
    return {
      redirect: {
        destination: "/dashboard",
      },
      props: {},
    };
  } else {
    return {
      props: {},
    };
  }
}

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [showLoader, setLoader] = useState(true);
  // console.log(message);

  const handleSubmit = async (e) => {
    setLoader(false);
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // Do not redirect, handle the response manually
    });
    if (result.ok) {
      Router.replace("/dashboard");
    } else {
      setMessage({ status: 0, text: "Invalid email or password!" });
    }
    // If user is logged in then redirect to dashboard
    // If not then set the message state varibale to show user a message
    // if (result.ok) {
    //     Router.replace('/dashboard')
    // } else {
    //     setMessage({ status: 0, text: result.error })
    // }
  };

  return (
    <div>
      <Head>
        <link rel="icon" href="/icons8-clock-16.png" />
        <title>Task Manager</title>
      </Head>
      <section className="bg-gray-50">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <a
            href="#"
            className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
          >
            <Image
              className="w-8 h-8 mr-2"
              src="/icons8-clock-16.png"
              alt="logo"
              width="16"
              height="16"
            />
            Task Manager
          </a>
          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Login to Task Manager
              </h1>
              <div hidden={showLoader} className="loader">
                <span>Loading...</span>
              </div>
              {message ? (
                <div
                  className={`flex items-center ${
                    message.status ? "bg-blue-500" : "bg-red-500"
                  } text-white text-sm font-bold px-4 py-3`}
                  role="alert"
                >
                  <p>{message.text}</p>
                </div>
              ) : (
                ""
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-4 md:space-y-6"
                action="#"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Enter email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="name@company.com"
                    required=""
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required=""
                  />
                </div>
                <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Login
                </button>
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                  Don&apos;t have an account?
                  <Link
                    href="/signup"
                    className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                  >
                    Register here
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
