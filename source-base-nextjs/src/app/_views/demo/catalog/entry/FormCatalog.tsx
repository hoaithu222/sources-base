import { useTranslations } from 'next-intl';

import { CATALOG_SLOT_CLASSES } from '../catalog.theme';
import CatalogSection from '../CatalogSection';
import CatalogState from '../CatalogState';
import { FORM_STATE_ORDER } from '../data/catalog-sample.constants';
import FormStateExample from './FormStateExample';

/**
 * FormCatalog — mục "Form và ô nhập" của catalog `/demo`: cùng một form (TextField · PasswordField · NumberField · FormActions)
 * ở bốn trạng thái cạnh nhau — bình thường, có lỗi, chỉ đọc, vô hiệu hoá.
 */
export default function FormCatalog() {
  const t = useTranslations('demo.form');

  return (
    <CatalogSection id="form">
      <div className={CATALOG_SLOT_CLASSES.grid}>
        {FORM_STATE_ORDER.map((state) => (
          <CatalogState key={state} label={t(`states.${state}`)}>
            <FormStateExample state={state} />
          </CatalogState>
        ))}
      </div>
    </CatalogSection>
  );
}
