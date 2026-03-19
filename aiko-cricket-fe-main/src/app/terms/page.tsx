import NavbarWithData from "@/components/navbar/navbar-with-data";
import TermsNavigationWrapper from "@/components/terms/terms-navigation-wrapper";

export const metadata = {
  title: "Terms and Conditions | Aiko Cricket",
  description: "Terms and conditions for using Aiko Cricket.",
};

export default function TermsPage() {
  const showAllLanguages = process.env.SHOW_ALL_LANGUAGES === "true";
  const authAuth0Id = process.env.AUTH_AUTH0_ID || "";
  const auth0Issuer = process.env.AUTH0_ISSUER || "";

  return (
    <>
      <NavbarWithData 
        showAllLanguages={showAllLanguages} 
        AUTH_AUTH0_ID={authAuth0Id} 
        AUTH0_ISSUER={auth0Issuer} 
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-10">
          <TermsNavigationWrapper />
        </div>
      </div>
    </>
  );
}