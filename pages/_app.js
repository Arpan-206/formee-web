import "carbon-components/scss/globals/scss/styles.scss";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Formee</title>
        <link rel="icon" href="/logo.svg" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
