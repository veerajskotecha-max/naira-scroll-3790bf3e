import Footer from "@/components/Footer";

const sections = [
  {
    title: "Introduction",
    content: (
      <>
        <p>By accessing or using the NAIRA website, you agree to comply with and be bound by these Terms & Conditions. These terms apply to all visitors, users, and customers of the website.</p>
        <p>These terms govern:</p>
        <ul>
          <li>Browsing the website</li>
          <li>Creating an account</li>
          <li>Placing orders</li>
          <li>Using any services provided by NAIRA</li>
        </ul>
        <p>Please read these terms carefully before using the website. If you do not agree with any part of these terms, you should discontinue use of the website immediately.</p>
      </>
    ),
  },
  {
    title: "Eligibility",
    content: (
      <>
        <p>You must be at least 18 years of age to make purchases on the NAIRA website.</p>
        <p>If you are under 18, a parent or legal guardian must use the service on your behalf and assumes full responsibility for all purchases and account activity.</p>
        <p>NAIRA reserves the right to remove any information if it discovers that personal data has been submitted by a minor without appropriate parental consent.</p>
      </>
    ),
  },
  {
    title: "Use of the Website",
    content: (
      <>
        <p>You agree to use the NAIRA website in compliance with all applicable laws and regulations. You must not:</p>
        <ul>
          <li>Misuse the website or its services</li>
          <li>Attempt unauthorised access to any systems or networks</li>
          <li>Distribute malicious software or harmful content</li>
          <li>Interfere with the proper functioning of the website</li>
        </ul>
        <p>NAIRA reserves the right to restrict or terminate access to the website if any misuse is detected.</p>
      </>
    ),
  },
  {
    title: "Intellectual Property",
    content: (
      <>
        <p>All content on the NAIRA website is the intellectual property of NAIRA and is protected under applicable laws. This includes:</p>
        <ul>
          <li>Garment designs and product imagery</li>
          <li>Logos, branding, and trademarks</li>
          <li>Website graphics and visual elements</li>
          <li>Text, copy, and design elements</li>
        </ul>
        <p>You may not reproduce, distribute, copy, or otherwise exploit any materials from this website without prior written permission from NAIRA.</p>
      </>
    ),
  },
  {
    title: "Orders & Billing",
    content: (
      <>
        <p>When placing an order through the NAIRA website:</p>
        <ul>
          <li>You agree to provide accurate and complete billing and shipping information</li>
          <li>All orders are subject to acceptance and product availability</li>
          <li>NAIRA reserves the right to cancel or refuse any order if necessary</li>
        </ul>
        <p>Shipping, returns, and exchanges are governed by the respective policies listed on the website. Please review these policies before placing an order.</p>
      </>
    ),
  },
  {
    title: "Payments",
    content: (
      <>
        <p>All payments must be made through approved payment methods available on the website. NAIRA may use secure third-party payment processors to handle transactions.</p>
        <p>You are responsible for ensuring that all payment information provided is accurate and that you are authorised to use the chosen payment method.</p>
      </>
    ),
  },
  {
    title: "Termination of Service",
    content: (
      <>
        <p>NAIRA may suspend or terminate your access to the website or its services if you:</p>
        <ul>
          <li>Violate any of these Terms & Conditions</li>
          <li>Misuse the platform or its features</li>
          <li>Attempt any fraudulent or deceptive activity</li>
        </ul>
        <p>Termination may occur without prior notice if deemed necessary to protect NAIRA, its customers, or its services.</p>
      </>
    ),
  },
  {
    title: "Limitation of Liability",
    content: (
      <>
        <p>NAIRA shall not be held liable for:</p>
        <ul>
          <li>Temporary website interruptions or downtime</li>
          <li>Technical errors or system failures</li>
          <li>Any damages resulting from misuse of the website</li>
        </ul>
        <p>You acknowledge that you access and use the website at your own discretion and risk.</p>
      </>
    ),
  },
  {
    title: "Governing Law",
    content: (
      <p>These Terms & Conditions are governed by and construed in accordance with the laws of India. Any disputes arising from the use of the NAIRA website shall be subject to the exclusive jurisdiction of the appropriate courts in India.</p>
    ),
  },
  {
    title: "Contact Information",
    content: (
      <>
        <p>If you have any questions regarding these Terms & Conditions, please contact us at:</p>
        <p style={{ marginTop: "12px" }}>
          <strong>Email:</strong>{" "}
          <a
            href="mailto:support@naira.com"
            className="underline underline-offset-4 transition-opacity duration-200 hover:opacity-70"
          >
            support@naira.com
          </a>
        </p>
      </>
    ),
  },
];

const TermsOfService = () => {
  return (
    <>
      <section
        className="w-full flex flex-col items-center justify-center text-center"
        style={{
          paddingTop: "clamp(100px, 12vw, 160px)",
          paddingBottom: "clamp(48px, 6vw, 80px)",
          backgroundColor: "#F4F1ED",
        }}
      >
        <h1
          className="font-cormorant font-semibold tracking-[0.04em]"
          style={{ fontSize: "clamp(32px, 4vw, 48px)", color: "hsl(0 0% 12%)" }}
        >
          Terms & Conditions
        </h1>
        <p
          className="font-cormorant mt-4 max-w-[520px] mx-auto px-6 leading-relaxed"
          style={{ fontSize: "clamp(15px, 1.4vw, 17px)", color: "hsl(0 0% 40%)" }}
        >
          These terms govern the use of the NAIRA website and services, including purchasing products and interacting with our platform.
        </p>
      </section>

      <section
        className="w-full"
        style={{
          paddingTop: "clamp(48px, 6vw, 80px)",
          paddingBottom: "clamp(60px, 8vw, 120px)",
        }}
      >
        <div className="max-w-[760px] mx-auto px-6">
          {sections.map((section, i) => (
            <div
              key={section.title}
              style={{
                paddingBottom: i < sections.length - 1 ? "clamp(32px, 4vw, 48px)" : 0,
                marginBottom: i < sections.length - 1 ? "clamp(32px, 4vw, 48px)" : 0,
                borderBottom: i < sections.length - 1 ? "1px solid hsl(0 0% 88%)" : "none",
              }}
            >
              <h2
                className="font-cormorant font-semibold tracking-[0.02em]"
                style={{ fontSize: "clamp(20px, 2.2vw, 26px)", color: "hsl(0 0% 12%)", marginBottom: "16px" }}
              >
                {section.title}
              </h2>
              <div
                className="font-cormorant leading-[1.8] space-y-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:leading-[1.7]"
                style={{ fontSize: "clamp(14px, 1.2vw, 16px)", color: "hsl(0 0% 30%)" }}
              >
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default TermsOfService;
