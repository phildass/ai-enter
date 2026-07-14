export async function getServerSideProps() {
  return {
    redirect: {
      destination: 'https://appmall.in',
      permanent: false,
    },
  };
}

export default function Payments() {
  return null;
}
