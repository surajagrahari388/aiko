import Navbar from "@/components/navbar/navbar";
import SettingsPage from "@/components/settings/settings-page";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Settings | Aiko Cricket",
};

const page = async () => {
  const showAllLanguages = process.env.SHOW_ALL_LANGUAGES === "true";
  const authAuth0Id = process.env.AUTH_AUTH0_ID || "";
  const auth0Issuer = process.env.AUTH0_ISSUER || "";

  return (
    <>
      <Navbar
        showAllLanguages={showAllLanguages}
        AUTH_AUTH0_ID={authAuth0Id}
        AUTH0_ISSUER={auth0Issuer}
      />
      <SettingsPage
        SHOW_ALL_LANGUAGES={showAllLanguages}
      />
    </>
  );
};

export default page;
