/**
 * Correct spelling of the owner path /payments/foriegn.
 * Preserve query so a signed token still works.
 */
function queryString(query) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query || {})) {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item != null && item !== '') params.append(key, String(item));
      });
    } else if (value != null && value !== '') {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function getServerSideProps({ query }) {
  return {
    redirect: {
      destination: `/payments/foriegn${queryString(query)}`,
      permanent: false,
    },
  };
}

export default function ForeignSpellingRedirect() {
  return null;
}
