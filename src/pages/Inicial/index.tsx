import { AppHeader } from "../../components/AppHeader";
import AuthenticatedPromo from "../../components/inicial/AuthenticatedPromo";
import CategoriesSection from "../../components/inicial/CategoriesSection";
import FeatureCardsSection from "../../components/inicial/FeatureCardsSection";
import FooterSection from "../../components/inicial/FooterSection";
import HeroSection from "../../components/inicial/HeroSection";
import OffersSection from "../../components/inicial/OffersSection";
import ProductsSection from "../../components/inicial/ProductsSection";
import SignupSection from "../../components/inicial/SignupSection";
import SocialCommunityCard from "../../components/inicial/SocialCommunityCard";
import { useAuth } from "../../context/AuthContext";

const Inicial = () => {
  const { user, loading } = useAuth();

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#f3f3f3] font-['Montserrat',sans-serif] text-[#071735] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0 [&_p]:m-0">
      <AppHeader />
      <HeroSection />
      <FeatureCardsSection />
      <OffersSection />
      <ProductsSection className="mt-[38px]" />

      <section
        className={`mx-auto mt-[56px] w-[calc(100%-24px)] max-w-[1312px] scroll-mt-[210px] overflow-hidden rounded-[24px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.07)] sm:w-[calc(100%-70px)] ${
          !loading && user ? "px-0 py-0" : "px-6 py-8 md:px-10 md:py-10"
        }`}
        id="cupons"
      >
        {!loading && user ? <AuthenticatedPromo /> : <SignupSection />}
      </section>

      <ProductsSection />
      <ProductsSection />
      <ProductsSection />

      <CategoriesSection />
      <SocialCommunityCard />
      <FooterSection />
    </main>
  );
};

export default Inicial;
