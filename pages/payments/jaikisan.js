import SegmentPaymentPage from '../../components/SegmentPaymentPage';

export default function JaiKisanPay() {
  return (
    <SegmentPaymentPage
      segmentKey="jai-kisan"
      brandName="Jai Kisan"
      emoji="🌾"
      bgGradient="linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)"
      iconBg="#dcfce7"
      titleColor="#14532d"
      accentGradient="linear-gradient(135deg, #16a34a 0%, #15803d 100%)"
      accentColor="#16a34a"
      accentDisabled="#86efac"
      validityText="1 Month"
      validityLabel="1-Month Access"
      features={[
        'Daily weather & market prices',
        'Expert agricultural advice',
        'Community support',
        'No recurring fees',
      ]}
      originDomain="jaikisan.cloud"
      description="1-Month Access - Agricultural Support"
    />
  );
}
