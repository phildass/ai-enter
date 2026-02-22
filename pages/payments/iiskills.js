import SegmentPaymentPage from '../../components/SegmentPaymentPage';

export default function IisSkillsPay() {
  return (
    <SegmentPaymentPage
      segmentKey="iiskills"
      brandName="IIS Skills"
      emoji="🎓"
      bgGradient="linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)"
      iconBg="#ede9fe"
      titleColor="#4c1d95"
      accentGradient="linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)"
      accentColor="#7c3aed"
      accentDisabled="#c4b5fd"
      validityText="1 Year"
      validityLabel="1-Year Access"
      features={[
        'Access to all learning apps',
        'Professional & skill courses',
        'Progress tracking',
        'No recurring fees',
      ]}
      originDomain="iiskills.cloud"
      description="1-Year Access - IIS Skills Learning"
    />
  );
}
