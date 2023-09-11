import React, { useState, useEffect } from "react";
import { InstagramViewImages } from "./components";
import { checkUserAvailble } from "./api";

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
      <h1>page not found</h1>
    </>
  ) : !isUserAvailble ? (
    <h1>user not found</h1>
  ) : (
    <>
      <InstagramViewImages useData={isUserAvailble} />
    </>
  );
}

export default App;
