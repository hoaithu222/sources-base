import { useTranslations } from 'next-intl';

const ABOUT_PRINCIPLES = ['clarity', 'performance', 'access'] as const;

const ABOUT_CLASSES = {
  root: 'mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-14 sm:px-6',
  title: 'text-h2-bold tracking-tight text-fg-heading',
  intro: 'text-body-18 text-fg-muted',
  section: 'flex flex-col gap-3',
  sectionTitle: 'text-h4-bold text-fg-heading',
  body: 'text-body-16 text-fg-body',
  list: 'flex list-disc flex-col gap-2 pl-5 text-body-16 text-fg-body marker:text-link',
};

/**
 * AboutView — nội dung trang giới thiệu (`/about`): `<h1>` + đoạn mở + hai mục. Server Component; chữ ở
 * `messages/<locale>/about.json`. Mẫu cho trang nội dung tĩnh: thêm trang mới thì sao chép file này + `page.tsx`.
 */
export default function AboutView() {
  const t = useTranslations('about');

  return (
    <article className={ABOUT_CLASSES.root}>
      <header className="flex flex-col gap-3">
        <h1 className={ABOUT_CLASSES.title}>{t('title')}</h1>
        <p className={ABOUT_CLASSES.intro}>{t('intro')}</p>
      </header>

      <section className={ABOUT_CLASSES.section}>
        <h2 className={ABOUT_CLASSES.sectionTitle}>{t('sections.mission.title')}</h2>
        <p className={ABOUT_CLASSES.body}>{t('sections.mission.body')}</p>
      </section>

      <section className={ABOUT_CLASSES.section}>
        <h2 className={ABOUT_CLASSES.sectionTitle}>{t('sections.principles.title')}</h2>
        <ul className={ABOUT_CLASSES.list}>
          {ABOUT_PRINCIPLES.map((id) => (
            <li key={id}>{t(`sections.principles.items.${id}`)}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}
