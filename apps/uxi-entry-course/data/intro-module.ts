export interface QuizOption {
  id: string
  text: string
}

export interface Quiz {
  question: string
  options: QuizOption[]
  correctId: string
  explanation: string
}

export interface KeyConcept {
  term: string
  definition: string
}

export interface ComparisonItem {
  label: string
  ux: string
  ui: string
}

export interface Lesson {
  id: string
  title: string
  subtitle: string
  duration: string
  sections: Section[]
  quiz: Quiz[]
}

export type Section =
  | { type: 'text'; content: string }
  | { type: 'heading'; content: string }
  | { type: 'key-concepts'; concepts: KeyConcept[] }
  | { type: 'comparison'; title: string; items: ComparisonItem[] }
  | { type: 'timeline'; events: { year: string; title: string; description: string }[] }
  | { type: 'callout'; variant: 'tip' | 'warning' | 'example'; content: string }
  | { type: 'image-placeholder'; alt: string; caption: string }

export const introModule = {
  id: 'intro',
  title: 'Введение в UX/UI',
  description: 'Что такое UX и UI, зачем это нужно, история дизайна интерфейсов',
  icon: 'BookOpen',
  lessons: [
    {
      id: '1-what-is-ux-ui',
      title: 'Что такое UX и UI',
      subtitle: 'Разбираемся в ключевых понятиях и чем они отличаются',
      duration: '15 мин',
      sections: [
        {
          type: 'heading' as const,
          content: 'UX — User Experience',
        },
        {
          type: 'text' as const,
          content:
            'UX (User Experience) — это общее впечатление пользователя от взаимодействия с продуктом. Это не только про интерфейс — это про весь путь: от первого знакомства до ежедневного использования. UX отвечает на вопрос: «Удобно ли пользователю достигать своей цели?»',
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            'Представьте дверь в магазине. Если вы толкаете её, но она открывается на себя — это плохой UX. Дизайн ручки подсказывал неправильное действие.',
        },
        {
          type: 'heading' as const,
          content: 'UI — User Interface',
        },
        {
          type: 'text' as const,
          content:
            'UI (User Interface) — это визуальная часть продукта: кнопки, цвета, шрифты, иконки, отступы. UI отвечает на вопрос: «Красиво ли выглядит продукт и понятна ли визуальная иерархия?»',
        },
        {
          type: 'comparison' as const,
          title: 'UX vs UI — в чём разница?',
          items: [
            { label: 'Фокус', ux: 'Опыт и ощущения', ui: 'Внешний вид и стиль' },
            { label: 'Вопрос', ux: 'Удобно ли это?', ui: 'Красиво ли это?' },
            { label: 'Аналогия', ux: 'Планировка дома', ui: 'Отделка и декор' },
            { label: 'Инструменты', ux: 'Исследования, тесты, карты пути', ui: 'Figma, цвета, типографика' },
            { label: 'Результат', ux: 'User flow, wireframes', ui: 'Mockups, дизайн-система' },
          ],
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            { term: 'Usability', definition: 'Насколько легко пользователь может выполнить задачу' },
            { term: 'Accessibility', definition: 'Доступность продукта для людей с ограниченными возможностями' },
            { term: 'Information Architecture', definition: 'Структура и организация контента в продукте' },
            { term: 'Visual Hierarchy', definition: 'Порядок, в котором глаз воспринимает элементы на экране' },
          ],
        },
      ],
      quiz: [
        {
          question: 'Что описывает UX?',
          options: [
            { id: 'a', text: 'Цвета и шрифты интерфейса' },
            { id: 'b', text: 'Общий опыт взаимодействия пользователя с продуктом' },
            { id: 'c', text: 'Код, на котором написано приложение' },
            { id: 'd', text: 'Маркетинговую стратегию продукта' },
          ],
          correctId: 'b',
          explanation: 'UX — это весь опыт пользователя, включая удобство, эмоции и эффективность взаимодействия с продуктом.',
        },
        {
          question: 'Какая аналогия лучше всего описывает разницу UX и UI?',
          options: [
            { id: 'a', text: 'UX — это рецепт, UI — это ингредиенты' },
            { id: 'b', text: 'UX — это планировка дома, UI — это отделка и декор' },
            { id: 'c', text: 'UX — это рама картины, UI — это сама картина' },
            { id: 'd', text: 'UX — это мотор, UI — это руль' },
          ],
          correctId: 'b',
          explanation: 'UX определяет структуру и логику (как в планировке), а UI — визуальное оформление (как в отделке).',
        },
      ],
    },
    {
      id: '2-why-ux-matters',
      title: 'Зачем нужен UX/UI дизайн',
      subtitle: 'Бизнес-ценность дизайна и цена плохого UX',
      duration: '12 мин',
      sections: [
        {
          type: 'heading' as const,
          content: 'Дизайн = деньги',
        },
        {
          type: 'text' as const,
          content:
            'Каждый доллар, вложенный в UX, приносит от $2 до $100 возврата (по данным Forrester Research). Хороший UX снижает стоимость поддержки, увеличивает конверсию и удерживает пользователей.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'Amazon увеличил выручку на $300 млн в год, просто изменив одну кнопку в процессе оформления заказа (убрали обязательную регистрацию).',
        },
        {
          type: 'heading' as const,
          content: 'Что бывает без UX',
        },
        {
          type: 'text' as const,
          content:
            'Без продуманного UX пользователи сталкиваются с путаницей, ошибками и фрустрацией. 88% пользователей не возвращаются на сайт после плохого опыта. Стоимость исправления ошибки после релиза в 100 раз выше, чем на этапе дизайна.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            { term: 'Конверсия', definition: 'Процент пользователей, совершивших целевое действие (покупка, регистрация)' },
            { term: 'Retention', definition: 'Показатель возвращаемости пользователей к продукту' },
            { term: 'Bounce Rate', definition: 'Процент пользователей, покинувших сайт после просмотра одной страницы' },
            { term: 'Time on Task', definition: 'Время, которое пользователь тратит на выполнение задачи' },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            'Google однажды предложил пользователям 30 результатов поиска вместо 10. Казалось бы — больше результатов, лучше! Но время загрузки увеличилось на 0.5 секунды, и трафик упал на 20%.',
        },
        {
          type: 'heading' as const,
          content: '5 причин инвестировать в UX',
        },
        {
          type: 'text' as const,
          content:
            '1. **Снижение затрат на разработку** — исправлять на этапе дизайна в 10-100 раз дешевле, чем после релиза.\n2. **Повышение конверсии** — понятный интерфейс ведёт к целевому действию.\n3. **Удержание пользователей** — хороший опыт возвращает людей.\n4. **Снижение нагрузки на поддержку** — интуитивный дизайн = меньше вопросов.\n5. **Конкурентное преимущество** — при равном функционале выигрывает тот, кто удобнее.',
        },
      ],
      quiz: [
        {
          question: 'Сколько пользователей не возвращаются после плохого UX?',
          options: [
            { id: 'a', text: '25%' },
            { id: 'b', text: '50%' },
            { id: 'c', text: '88%' },
            { id: 'd', text: '100%' },
          ],
          correctId: 'c',
          explanation: 'По статистике, 88% пользователей не вернутся на сайт после негативного опыта.',
        },
        {
          question: 'Во сколько раз дороже исправить ошибку после релиза по сравнению с этапом дизайна?',
          options: [
            { id: 'a', text: 'В 2 раза' },
            { id: 'b', text: 'В 10 раз' },
            { id: 'c', text: 'В 50 раз' },
            { id: 'd', text: 'В 100 раз' },
          ],
          correctId: 'd',
          explanation: 'Стоимость исправления ошибки растёт экспоненциально — на этапе дизайна это самый дешёвый момент.',
        },
      ],
    },
    {
      id: '3-history',
      title: 'История дизайна интерфейсов',
      subtitle: 'От перфокарт до мобильных приложений',
      duration: '18 мин',
      sections: [
        {
          type: 'text' as const,
          content:
            'Дизайн интерфейсов прошёл путь от командной строки до голосовых ассистентов. Каждая эпоха решала одну задачу: сделать технологию доступнее для людей.',
        },
        {
          type: 'timeline' as const,
          events: [
            {
              year: '1960-е',
              title: 'Командная строка (CLI)',
              description: 'Единственный способ общения с компьютером — текстовые команды. Пользователь должен был знать точный синтаксис.',
            },
            {
              year: '1973',
              title: 'Xerox Alto — первый GUI',
              description: 'Xerox PARC создал первый компьютер с графическим интерфейсом: окна, иконки, курсор мыши.',
            },
            {
              year: '1984',
              title: 'Apple Macintosh',
              description: 'Стив Джобс вдохновился Xerox Alto и выпустил Macintosh — первый массовый компьютер с GUI. Дизайн стал доступен миллионам.',
            },
            {
              year: '1990-е',
              title: 'Web 1.0 — эпоха таблиц',
              description: 'Первые веб-сайты: текст, гиперссылки, минимум графики. Дизайн делали в таблицах HTML.',
            },
            {
              year: '2007',
              title: 'iPhone — мобильная революция',
              description: 'Мультитач, жесты, адаптивный дизайн. Skeuomorphism — интерфейсы имитировали реальные объекты.',
            },
            {
              year: '2013',
              title: 'Flat Design & Material Design',
              description: 'Apple iOS 7 и Google Material Design — переход к плоскому, минималистичному дизайну.',
            },
            {
              year: '2020+',
              title: 'AI, Voice UI, AR/VR',
              description: 'Голосовые интерфейсы, AI-ассистенты, дополненная реальность. Интерфейс становится невидимым.',
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'Заметьте тренд: с каждой эпохой интерфейс становится менее техническим и более человечным. Дизайн движется от «человек приспосабливается к машине» к «машина приспосабливается к человеку».',
        },
        {
          type: 'heading' as const,
          content: 'Ключевые фигуры',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            { term: 'Дон Норман', definition: 'Ввёл термин "User Experience" в 1993 году, работая в Apple. Автор книги "Дизайн привычных вещей".' },
            { term: 'Якоб Нильсен', definition: 'Создатель 10 эвристик юзабилити — базовых правил оценки интерфейсов.' },
            { term: 'Стив Джобс', definition: 'Сделал дизайн центральной ценностью продукта, а не украшением.' },
            { term: 'Дитер Рамс', definition: '10 принципов хорошего дизайна — «Хороший дизайн — это как можно меньше дизайна».' },
          ],
        },
      ],
      quiz: [
        {
          question: 'Какой компьютер считается первым с графическим интерфейсом?',
          options: [
            { id: 'a', text: 'Apple Macintosh (1984)' },
            { id: 'b', text: 'Xerox Alto (1973)' },
            { id: 'c', text: 'IBM PC (1981)' },
            { id: 'd', text: 'Commodore 64 (1982)' },
          ],
          correctId: 'b',
          explanation: 'Xerox Alto (1973) — первый компьютер с GUI. Apple Macintosh популяризировал эту идею позже.',
        },
        {
          question: 'Кто ввёл термин "User Experience"?',
          options: [
            { id: 'a', text: 'Стив Джобс' },
            { id: 'b', text: 'Якоб Нильсен' },
            { id: 'c', text: 'Дон Норман' },
            { id: 'd', text: 'Дитер Рамс' },
          ],
          correctId: 'c',
          explanation: 'Дон Норман ввёл термин UX в 1993 году, работая в Apple.',
        },
      ],
    },
    {
      id: '4-roles',
      title: 'Роли в UX/UI команде',
      subtitle: 'Кто чем занимается и как они работают вместе',
      duration: '10 мин',
      sections: [
        {
          type: 'text' as const,
          content:
            'В современных продуктовых командах UX/UI — это не один человек. Это несколько специалистов с разными фокусами, которые работают вместе над общей целью.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'UX Researcher',
              definition: 'Исследует пользователей: проводит интервью, тесты, анализирует данные. Отвечает на вопрос «Кто наш пользователь и чего он хочет?»',
            },
            {
              term: 'UX Designer',
              definition: 'Проектирует логику взаимодействия: user flows, wireframes, информационную архитектуру. Отвечает за «Как это работает?»',
            },
            {
              term: 'UI Designer',
              definition: 'Создаёт визуальный язык: цвета, типографику, иконки, компоненты. Отвечает за «Как это выглядит?»',
            },
            {
              term: 'Product Designer',
              definition: 'Совмещает UX и UI, работает на стыке бизнеса и пользователя. Универсальная роль в стартапах.',
            },
            {
              term: 'Design System Lead',
              definition: 'Создаёт и поддерживает дизайн-систему — библиотеку переиспользуемых компонентов для всей команды.',
            },
            {
              term: 'UX Writer',
              definition: 'Пишет тексты интерфейса: кнопки, ошибки, подсказки. Микрокопирайтинг влияет на UX больше, чем кажется.',
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'В маленьких командах и стартапах один Product Designer часто совмещает все роли. В крупных компаниях (Google, Apple) каждая роль — отдельный специалист.',
        },
        {
          type: 'heading' as const,
          content: 'Как устроен рабочий процесс',
        },
        {
          type: 'text' as const,
          content:
            '**Типичный цикл продуктового дизайна:**\n\n1. **Discover** — UX Researcher изучает пользователей и находит проблемы\n2. **Define** — UX Designer формулирует задачу и создаёт user flows\n3. **Design** — UI Designer создаёт визуальное решение\n4. **Deliver** — Команда передаёт дизайн в разработку\n5. **Measure** — Анализ метрик, A/B тесты, итерации\n\nЭтот процесс называется **Double Diamond** — сначала расширяем понимание проблемы, затем сужаем до конкретного решения.',
        },
      ],
      quiz: [
        {
          question: 'Какая роль отвечает за исследования пользователей?',
          options: [
            { id: 'a', text: 'UI Designer' },
            { id: 'b', text: 'UX Researcher' },
            { id: 'c', text: 'UX Writer' },
            { id: 'd', text: 'Product Manager' },
          ],
          correctId: 'b',
          explanation: 'UX Researcher проводит интервью, юзабилити-тесты и анализирует данные о пользователях.',
        },
        {
          question: 'Что такое Double Diamond?',
          options: [
            { id: 'a', text: 'Метод анимации интерфейсов' },
            { id: 'b', text: 'Процесс дизайна: расширение понимания проблемы → сужение до решения' },
            { id: 'c', text: 'Способ организации дизайн-системы' },
            { id: 'd', text: 'Техника A/B тестирования' },
          ],
          correctId: 'b',
          explanation: 'Double Diamond — модель дизайн-процесса из двух фаз: Discover+Define (проблема) и Design+Deliver (решение).',
        },
      ],
    },
  ] satisfies Lesson[],
}
