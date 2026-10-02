/**
 * Instagram / YouTube follower discount is retired.
 * Appmall /pay is the only public checkout (Rs 120.50 limited period).
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
