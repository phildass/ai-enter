export async function getServerSideProps() {
  return {
    redirect: {
      destination: 'https://iiskills.in',
      permanent: false,
    },
  };
}

export default function Payments() {
  return null;
}
