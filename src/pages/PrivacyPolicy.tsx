import Footer from "@/components/Footer";

const sections = [
  {
    title: "Introduction",
    content: (
      <>
        <p>At NAIRA, we deeply respect the privacy of every visitor and customer. This Privacy Policy outlines how we collect, use, and protect your personal information when you interact with our website.</p>
        <p>We are committed to safeguarding your data and ensuring transparency in all our practices. If you have any questions about this policy, please do not hesitate to reach out to our support team.</p>
      </>
    ),
  },
  {
    title: "Information We Collect",
    content: (
      <>
        <p>We may collect the following types of personal information:</p>
        <ul>
          <li>Name</li>
          <li>Email address</li>
          <li>Shipping and billing address</li>
          <li>Phone number</li>
          <li>Payment-related information</li>
          <li>Browsing activity on the website</li>
        </ul>
        <p>This information may be collected when you:</p>
        <ul>
          <li>Create an account</li>
          <li>Place an order</li>
          <li>Subscribe to our newsletter</li>
          <li>Contact customer support</li>
          <li>Interact with the website</li>
        </ul>
      </>
    ),
  },
  {
    title: "Log Files & Analytics",
    content: (
      <>
        <p>Our website may automatically collect standard log data, including:</p>
        <ul>
          <li>IP address</li>
          <li>Browser type</li>
          <li>Internet service provider</li>
          <li>Referring or exit pages</li>
          <li>Date and time of visits</li>
          <li>Pages viewed</li>
        </ul>
        <p>This information is used solely for analysing trends, improving website performance, understanding visitor behaviour, and enhancing the user experience. It is not used to personally identify individual visitors.</p>
      </>
    ),
  },
  {
    title: "Cookies Policy",
    content: (
      <>
        <p>NAIRA uses cookies to improve website functionality and personalise your experience. Cookies help us with:</p>
        <ul>
          <li>Storing user preferences</li>
          <li>Remembering login sessions</li>
          <li>Improving page performance</li>
          <li>Personalising your browsing experience</li>
        </ul>
        <p>You may disable cookies through your browser settings at any time. Please note that doing so may affect certain features and functionality of the website.</p>
      </>
    ),
  },
  {
    title: "How We Use Information",
    content: (
      <>
        <p>NAIRA uses the information we collect to:</p>
        <ul>
          <li>Process orders and payments</li>
          <li>Communicate order updates and shipping notifications</li>
          <li>Improve website functionality and user experience</li>
          <li>Provide responsive customer support</li>
          <li>Send newsletters or promotional updates, only if you have opted in</li>
        </ul>
        <p>We do not sell, trade, or otherwise transfer your personal information to third parties for commercial purposes.</p>
      </>
    ),
  },
  {
    title: "Data Security",
    content: (
      <>
        <p>We take appropriate measures to protect your personal information, including:</p>
        <ul>
          <li>Maintaining secure systems and infrastructure</li>
          <li>Restricting access to personal data to authorised personnel only</li>
          <li>Using secure payment processing through trusted providers</li>
        </ul>
        <p>While we strive to protect your data, no method of online transmission or storage is completely secure. You provide personal information at your own discretion.</p>
      </>
    ),
  },
  {
    title: "Data Retention",
    content: (
      <>
        <p>NAIRA retains your personal information only as long as necessary to:</p>
        <ul>
          <li>Provide our services</li>
          <li>Fulfil and process orders</li>
          <li>Comply with legal obligations</li>
          <li>Resolve disputes</li>
        </ul>
        <p>You may contact us at any time to request the removal of your personal data, where possible and in accordance with applicable laws.</p>
      </>
    ),
  },
  {
    title: "Third-Party Services",
    content: (
      <>
        <p>NAIRA may engage trusted third-party services to support our operations, including:</p>
        <ul>
          <li>Payment processors</li>
          <li>Analytics services</li>
          <li>Advertising platforms</li>
          <li>Social media integrations</li>
        </ul>
        <p>These services may collect certain technical information through cookies or analytics tools. We encourage you to review their respective privacy policies.</p>
      </>
    ),
  },
  {
    title: "Your Rights",
    content: (
      <>
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Request corrections to inaccurate information</li>
          <li>Request deletion of your personal data</li>
          <li>Opt out of marketing communications at any time</li>
        </ul>
        <p>To exercise any of these rights, please contact our support team using the details provided below.</p>
      </>
    ),
  },
  {
    title: "Contact Information",
    content: (
      <>
        <p>If you have any questions regarding this Privacy Policy or your personal data, please contact us at:</p>
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

const PrivacyPolicy = () => {
  return (
    <>
      {/* Hero header */}
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
          Privacy Policy
        </h1>
        <p
          className="font-cormorant mt-4 max-w-[520px] mx-auto px-6 leading-relaxed"
          style={{ fontSize: "clamp(15px, 1.4vw, 17px)", color: "hsl(0 0% 40%)" }}
        >
          At NAIRA, we value your privacy and are committed to transparency in how we collect, use, and protect your personal information.
        </p>
      </section>

      {/* Content */}
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
              className="privacy-section"
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

export default PrivacyPolicy;
