import { IISKILLS_ALLOWED_COURSES } from '../../lib/courses';

export async function getServerSideProps({ query }) {
  const destination =
    query.course && IISKILLS_ALLOWED_COURSES.includes(query.course)
      ? `/payments/iiskills?course=${encodeURIComponent(query.course)}`
      : '/payments/iiskills';

  return {
    redirect: {
      destination,
      permanent: false,
    },
  };
}

export default function PaymentsIndex() {
  return null;
}
