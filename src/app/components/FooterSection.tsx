import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import '../../styles/fonts.css';

export function FooterSection() {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsRules, setShowTermsRules] = useState(false);

  return (
    <>
      {/* FOOTER SECTION - KeyDrop Style */}
      <div className="mt-32 px-12 pb-20">
        <div className="max-w-[1600px] mx-auto">
          {/* Stats Container - Centered */}
          <div className="relative">
            {/* Main Container - Flat Clean Panel */}
            <div 
              className="relative px-12 py-12"
              style={{
                background: '#1d1d22',
                borderRadius: '48px',
              }}
            >
              {/* Content Grid */}
              <div className="relative z-10 flex items-center justify-between">
                {/* Left Section: Stats + Divider + Socials */}
                <div className="flex items-center gap-8">
                  {/* Stats Grid - Left Aligned */}
                  <div className="flex flex-col gap-6 pl-4">
                    {/* Cases Opened */}
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: '#d4af37',
                        }}
                      >
                        <img 
                          src="https://i.ibb.co/Gv0XvbQc/free-icon-keys-4230132.png" 
                          alt="Keys"
                          className="w-6 h-6"
                          style={{
                            filter: 'brightness(0) saturate(100%)'
                          }}
                        />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-white font-mono">47</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Cases Opened</div>
                      </div>
                    </div>

                    {/* Players */}
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: '#d4af37',
                        }}
                      >
                        <img 
                          src="https://i.ibb.co/fGBRstJM/free-icon-multiple-users-silhouette-33308.png" 
                          alt="Users"
                          className="w-6 h-6"
                          style={{
                            filter: 'brightness(0) saturate(100%)'
                          }}
                        />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-white font-mono">1,464</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Players</div>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Divider */}
                  <div 
                    className="w-px h-32"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)'
                    }}
                  />

                  {/* Social Media Icons */}
                  <div className="flex flex-col gap-4 pr-8">
                    {/* Instagram */}
                    <a 
                      href="#" 
                      className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                    >
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
                        style={{
                          background: '#25252a',
                        }}
                      >
                        <svg className="w-5 h-5 transition-colors duration-300 group-hover:text-[#E4405F]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                      <span className="text-sm uppercase tracking-wide font-[Aldrich]">Instagram</span>
                    </a>

                    {/* TikTok */}
                    <a 
                      href="#" 
                      className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                    >
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
                        style={{
                          background: '#25252a',
                        }}
                      >
                        <svg className="w-5 h-5 transition-colors duration-300 group-hover:text-[#00f2ea]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                      </div>
                      <span className="text-sm uppercase tracking-wide font-[Aldrich]">TikTok</span>
                    </a>

                    {/* Discord */}
                    <a 
                      href="#" 
                      className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                    >
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
                        style={{
                          background: '#25252a',
                        }}
                      >
                        <svg className="w-5 h-5 transition-colors duration-300 group-hover:text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                      </div>
                      <span className="text-sm uppercase tracking-wide font-[Aldrich]">Discord</span>
                    </a>
                  </div>

                  {/* Legal Buttons */}
                  <div className="flex flex-col gap-3 pl-8 pr-4">
                    {/* Privacy Policy */}
                    <button 
                      onClick={() => setShowPrivacyPolicy(true)}
                      className="px-6 py-3 text-sm uppercase tracking-wide font-[Aldrich] text-gray-400 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/5"
                      style={{
                        background: '#25252a',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      Privacy Policy
                    </button>

                    {/* Terms & Rules */}
                    <button 
                      onClick={() => setShowTermsRules(true)}
                      className="px-6 py-3 text-sm uppercase tracking-wide font-[Aldrich] text-gray-400 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/5"
                      style={{
                        background: '#25252a',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      Terms & Rules
                    </button>
                  </div>
                </div>

                {/* Character - Right Side, Sitting on Container */}
                <div className="absolute -bottom-12 right-6">
                  <img 
                    src="https://i.ibb.co/9kL0pxvj/5.png" 
                    alt="CS2 Character"
                    className="h-[400px] object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacyPolicy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => setShowPrivacyPolicy(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl max-w-4xl w-full border border-white/10 flex flex-col"
              style={{
                background: '#131217',
                maxHeight: '85vh',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Fixed */}
              <div className="flex items-center justify-between p-8 pb-6 border-b border-white/10 flex-shrink-0">
                <h2 className="text-2xl font-bold uppercase font-[Aldrich] text-white">
                  Privacy Policy
                </h2>
                <button
                  onClick={() => setShowPrivacyPolicy(false)}
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto p-8 flex-1" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#7c2d3a #1a1a1a',
              }}>
                <div className="space-y-6 text-gray-300">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3 uppercase font-[Aldrich]">
                      PRIVACY POLICY
                    </h3>
                    <p className="text-lg text-gray-400 mb-2">CyberHub Privātuma politika</p>
                    <p className="text-sm text-gray-500">Spēkā no 2024. gada 1. janvāra</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">1. Ievads</h4>
                    <p>Šī Privātuma politika izskaidro, kā CyberHub ("mēs", "mūsu") vāc, izmanto, uzglabā un aizsargā jūsu personisko informāciju, kad izmantojat mūsu platformu keisu atvēršanai un balvu saņemšanai.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">2. Informācijas Vākšana</h4>
                    <p className="mb-2">Mēs vācam šādus datu veidus:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Konta informāciju (vārds, e-pasts, lietotājvārds)</li>
                      <li>Maksājumu informāciju (darījumu vēsture, bilance)</li>
                      <li>Spēles aktivitātes (atvērtie keisi, iegūtās balvas, līmenis)</li>
                      <li>Tehnisku informāciju (IP adrese, ierīces veids, pārlūkprogramma)</li>
                      <li>Steam/CS2 konta dati (trade link, inventārs)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">3. Informācijas Izmantošana</h4>
                    <p className="mb-2">Jūsu dati tiek izmantoti, lai:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Nodrošinātu platformas funkcionalitāti</li>
                      <li>Apstrādātu maksājumus un piegādātu balvas</li>
                      <li>Uzlabotu lietotāja pieredzi un personalizētu saturu</li>
                      <li>Novērstu krāpšanu un nodrošinātu drošību</li>
                      <li>Sazinātos ar jums par platformas jaunumiem</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">4. Datu Kopīgošana</h4>
                    <p>Mēs nekopīgojam jūsu personisko informāciju ar trešajām personām, izņemot:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Maksājumu apstrādātājiem (Stripe, PayPal)</li>
                      <li>Steam/Valve Corporation (trade operācijām)</li>
                      <li>Juridiskām iestādēm (ja to pieprasa likums)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">5. Sīkdatnes (Cookies)</h4>
                    <p>Mēs izmantojam sīkdatnes, lai uzlabotu platformas darbību, analizētu lietošanas statistiku un saglabātu jūsu preferences. Jūs varat pārvaldīt sīkdatņu iestatījumus savā pārlūkprogrammā.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">6. Datu Drošība</h4>
                    <p>Mēs izmantojam nozares standarta drošības pasākumus, tostarp šifrēšanu, drošus serverus un regulāras drošības audīcijas, lai aizsargātu jūsu datus no nesankcionētas piekļuves.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">7. Jūsu Tiesības</h4>
                    <p className="mb-2">Jums ir tiesības:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Piekļūt saviem personiskajiem datiem</li>
                      <li>Labot nepareizus datus</li>
                      <li>Pieprasīt datu dzēšanu</li>
                      <li>Ierobežot datu apstrādi</li>
                      <li>Atsaukt piekrišanu datu apstrādei</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">8. Izmaiņas Politikā</h4>
                    <p>Mēs paturam tiesības atjaunināt šo Privātuma politiku. Par būtiskām izmaiņām mēs informēsim lietotājus pa e-pastu vai platformā.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">9. Kontakti</h4>
                    <p>Ja jums ir jautājumi par šo Privātuma politiku, sazinieties ar mums:</p>
                    <p className="mt-2">
                      E-pasts: privacy@cyberhub.lv<br />
                      Adrese: Rīga, Latvija
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms & Rules Modal */}
      <AnimatePresence>
        {showTermsRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => setShowTermsRules(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl max-w-4xl w-full border border-white/10 flex flex-col"
              style={{
                background: '#131217',
                maxHeight: '85vh',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Fixed */}
              <div className="flex items-center justify-between p-8 pb-6 border-b border-white/10 flex-shrink-0">
                <h2 className="text-2xl font-bold uppercase font-[Aldrich] text-white">
                  Terms & Rules
                </h2>
                <button
                  onClick={() => setShowTermsRules(false)}
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto p-8 flex-1" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#7c2d3a #1a1a1a',
              }}>
                <div className="space-y-6 text-gray-300">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3 uppercase font-[Aldrich]">
                      TERMS & RULES
                    </h3>
                    <p className="text-lg text-gray-400 mb-2">CyberHub keisu sistēmas lietošanas noteikumi</p>
                    <p className="text-sm text-gray-500">Spēkā no 2024. gada 1. janvāra</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">1. Vispārīgie Noteikumi</h4>
                    <p>Izmantojot CyberHub platformu, jūs piekrītat šiem noteikumiem un apņematies tos ievērot. Ja jūs nepiekrītat kādam no punktiem, lūdzu, neizmantojiet platformu.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">2. Vecuma Ierobežojumi</h4>
                    <p>Platformas izmantošanai ir jābūt vismaz 18 gadus vecam vai jābūt sasniegušam pilngadību savā valstī. Reģistrējoties, jūs apliecināt, ka atbilstat šai prasībai.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">3. Konta Noteikumi</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Katram lietotājam drīkst būt tikai viens konts</li>
                      <li>Jūs esat atbildīgs par sava konta drošību</li>
                      <li>Aizliegts dalīties ar konta pieejas datiem</li>
                      <li>Mēs paturam tiesības slēgt kontus, kas pārkāpj noteikumus</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">4. Keisu Atvēršanas Noteikumi</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Katru keisu var atvērt tikai vienu reizi dienā (vai mēnesī event keisiem)</li>
                      <li>Nepieciešams uzglabāt minimālo depozītu, lai atvērtu keisu</li>
                      <li>Balvu sadalījums ir balstīts uz godīgu RNG (Random Number Generator) sistēmu</li>
                      <li>Visas izlozes ir galīgas un nevar tikt apstrīdētas</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">5. Balvu Saņemšana</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>CS2 priekšmeti tiek nosūtīti caur Steam trade</li>
                      <li>Fiziskās balvas tiek nosūtītas 14 darba dienu laikā</li>
                      <li>Naudas balvas tiek pievienotas kontam nekavējoties</li>
                      <li>Lai saņemtu CS2 priekšmetus, nepieciešams derīgs Steam trade link</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">6. Aizliegtās Darbības</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Krāpšana, izmantojot botus vai automatizāciju</li>
                      <li>Vairāku kontu izveide</li>
                      <li>Izmantot sistēmas ievainojamības</li>
                      <li>Viltus maksājumi vai chargeback</li>
                      <li>Balvu pārdošana vai apmaiņa ārpus platformas noteikumiem</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">7. Līmeņu Sistēma</h4>
                    <p>Atverot keisus, jūs iegūstat pieredzes punktus (XP) un paaugstināt savu līmeni. Augstāki līmeņi atver piekļuvi ekskluzīviem keisiem ar labākām balvām.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">8. Depozīti un Izņemšana</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Minimālais depozīts: €5</li>
                      <li>Maksimālais depozīts: €500 dienā</li>
                      <li>Naudas izņemšana pieejama tikai caur verificētiem kontiem</li>
                      <li>Izņemšanas apstrāde: 1-3 darba dienas</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">9. Atbildības Ierobežojumi</h4>
                    <p>CyberHub nav atbildīgs par:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Steam/Valve servisu darbības traucējumiem</li>
                      <li>Zaudējumiem, kas radušies tehniskām problēmām</li>
                      <li>Trešo pušu pakalpojumu kļūmēm</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">10. Izmaiņas Noteikumos</h4>
                    <p>Mēs paturam tiesības jebkurā laikā mainīt šos noteikumus. Par būtiskām izmaiņām lietotāji tiks informēti 7 dienas iepriekš.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2">11. Kontakti</h4>
                    <p>Jautājumu vai problēmu gadījumā sazinieties ar mūsu atbalsta komandu:</p>
                    <p className="mt-2">
                      E-pasts: support@cyberhub.lv<br />
                      Discord: discord.gg/cyberhub<br />
                      Darba laiks: 10:00 - 22:00 (GMT+2)
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
