import React, { useState, useEffect } from "react";
import { InstagramViewImages } from "./components";
import { checkUserAvailble } from "./api";
import { ErrorBoundry } from "./components/ErrorBoundry";
function App() {
  const slug = window.location.pathname.replace("/", "");
  const [isUserAvailble, setIsUserAvailble] = useState(false);
  const [isloading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      setIsLoading(true);
      checkUserAvailble(slug)
        .then((res) => {
          setIsUserAvailble(res);
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [slug]);
  return isloading ? (
    <div className="header">loading....</div>
  ) : !slug ? (
    <>
      <ErrorBoundry isNotFound={true}/>
    </>
  ) : !isUserAvailble ? (
    <ErrorBoundry isNotFound={false}/>
  ) : (
    <>
      <InstagramViewImages useData={isUserAvailble} />
    </>
  );
}

export default App;
