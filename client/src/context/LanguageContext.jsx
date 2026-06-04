import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const TRANSLATIONS = {
  en: {
    // Nav
    browse: 'Browse',
    orders: 'Orders',
    impact: 'Impact',
    signOut: 'Sign Out ↗',
    signIn: 'Sign In ↗',
    about: 'About',
    contact: 'Contact',
    // Landing
    heroTag: 'Nepal\'s first direct farm marketplace',
    heroHeadline: 'From the farm. For the market.',
    heroSub: 'Connect directly with local farmers. Fresh produce, fair prices, zero middlemen.',
    iAm: 'I AM A',
    farmer: 'Farmer',
    vendor: 'Buyer / Vendor',
    alreadyHaveAccount: 'Already have an account?',
    loginHere: 'Log in here',
    // Common
    loading: 'Loading...',
    back: '← Back',
    orderNow: 'Order Now',
    freshProduce: 'Fresh Produce',
    myOrders: 'My Orders',
    available: 'available',
    directFromFarmers: 'Direct from farmers',
    searchPlaceholder: 'Search crops or district...',
    noProduceFound: 'No produce found',
    tryDifferentSearch: 'Try a different search term',
    browseProduce: 'Browse Produce →',
    totalOrders: 'orders total',
    noOrdersYet: 'No orders yet',
    browseFirst: 'Browse produce and place your first order',
  },
  ne: {
    // Nav
    browse: 'उत्पादन हेर्नुस्',
    orders: 'अर्डरहरू',
    impact: 'प्रभाव',
    signOut: 'बाहिर निस्कनुस् ↗',
    signIn: 'साइन इन ↗',
    about: 'हाम्रोबारे',
    contact: 'सम्पर्क',
    // Landing
    heroTag: 'नेपालको पहिलो प्रत्यक्ष कृषि बजार',
    heroHeadline: 'खेतबाट। बजारको लागि।',
    heroSub: 'स्थानीय किसानसँग सीधा जोडिनुस्। ताजा उत्पादन, उचित मूल्य, बिचौलिया शून्य।',
    iAm: 'म हुँ',
    farmer: 'किसान',
    vendor: 'खरिदकर्ता / व्यापारी',
    alreadyHaveAccount: 'पहिले नै खाता छ?',
    loginHere: 'यहाँ लग इन गर्नुस्',
    // Common
    loading: 'लोड हुँदैछ...',
    back: '← फिर्ता',
    orderNow: 'अर्डर गर्नुस्',
    freshProduce: 'ताजा उत्पादन',
    myOrders: 'मेरा अर्डरहरू',
    available: 'उपलब्ध',
    directFromFarmers: 'किसानबाट सिधै',
    searchPlaceholder: 'बाली वा जिल्ला खोज्नुस्...',
    noProduceFound: 'कुनै उत्पादन भेटिएन',
    tryDifferentSearch: 'फरक खोजी गर्नुस्',
    browseProduce: 'उत्पादन हेर्नुस् →',
    totalOrders: 'अर्डर जम्मा',
    noOrdersYet: 'अहिलेसम्म कुनै अर्डर छैन',
    browseFirst: 'उत्पादन हेर्नुस् र पहिलो अर्डर गर्नुस्',
  },
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');
  const toggle = () => setLang(l => l === 'en' ? 'ne' : 'en');
  const t = (key) => TRANSLATIONS[lang][key] || TRANSLATIONS['en'][key] || key;
  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
