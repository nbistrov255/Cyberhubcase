import { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ru' | 'lv';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Top Bar
    'topbar.cases': 'CASES',
    'topbar.inventory': 'INVENTORY',
    'topbar.deposit': 'DEPOSIT',
    'topbar.settings': 'SETTINGS',

    // Live Feed
    'livefeed.justWon': 'just won',
    'livefeed.from': 'from',

    // Cases Page
    'cases.title': 'OPEN CASES',
    'cases.deposit': 'DEPOSIT',
    'cases.free': 'FREE',
    'cases.hot': 'HOT',
    'cases.new': 'NEW',
    'cases.seeContents': 'SEE CONTENTS',
    'cases.openCase': 'OPEN CASE',
    'cases.addToOpen': 'ADD {amount} $ TO OPEN',

    // Case Content Page
    'caseContent.back': 'BACK',
    'caseContent.caseContents': 'CASE CONTENTS',
    'caseContent.openCase': 'OPEN CASE',
    'caseContent.addToOpen': 'ADD {amount} $ TO OPEN',

    // Case Open Page
    'caseOpen.back': 'BACK',
    'caseOpen.caseContents': 'CASE CONTENTS',
    'caseOpen.openCase': 'OPEN CASE',
    'caseOpen.opening': 'OPENING...',
    'caseOpen.addToOpen': 'ADD {amount} $ TO OPEN',

    // Win Page
    'win.youWon': 'YOU WON',
    'win.viewInventory': 'VIEW INVENTORY',
    'win.openAnother': 'OPEN ANOTHER',
    'win.totalValue': 'TOTAL VALUE',
    'win.from': 'FROM',

    // Inventory Page
    'inventory.title': 'MY INVENTORY',
    'inventory.all': 'ALL',
    'inventory.money': 'MONEY',
    'inventory.cs2Items': 'CS2 ITEMS',
    'inventory.physical': 'PHYSICAL',
    'inventory.available': 'AVAILABLE',
    'inventory.processing': 'PROCESSING',
    'inventory.received': 'RECEIVED',
    'inventory.failed': 'FAILED',
    'inventory.noItems': 'No items in this category yet',
    'inventory.startOpening': 'Start opening cases to fill your inventory!',
    'inventory.browseCase': 'BROWSE CASES',
    'inventory.claim': 'CLAIM',
    'inventory.claimed': 'CLAIMED',
    'inventory.value': 'Value',

    // Player Profile
    'profile.back': 'BACK',
    'profile.myProfile': 'MY PROFILE',
    'profile.publicProfile': 'PUBLIC PROFILE',
    'profile.memberSince': 'Member Since',
    'profile.totalWins': 'Total Wins',
    'profile.totalValue': 'Total Value',
    'profile.favoriteCase': 'Favorite Case',
    'profile.tradeLink': 'STEAM TRADE LINK',
    'profile.edit': 'Edit',
    'profile.save': 'Save',
    'profile.level': 'LEVEL',
    'profile.xp': 'XP',
    'profile.howLevelsWork': 'How Do Levels Work?',
    'profile.myInventory': 'MY INVENTORY',
    'profile.viewAll': 'VIEW ALL',
    'profile.claim': 'CLAIM',
    'profile.claimRequests': 'CLAIM REQUESTS',
    'profile.requestId': 'Request ID',
    'profile.item': 'Item',
    'profile.status': 'Status',
    'profile.timeLeft': 'Time Left',
    'profile.cancel': 'Cancel',
    'profile.pending': 'Pending',
    'profile.winHistory': 'WIN HISTORY',
    'profile.case': 'Case',

    // Level Modal
    'level.title': 'HOW DO LEVELS WORK?',
    'level.intro': 'Level up by opening cases and completing activities. Higher levels unlock exclusive rewards and perks!',
    'level.earnXpTitle': 'EARN XP BY',
    'level.openingCases': 'Opening cases',
    'level.openingCasesDesc': 'Earn XP based on case value',
    'level.dailyLogin': 'Daily login',
    'level.dailyLoginDesc': 'Get bonus XP every day',
    'level.achievements': 'Achievements',
    'level.achievementsDesc': 'Complete special challenges',
    'level.levelsTitle': 'LEVEL TIERS',
    'level.bronze': 'BRONZE',
    'level.bronzeDesc': 'Levels 1-25: Basic rewards',
    'level.silver': 'SILVER',
    'level.silverDesc': 'Levels 26-50: Better drop rates',
    'level.gold': 'GOLD',
    'level.goldDesc': 'Levels 51-75: Exclusive cases',
    'level.platinum': 'PLATINUM',
    'level.platinumDesc': 'Levels 76-100: VIP benefits',
    'level.rewardsTitle': 'REWARDS',
    'level.bonusXp': 'Bonus XP multiplier',
    'level.exclusiveItems': 'Exclusive items & cases',
    'level.prioritySupport': 'Priority customer support',
    'level.specialBadges': 'Special profile badges',
    'level.close': 'CLOSE',

    // Footer
    'footer.stats': 'STATISTICS',
    'footer.casesOpened': 'Cases Opened',
    'footer.itemsWon': 'Items Won',
    'footer.activeUsers': 'Active Users',
    'footer.social': 'SOCIAL',
    'footer.community': 'COMMUNITY',
    'footer.support': 'Support',
    'footer.faq': 'FAQ',
    'footer.legal': 'LEGAL',
    'footer.privacyPolicy': 'PRIVACY POLICY',
    'footer.termsRules': 'TERMS & RULES',
    'footer.fairPlay': 'Fair Play',
    'footer.responsible': 'Responsible Gaming',
    'footer.copyright': '© 2024 CyberHub. All rights reserved.',

    // Privacy Policy Modal
    'privacy.title': 'PRIVACY POLICY',
    'privacy.intro': 'At CyberHub, we take your privacy seriously. This policy outlines how we collect, use, and protect your personal information.',
    'privacy.section1Title': '1. INFORMATION WE COLLECT',
    'privacy.section1Text': 'We collect information you provide directly to us, including account details, transaction history, and communication preferences. We also automatically collect certain information about your device and how you interact with our platform.',
    'privacy.section2Title': '2. HOW WE USE YOUR INFORMATION',
    'privacy.section2Text': 'We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and communicate with you about products, services, and events.',
    'privacy.section3Title': '3. INFORMATION SHARING',
    'privacy.section3Text': 'We do not sell your personal information. We may share your information with service providers who perform services on our behalf, when required by law, or to protect our rights and the safety of our users.',
    'privacy.section4Title': '4. DATA SECURITY',
    'privacy.section4Text': 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
    'privacy.section5Title': '5. YOUR RIGHTS',
    'privacy.section5Text': 'You have the right to access, update, or delete your personal information. You can also object to processing, request data portability, and withdraw consent at any time.',
    'privacy.section6Title': '6. COOKIES',
    'privacy.section6Text': 'We use cookies and similar tracking technologies to collect information about your browsing activities and to personalize your experience.',
    'privacy.lastUpdated': 'Last Updated: December 2024',
    'privacy.contact': 'For questions about this Privacy Policy, please contact us at privacy@cyberhub.com',
    'privacy.close': 'CLOSE',

    // Terms & Rules Modal
    'terms.title': 'TERMS & RULES',
    'terms.intro': 'Welcome to CyberHub. By using our platform, you agree to these terms and conditions. Please read them carefully.',
    'terms.section1Title': '1. ACCOUNT REQUIREMENTS',
    'terms.section1Text': 'You must be at least 18 years old to use CyberHub. You are responsible for maintaining the security of your account and for all activities that occur under your account.',
    'terms.section2Title': '2. PROHIBITED ACTIVITIES',
    'terms.section2Text': 'You may not use CyberHub for any illegal purposes, attempt to manipulate case outcomes, create multiple accounts to abuse promotions, or engage in any form of fraud or deceptive practices.',
    'terms.section3Title': '3. CASE OPENING RULES',
    'terms.section3Text': 'All case outcomes are determined by our provably fair random number generator. Each case displays the exact odds for all items. Once a case is opened, the transaction is final and cannot be reversed.',
    'terms.section4Title': '4. WITHDRAWALS & CLAIMS',
    'terms.section4Text': 'Items can be claimed to your Steam account via trade link. Processing times may vary. We reserve the right to verify account ownership and request additional information for large claims.',
    'terms.section5Title': '5. DEPOSITS & BALANCE',
    'terms.section5Text': 'All deposits are final and non-refundable. Your balance can only be used within the platform. We do not offer cash withdrawals of deposited funds.',
    'terms.section6Title': '6. FAIR PLAY GUARANTEE',
    'terms.section6Text': 'CyberHub uses provably fair technology to ensure all case openings are random and cannot be manipulated. You can verify the fairness of each opening using our verification system.',
    'terms.section7Title': '7. RESPONSIBLE GAMING',
    'terms.section7Text': 'We promote responsible gaming. Set limits for yourself and never spend more than you can afford to lose. If you need help, please contact our support team or visit responsible gaming resources.',
    'terms.section8Title': '8. MODIFICATIONS',
    'terms.section8Text': 'We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.',
    'terms.lastUpdated': 'Last Updated: December 2024',
    'terms.contact': 'For questions about these Terms, please contact us at support@cyberhub.com',
    'terms.close': 'CLOSE',

    // Settings Modal
    'settings.title': 'SETTINGS',
    'settings.language': 'Language / Valoda / Язык',
    'settings.cancel': 'CANCEL',
    'settings.save': 'SAVE CHANGES',
    'settings.english': 'English',
    'settings.englishDesc': 'English language',
    'settings.russian': 'Русский',
    'settings.russianDesc': 'Russian language',
    'settings.latvian': 'Latviešu',
    'settings.latvianDesc': 'Latvian language',

    // Login Modal
    'login.title': 'AUTHORIZATION REQUIRED',
    'login.subtitle': 'Sign in to unlock all features',
    'login.username': 'Username/Phone',
    'login.password': 'Password',
    'login.usernamePlaceholder': 'Enter your username',
    'login.passwordPlaceholder': 'Enter your password',
    'login.signIn': 'SIGN IN',
    'login.signingIn': 'SIGNING IN...',
    'login.benefits': 'With authorization you can:',
    'login.benefit1': 'Open cases and win amazing prizes',
    'login.benefit2': 'Claim items to your Steam inventory',
    'login.benefit3': 'Track your winnings and statistics',
    'login.benefit4': 'Participate in exclusive promotions',
    'login.benefit5': 'Compete with other players',
    'login.note': 'Use your club profile credentials to sign in',
    'login.needAuth': 'Please sign in to {action}',
    'login.actionOpen': 'open cases',
    'login.actionClaim': 'claim items',
    'login.actionDeposit': 'deposit funds',
    'login.fillAllFields': 'Please fill in all fields',
    'login.loginSuccess': 'Login successful!',
    'login.loginFailed': 'Login failed. Please check your credentials.',
  },

  ru: {
    // Top Bar
    'topbar.cases': 'КЕЙСЫ',
    'topbar.inventory': 'ИНВЕНТАРЬ',
    'topbar.deposit': 'ПОПОЛНИТЬ',
    'topbar.settings': 'НАСТРОЙКИ',

    // Live Feed
    'livefeed.justWon': 'выиграл',
    'livefeed.from': 'из',

    // Cases Page
    'cases.title': 'ОТКРЫТЬ КЕЙСЫ',
    'cases.deposit': 'ПОПОЛНИТЬ',
    'cases.free': 'БЕСПЛАТНО',
    'cases.hot': 'ПОПУЛЯРНО',
    'cases.new': 'НОВОЕ',
    'cases.seeContents': 'СОДЕРЖИМОЕ',
    'cases.openCase': 'ОТКРЫТЬ КЕЙС',
    'cases.addToOpen': 'ДОБАВИТЬ {amount} $ ДЛЯ ОТКРЫТИЯ',

    // Case Content Page
    'caseContent.back': 'НАЗАД',
    'caseContent.caseContents': 'СОДЕРЖИМОЕ КЕЙСА',
    'caseContent.openCase': 'ОТКРЫТЬ КЕЙС',
    'caseContent.addToOpen': 'ДОБАВИТЬ {amount} $ ДЛЯ ОТКРЫТИЯ',

    // Case Open Page
    'caseOpen.back': 'НАЗАД',
    'caseOpen.caseContents': 'СОДЕРЖИМОЕ КЕЙСА',
    'caseOpen.openCase': 'ОТКРЫТЬ КЕЙС',
    'caseOpen.opening': 'ОТКРЫТИЕ...',
    'caseOpen.addToOpen': 'ДОБАВИТЬ {amount} $ ДЛЯ ОТКРЫТИЯ',

    // Win Page
    'win.youWon': 'ВЫ ВЫИГРАЛИ',
    'win.viewInventory': 'СМОТРЕТЬ ИНВЕНТАРЬ',
    'win.openAnother': 'ОТКРЫТЬ ЕЩЁ',
    'win.totalValue': 'ОБЩАЯ СТОИМОСТЬ',
    'win.from': 'ИЗ',

    // Inventory Page
    'inventory.title': 'МОЙ ИНВЕНТАРЬ',
    'inventory.all': 'ВСЕ',
    'inventory.money': 'ДЕНЬГИ',
    'inventory.cs2Items': 'ПРЕДМЕТЫ CS2',
    'inventory.physical': 'ФИЗИЧЕСКИЕ',
    'inventory.available': 'ДОСТУПНО',
    'inventory.processing': 'ОБРАБОТКА',
    'inventory.received': 'ПОЛУЧЕНО',
    'inventory.failed': 'ОШИБКА',
    'inventory.noItems': 'Нет предметов в этой категории',
    'inventory.startOpening': 'Начните открывать кейсы, чтобы заполнить инвентарь!',
    'inventory.browseCase': 'СМОТРЕТЬ КЕЙСЫ',
    'inventory.claim': 'ЗАБРАТЬ',
    'inventory.claimed': 'ЗАБРАНО',
    'inventory.value': 'Стоимость',

    // Player Profile
    'profile.back': 'НАЗАД',
    'profile.myProfile': 'МОЙ ПРОФИЛЬ',
    'profile.publicProfile': 'ПУБЛИЧНЫЙ ПРОФИЛЬ',
    'profile.memberSince': 'Участник с',
    'profile.totalWins': 'Всего побед',
    'profile.totalValue': 'Общая стоимость',
    'profile.favoriteCase': 'Любимый кейс',
    'profile.tradeLink': 'ССЫЛКА ОБМЕНА STEAM',
    'profile.edit': 'Редактировать',
    'profile.save': 'Сохранить',
    'profile.level': 'УРОВЕНЬ',
    'profile.xp': 'ОПЫТ',
    'profile.howLevelsWork': 'Как работают уровни?',
    'profile.myInventory': 'МОЙ ИНВЕНТАРЬ',
    'profile.viewAll': 'СМОТРЕТЬ ВСЁ',
    'profile.claim': 'ЗАБРАТЬ',
    'profile.claimRequests': 'ЗАПРОСЫ НА ПОЛУЧЕНИЕ',
    'profile.requestId': 'ID запроса',
    'profile.item': 'Предмет',
    'profile.status': 'Статус',
    'profile.timeLeft': 'Осталось времени',
    'profile.cancel': 'Отмена',
    'profile.pending': 'В ожидании',
    'profile.winHistory': 'ИСТОРИЯ ПОБЕД',
    'profile.case': 'Кейс',

    // Level Modal
    'level.title': 'КАК РАБОТАЮТ УРОВНИ?',
    'level.intro': 'Повышайте уровень, открывая кейсы и выполняя задания. Более высокие уровни открывают эксклюзивные награды и привилегии!',
    'level.earnXpTitle': 'ПОЛУЧАЙТЕ ОПЫТ ЗА',
    'level.openingCases': 'Открытие кейсов',
    'level.openingCasesDesc': 'Получайте опыт в зависимости от стоимости кейса',
    'level.dailyLogin': 'Ежедневный вход',
    'level.dailyLoginDesc': 'Получайте бонусный опыт каждый день',
    'level.achievements': 'Достижения',
    'level.achievementsDesc': 'Выполняйте специальные задания',
    'level.levelsTitle': 'УРОВНИ',
    'level.bronze': 'БРОНЗА',
    'level.bronzeDesc': 'Уровни 1-25: Базовые награды',
    'level.silver': 'СЕРЕБРО',
    'level.silverDesc': 'Уровни 26-50: Улучшенные шансы',
    'level.gold': 'ЗОЛОТО',
    'level.goldDesc': 'Уровни 51-75: Эксклюзивные кейсы',
    'level.platinum': 'ПЛАТИНА',
    'level.platinumDesc': 'Уровни 76-100: VIP привилегии',
    'level.rewardsTitle': 'НАГРАДЫ',
    'level.bonusXp': 'Бонусный множитель опыта',
    'level.exclusiveItems': 'Эксклюзивные предметы и кейсы',
    'level.prioritySupport': 'Приоритетная поддержка',
    'level.specialBadges': 'Специальные значки профиля',
    'level.close': 'ЗАКРЫТЬ',

    // Footer
    'footer.stats': 'СТАТИСТИКА',
    'footer.casesOpened': 'Кейсов открыто',
    'footer.itemsWon': 'Предметов выиграно',
    'footer.activeUsers': 'Активных пользователей',
    'footer.social': 'СОЦИАЛЬНЫЕ СЕТИ',
    'footer.community': 'СООБЩЕСТВО',
    'footer.support': 'Поддержка',
    'footer.faq': 'FAQ',
    'footer.legal': 'ПРАВОВАЯ ИНФОРМАЦИЯ',
    'footer.privacyPolicy': 'ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ',
    'footer.termsRules': 'ПРАВИЛА И УСЛОВИЯ',
    'footer.fairPlay': 'Честная игра',
    'footer.responsible': 'Ответственная игра',
    'footer.copyright': '© 2024 CyberHub. Все права защищены.',

    // Privacy Policy Modal
    'privacy.title': 'ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ',
    'privacy.intro': 'В CyberHub мы серьезно относимся к вашей конфиденциальности. Эта политика описывает, как мы собираем, используем и защищаем вашу личную информацию.',
    'privacy.section1Title': '1. СОБИРАЕМАЯ ИНФОРМАЦИЯ',
    'privacy.section1Text': 'Мы собираем информацию, которую вы предоставляете нам напрямую, включая данные учетной записи, историю транзакций и настройки связи. Мы также автоматически собираем определенную информацию о вашем устройстве и взаимодействии с нашей платформой.',
    'privacy.section2Title': '2. КАК МЫ ИСПОЛЬЗУЕМ ИНФОРМАЦИЮ',
    'privacy.section2Text': 'Мы используем собранную информацию для предоставления, поддержки и улучшения наших услуг, обработки транзакций, отправки технических уведомлений и сообщений поддержки, а также для связи с вами о продуктах, услугах и событиях.',
    'privacy.section3Title': '3. ОБМЕН ИНФОРМАЦИЕЙ',
    'privacy.section3Text': 'Мы не продаем вашу личную информацию. Мы можем делиться информацией с поставщиками услуг, которые выполняют работу от нашего имени, когда это требуется законом, или для защиты наших прав и безопасности пользователей.',
    'privacy.section4Title': '4. БЕЗОПАСНОСТЬ ДАННЫХ',
    'privacy.section4Text': 'Мы применяем соответствующие технические и организационные меры для защиты вашей личной информации от несанкционированного доступа, изменения, раскрытия или уничтожения.',
    'privacy.section5Title': '5. ВАШИ ПРАВА',
    'privacy.section5Text': 'Вы имеете право получить доступ, обновить или удалить свою личную информацию. Вы также можете возразить против обработки, запросить переносимость данных и отозвать согласие в любое время.',
    'privacy.section6Title': '6. ФАЙЛЫ COOKIE',
    'privacy.section6Text': 'Мы используем файлы cookie и аналогичные технологии отслеживания для сбора информации о ваших действиях в браузере и персонализации вашего опыта.',
    'privacy.lastUpdated': 'Последнее обновление: Декабрь 2024',
    'privacy.contact': 'По вопросам о Политике конфиденциальности обращайтесь по адресу privacy@cyberhub.com',
    'privacy.close': 'ЗАКРЫТЬ',

    // Terms & Rules Modal
    'terms.title': 'ПРАВИЛА И УСЛОВИЯ',
    'terms.intro': 'Добро пожаловать в CyberHub. Используя нашу платформу, вы соглашаетесь с этими условиями. Пожалуйста, внимательно прочитайте их.',
    'terms.section1Title': '1. ТРЕБОВАНИЯ К УЧЕТНОЙ ЗАПИСИ',
    'terms.section1Text': 'Вам должно быть не менее 18 лет для использования CyberHub. Вы несете ответственность за безопасность своей учетной записи и за все действия, происходящие под вашей учетной записью.',
    'terms.section2Title': '2. ЗАПРЕЩЕННЫЕ ДЕЙСТВИЯ',
    'terms.section2Text': 'Вы не можете использовать CyberHub для незаконных целей, пытаться манипулировать результатами открытия кейсов, создавать несколько учетных записей для злоупотребления акциями или участвовать в мошенничестве.',
    'terms.section3Title': '3. ПРАВИЛА ОТКРЫТИЯ КЕЙСОВ',
    'terms.section3Text': 'Все результаты открытия кейсов определяются нашим доказуемо честным генератором случайных чисел. В каждом кейсе отображаются точные шансы для всех предметов. После открытия кейса транзакция является окончательной и не может быть отменена.',
    'terms.section4Title': '4. ВЫВОД И ПОЛУЧЕНИЕ',
    'terms.section4Text': 'Предметы можно получить на свой Steam-аккаунт через ссылку обмена. Время обработки может варьироваться. Мы оставляем за собой право проверить владение учетной записью и запросить дополнительную информацию для крупных получений.',
    'terms.section5Title': '5. ДЕПОЗИТЫ И БАЛАНС',
    'terms.section5Text': 'Все депозиты являются окончательными и не подлежат возврату. Ваш баланс может использоваться только внутри платформы. Мы не предлагаем вывод депозитных средств наличными.',
    'terms.section6Title': '6. ГАРАНТИЯ ЧЕСТНОЙ ИГРЫ',
    'terms.section6Text': 'CyberHub использует доказуемо честную технологию, чтобы гарантировать, что все открытия кейсов случайны и не могут быть манипулированы. Вы можете проверить честность каждого открытия с помощью нашей системы верификации.',
    'terms.section7Title': '7. ОТВЕТСТВЕННАЯ ИГРА',
    'terms.section7Text': 'Мы поддерживаем ответственную игру. Устанавливайте для себя лимиты и никогда не тратьте больше, чем можете позволить себе потерять. Если вам нужна помощь, обратитесь в нашу службу поддержки.',
    'terms.section8Title': '8. ИЗМЕНЕНИЯ',
    'terms.section8Text': 'Мы оставляем за собой право изменять эти условия в любое время. Продолжение использования платформы после изменений означает принятие новых условий.',
    'terms.lastUpdated': 'Последнее обновление: Декабрь 2024',
    'terms.contact': 'По вопросам об этих Условиях обращайтесь по адресу support@cyberhub.com',
    'terms.close': 'ЗАКРЫТЬ',

    // Settings Modal
    'settings.title': 'НАСТРОЙКИ',
    'settings.language': 'Language / Valoda / Язык',
    'settings.cancel': 'ОТМЕНА',
    'settings.save': 'СОХРАНИТЬ ИЗМЕНЕНИЯ',
    'settings.english': 'English',
    'settings.englishDesc': 'Английский язык',
    'settings.russian': 'Русский',
    'settings.russianDesc': 'Русский язык',
    'settings.latvian': 'Latviešu',
    'settings.latvianDesc': 'Латышский язык',

    // Login Modal
    'login.title': 'ТРЕБУЕТСЯ АВТОРИЗАЦИЯ',
    'login.subtitle': 'Войдите, чтобы разблокировать все функции',
    'login.username': 'Имя пользователя/Телефон',
    'login.password': 'Пароль',
    'login.usernamePlaceholder': 'Введите имя пользователя',
    'login.passwordPlaceholder': 'Введите пароль',
    'login.signIn': 'ВОЙТИ',
    'login.signingIn': 'ВХОД...',
    'login.benefits': 'С авторизацией вы можете:',
    'login.benefit1': 'Открывать кейсы и выигрывать призы',
    'login.benefit2': 'Получать предметы в инвентарь Steam',
    'login.benefit3': 'Отслеживать выигрыши и статистику',
    'login.benefit4': 'Участвовать в эксклюзивных акциях',
    'login.benefit5': 'Соревноваться с другими игроками',
    'login.note': 'Используйте учетные данные профиля клуба для входа',
    'login.needAuth': 'Войдите, чтобы {action}',
    'login.actionOpen': 'открывать кейсы',
    'login.actionClaim': 'получать предметы',
    'login.actionDeposit': 'пополнять баланс',
    'login.fillAllFields': 'Пожалуйста, заполните все поля',
    'login.loginSuccess': 'Вход успешен!',
    'login.loginFailed': 'Вход не удался. Проверьте свои учетные данные.',
  },

  lv: {
    // Top Bar
    'topbar.cases': 'KASTES',
    'topbar.inventory': 'INVENTĀRS',
    'topbar.deposit': 'PAPILDINĀT',
    'topbar.settings': 'IESTATĪJUMI',

    // Live Feed
    'livefeed.justWon': 'tikko uzvarēja',
    'livefeed.from': 'no',

    // Cases Page
    'cases.title': 'ATVĒRT KASTES',
    'cases.deposit': 'PAPILDINĀT',
    'cases.free': 'BEZMAKSAS',
    'cases.hot': 'POPULĀRS',
    'cases.new': 'JAUNS',
    'cases.seeContents': 'SKATĪT SATURU',
    'cases.openCase': 'ATVĒRT KASTI',
    'cases.addToOpen': 'PIEVIENOT {amount} $ LAI ATVĒRTU',

    // Case Content Page
    'caseContent.back': 'ATPAKAĻ',
    'caseContent.caseContents': 'KASTES SATURS',
    'caseContent.openCase': 'ATVĒRT KASTI',
    'caseContent.addToOpen': 'PIEVIENOT {amount} $ LAI ATVĒRTU',

    // Case Open Page
    'caseOpen.back': 'ATPAKAĻ',
    'caseOpen.caseContents': 'KASTES SATURS',
    'caseOpen.openCase': 'ATVĒRT KASTI',
    'caseOpen.opening': 'ATVĒRŠANA...',
    'caseOpen.addToOpen': 'PIEVIENOT {amount} $ LAI ATVĒRTU',

    // Win Page
    'win.youWon': 'JŪS UZVARĒJĀT',
    'win.viewInventory': 'SKATĪT INVENTĀRU',
    'win.openAnother': 'ATVĒRT VĒLREIZ',
    'win.totalValue': 'KOPĒJĀ VĒRTĪBA',
    'win.from': 'NO',

    // Inventory Page
    'inventory.title': 'MANS INVENTĀRS',
    'inventory.all': 'VISI',
    'inventory.money': 'NAUDA',
    'inventory.cs2Items': 'CS2 PRIEKŠMETI',
    'inventory.physical': 'FIZISKI',
    'inventory.available': 'PIEEJAMS',
    'inventory.processing': 'APSTRĀDĀ',
    'inventory.received': 'SAŅEMTS',
    'inventory.failed': 'NEIZDEVĀS',
    'inventory.noItems': 'Šajā kategorijā vēl nav priekšmetu',
    'inventory.startOpening': 'Sāciet atvērt kastes, lai piepildītu inventāru!',
    'inventory.browseCase': 'PĀRLŪKOT KASTES',
    'inventory.claim': 'PIEPRASĪT',
    'inventory.claimed': 'PIEPRASĪTS',
    'inventory.value': 'Vērtība',

    // Player Profile
    'profile.back': 'ATPAKAĻ',
    'profile.myProfile': 'MANS PROFILS',
    'profile.publicProfile': 'PUBLISKAIS PROFILS',
    'profile.memberSince': 'Dalībnieks kopš',
    'profile.totalWins': 'Kopējās uzvaras',
    'profile.totalValue': 'Kopējā vērtība',
    'profile.favoriteCase': 'Iecienītākā kaste',
    'profile.tradeLink': 'STEAM TIRDZNIECĪBAS SAITE',
    'profile.edit': 'Rediģēt',
    'profile.save': 'Saglabāt',
    'profile.level': 'LĪMENIS',
    'profile.xp': 'PIEREDZE',
    'profile.howLevelsWork': 'Kā darbojas līmeņi?',
    'profile.myInventory': 'MANS INVENTĀRS',
    'profile.viewAll': 'SKATĪT VISU',
    'profile.claim': 'PIEPRASĪT',
    'profile.claimRequests': 'PIEPRASĪJUMI',
    'profile.requestId': 'Pieprasījuma ID',
    'profile.item': 'Priekšmets',
    'profile.status': 'Statuss',
    'profile.timeLeft': 'Atlikušais laiks',
    'profile.cancel': 'Atcelt',
    'profile.pending': 'Gaida',
    'profile.winHistory': 'UZVARU VĒSTURE',
    'profile.case': 'Kaste',

    // Level Modal
    'level.title': 'KĀ DARBOJAS LĪMEŅI?',
    'level.intro': 'Paaugstiniet līmeni, atverot kastes un pabeidzot aktivitātes. Augstāki līmeņi atver ekskluzīvas balvas un priekšrocības!',
    'level.earnXpTitle': 'NOPELNIET PIEREDZI',
    'level.openingCases': 'Atverot kastes',
    'level.openingCasesDesc': 'Nopelniet pieredzi atkarībā no kastes vērtības',
    'level.dailyLogin': 'Ikdienas pieteikšanās',
    'level.dailyLoginDesc': 'Saņemiet bonusa pieredzi katru dienu',
    'level.achievements': 'Sasniegumi',
    'level.achievementsDesc': 'Pabeidziet īpašus izaicinājumus',
    'level.levelsTitle': 'LĪMEŅU PAKĀPES',
    'level.bronze': 'BRONZA',
    'level.bronzeDesc': 'Līmeņi 1-25: Pamata balvas',
    'level.silver': 'SUDRABS',
    'level.silverDesc': 'Līmeņi 26-50: Labākas iespējas',
    'level.gold': 'ZELTS',
    'level.goldDesc': 'Līmeņi 51-75: Ekskluzīvas kastes',
    'level.platinum': 'PLATĪNS',
    'level.platinumDesc': 'Līmeņi 76-100: VIP priekšrocības',
    'level.rewardsTitle': 'BALVAS',
    'level.bonusXp': 'Bonusa pieredzes reizinātājs',
    'level.exclusiveItems': 'Ekskluzīvi priekšmeti un kastes',
    'level.prioritySupport': 'Prioritāra klientu atbalsts',
    'level.specialBadges': 'Īpašas profila nozīmītes',
    'level.close': 'AIZVĒRT',

    // Footer
    'footer.stats': 'STATISTIKA',
    'footer.casesOpened': 'Atvērtas kastes',
    'footer.itemsWon': 'Iegūti priekšmeti',
    'footer.activeUsers': 'Aktīvi lietotāji',
    'footer.social': 'SOCIĀLIE TĪKLI',
    'footer.community': 'KOPIENA',
    'footer.support': 'Atbalsts',
    'footer.faq': 'BUJ',
    'footer.legal': 'JURIDISKĀ INFORMĀCIJA',
    'footer.privacyPolicy': 'PRIVĀTUMA POLITIKA',
    'footer.termsRules': 'NOTEIKUMI UN NOSACĪJUMI',
    'footer.fairPlay': 'Godīga spēle',
    'footer.responsible': 'Atbildīga spēle',
    'footer.copyright': '© 2024 CyberHub. Visas tiesības aizsargātas.',

    // Privacy Policy Modal
    'privacy.title': 'PRIVĀTUMA POLITIKA',
    'privacy.intro': 'CyberHub mēs nopietni uztveram jūsu privātumu. Šī politika izskaidro, kā mēs vācam, izmantojam un aizsargājam jūsu personisko informāciju.',
    'privacy.section1Title': '1. INFORMĀCIJA, KO MĒS VĀCAM',
    'privacy.section1Text': 'Mēs vācam informāciju, ko jūs mums sniedzat tieši, ieskaitot konta detaļas, darījumu vēsturi un saziņas preferences. Mēs arī automātiski vācam noteiktu informāciju par jūsu ierīci un to, kā jūs mijiedarbojaties ar mūsu platformu.',
    'privacy.section2Title': '2. KĀ MĒS IZMANTOJAM JŪSU INFORMĀCIJU',
    'privacy.section2Text': 'Mēs izmantojam savākto informāciju, lai nodrošinātu, uzturētu un uzlabotu mūsu pakalpojumus, apstrādātu darījumus, nosūtītu tehniskos paziņojumus un atbalsta ziņojumus, kā arī sazinātos ar jums par produktiem, pakalpojumiem un notikumiem.',
    'privacy.section3Title': '3. INFORMĀCIJAS KOPĪGOŠANA',
    'privacy.section3Text': 'Mēs nepārdodam jūsu personisko informāciju. Mēs varam kopīgot jūsu informāciju ar pakalpojumu sniedzējiem, kas veic pakalpojumus mūsu vārdā, kad to prasa likums, vai lai aizsargātu mūsu tiesības un lietotāju drošību.',
    'privacy.section4Title': '4. DATU DROŠĪBA',
    'privacy.section4Text': 'Mēs īstenojam atbilstošus tehniskos un organizatoriskos pasākumus, lai aizsargātu jūsu personisko informāciju no nesankcionētas piekļuves, izmaiņām, izpaušanas vai iznīcināšanas.',
    'privacy.section5Title': '5. JŪSU TIESĪBAS',
    'privacy.section5Text': 'Jums ir tiesības piekļūt, atjaunināt vai dzēst savu personisko informāciju. Jūs varat arī iebilst pret apstrādi, pieprasīt datu pārnesamību un jebkurā laikā atsaukt piekrišanu.',
    'privacy.section6Title': '6. SĪKDATNES',
    'privacy.section6Text': 'Mēs izmantojam sīkdatnes un līdzīgas izsekošanas tehnoloģijas, lai vāktu informāciju par jūsu pārlūkošanas darbībām un personalizētu jūsu pieredzi.',
    'privacy.lastUpdated': 'Pēdējā atjaunināšana: 2024. gada decembris',
    'privacy.contact': 'Jautājumi par šo Privātuma politiku, lūdzu, sazinieties ar mums privacy@cyberhub.com',
    'privacy.close': 'AIZVĒRT',

    // Terms & Rules Modal
    'terms.title': 'NOTEIKUMI UN NOSACĪJUMI',
    'terms.intro': 'Laipni lūdzam CyberHub. Izmantojot mūsu platformu, jūs piekrītat šiem noteikumiem un nosacījumiem. Lūdzu, rūpīgi izlasiet tos.',
    'terms.section1Title': '1. KONTA PRASĪBAS',
    'terms.section1Text': 'Jums jābūt vismaz 18 gadus vecam, lai izmantotu CyberHub. Jūs esat atbildīgs par sava konta drošību un par visām darbībām, kas notiek jūsu kontā.',
    'terms.section2Title': '2. AIZLIEGTĀS DARBĪBAS',
    'terms.section2Text': 'Jūs nevarat izmantot CyberHub nelikumīgiem mērķiem, mēģināt manipulēt ar kastu rezultātiem, izveidot vairākus kontus, lai ļaunprātīgi izmantotu akcijas, vai piedalīties krāpniecībā.',
    'terms.section3Title': '3. KASTU ATVĒRŠANAS NOTEIKUMI',
    'terms.section3Text': 'Visi kastu rezultāti tiek noteikti ar mūsu pierādāmi godīgo nejaušo skaitļu ģeneratoru. Katrā kastē ir norādītas precīzas izredzes visiem priekšmetiem. Kad kaste ir atvērta, darījums ir galīgs un nevar tikt atcelts.',
    'terms.section4Title': '4. IZŅEMŠANA UN PIEPRASĪJUMI',
    'terms.section4Text': 'Priekšmetus var pieprasīt uz savu Steam kontu, izmantojot tirdzniecības saiti. Apstrādes laiks var atšķirties. Mēs paturam tiesības pārbaudīt konta īpašumtiesības un pieprasīt papildu informāciju lieliem pieprasījumiem.',
    'terms.section5Title': '5. DEPOZĪTI UN BILANCE',
    'terms.section5Text': 'Visi depozīti ir galīgi un neatmaksājami. Jūsu bilanci var izmantot tikai platformā. Mēs nepiedāvājam depozīta līdzekļu skaidras naudas izņemšanu.',
    'terms.section6Title': '6. GODĪGAS SPĒLES GARANTIJA',
    'terms.section6Text': 'CyberHub izmanto pierādāmi godīgu tehnoloģiju, lai nodrošinātu, ka visas kastu atvēršanas ir nejaušas un nevar tikt manipulētas. Jūs varat pārbaudīt katras atvēršanas godīgumu, izmantojot mūsu verifikācijas sistēmu.',
    'terms.section7Title': '7. ATBILDĪGA SPĒLE',
    'terms.section7Text': 'Mēs veicinām atbildīgu spēli. Iestatiet sev limitus un nekad netērējiet vairāk, nekā varat atļauties zaudēt. Ja jums nepieciešama palīdzība, lūdzu, sazinieties ar mūsu atbalsta komandu.',
    'terms.section8Title': '8. IZMAIŅAS',
    'terms.section8Text': 'Mēs paturam tiesības jebkurā laikā mainīt šos noteikumus. Turpinot izmantot platformu pēc izmaiņām, jūs piekrītat jaunajiem noteikumiem.',
    'terms.lastUpdated': 'Pēdējā atjaunināšana: 2024. gada decembris',
    'terms.contact': 'Jautājumi par šiem Noteikumiem, lūdzu, sazinieties ar mums support@cyberhub.com',
    'terms.close': 'AIZVĒRT',

    // Settings Modal
    'settings.title': 'IESTATĪJUMI',
    'settings.language': 'Language / Valoda / Язык',
    'settings.cancel': 'ATCELT',
    'settings.save': 'SAGLABĀT IZMAIŅAS',
    'settings.english': 'English',
    'settings.englishDesc': 'Angļu valoda',
    'settings.russian': 'Русский',
    'settings.russianDesc': 'Krievu valoda',
    'settings.latvian': 'Latviešu',
    'settings.latvianDesc': 'Latviešu valoda',

    // Login Modal
    'login.title': 'NEPIECIEŠAMA AUTORIZĀCIJA',
    'login.subtitle': 'Piesakieties, lai atbloķētu visas funkcijas',
    'login.username': 'Lietotājvārds/Telefons',
    'login.password': 'Parole',
    'login.usernamePlaceholder': 'Ievadiet lietotājvārdu',
    'login.passwordPlaceholder': 'Ievadiet paroli',
    'login.signIn': 'PIETEIKTIES',
    'login.signingIn': 'PIESAKĀS...',
    'login.benefits': 'Ar autorizāciju jūs varat:',
    'login.benefit1': 'Atvērt kastes un laimēt balvas',
    'login.benefit2': 'Saņemt priekšmetus Steam inventārā',
    'login.benefit3': 'Sekot līdzi laimestiem un statistikai',
    'login.benefit4': 'Piedalīties ekskluzīvās akcijās',
    'login.benefit5': 'Sacensties ar citiem spēlētājiem',
    'login.note': 'Izmantojiet savu kluba profila akreditācijas datus, lai piesakieties',
    'login.needAuth': 'Lūdzu, piesakieties, lai {action}',
    'login.actionOpen': 'atvērtu kastes',
    'login.actionClaim': 'saņemtu priekšmetus',
    'login.actionDeposit': 'papildinātu bilanci',
    'login.fillAllFields': 'Lūdzu, aizpildiet visus laukus',
    'login.loginSuccess': 'Pieteikšanās veiksmīga!',
    'login.loginFailed': 'Pieteikšanās neveiksmīga. Lūdzu, pārbaudiet savus akreditācijas dati.',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[language][key] || translations['en'][key] || key;
    
    // Replace parameters like {amount}
    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}