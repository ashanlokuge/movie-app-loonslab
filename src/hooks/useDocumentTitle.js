import { useEffect } from 'react';

const APP_NAME = 'Movie Explorer';

/** Sets the browser tab title, e.g. "Inception · Movie Explorer". */
export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title]);
}
