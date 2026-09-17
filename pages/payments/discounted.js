/**
 * Instagram / YouTube follower discount is retired.
 * Appmall /pay is the only public checkout (festival Rs 116 through 30 Sep).
 */
export async function getServerSideProps() {
  return {
    redirect: {
      destination: 'https://appmall.in/pay',
      permanent: false,
    },
  };
}

export default function AppMallDiscountedPaymentsPage() {
  return null;
}
