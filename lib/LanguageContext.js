'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    welcome: 'Welcome',
    login: 'Login',
    register: 'Register',
    dashboard: 'Dashboard',
    send: 'Send Money',
    receive: 'Receive',
    history: 'History',
    invest: 'Invest',
    profile: 'Profile',
    logout: 'Logout',
    balance: 'Balance',
    sendMoney: 'Send Money',
    receiveMoney: 'Receive Money',
    recentTransactions: 'Recent Transactions',
    noTransactions: 'No transactions yet',
    phoneNumber: 'Phone Number',
    password: 'Password',
    fullName: 'Full Name',
    country: 'Country',
    amount: 'Amount',
    confirm: 'Confirm',
    cancel: 'Cancel',
    success: 'Success',
    error: 'Error',
    loading: 'Loading...',
  },
  hi: {
    welcome: 'स्वागत है',
    login: 'लॉगिन',
    register: 'रजिस्टर',
    dashboard: 'डैशबोर्ड',
    send: 'पैसे भेजें',
    receive: 'प्राप्त करें',
    history: 'इतिहास',
    invest: 'निवेश',
    profile: 'प्रोफ़ाइल',
    logout: 'लॉगआउट',
    balance: 'बैलेंस',
    sendMoney: 'पैसे भेजें',
    receiveMoney: 'पैसे प्राप्त करें',
    recentTransactions: 'हाल के लेनदेन',
    noTransactions: 'अभी तक कोई लेनदेन नहीं',
    phoneNumber: 'फ़ोन नंबर',
    password: 'पासवर्ड',
    fullName: 'पूरा नाम',
    country: 'देश',
    amount: 'राशि',
    confirm: 'पुष्टि करें',
    cancel: 'रद्द करें',
    success: 'सफलता',
    error: 'त्रुटि',
    loading: 'लोड हो रहा है...',
  },
  ar: {
    welcome: 'مرحباً',
    login: 'تسجيل الدخول',
    register: 'التسجيل',
    dashboard: 'لوحة التحكم',
    send: 'إرسال المال',
    receive: 'استلام',
    history: 'السجل',
    invest: 'استثمار',
    profile: 'الملف الشخصي',
    logout: 'تسجيل الخروج',
    balance: 'الرصيد',
    sendMoney: 'إرسال المال',
    receiveMoney: 'استلام المال',
    recentTransactions: 'المعاملات الأخيرة',
    noTransactions: 'لا توجد معاملات حتى الآن',
    phoneNumber: 'رقم الهاتف',
    password: 'كلمة المرور',
    fullName: 'الاسم الكامل',
    country: 'البلد',
    amount: 'المبلغ',
    confirm: 'تأكيد',
    cancel: 'إلغاء',
    success: 'نجاح',
    error: 'خطأ',
    loading: 'جاري التحميل...',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('language') || 'en';
    setLanguage(saved);
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
