import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLocation } from "wouter";

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Privacy Policy - BETA VERSION</CardTitle>
          <CardDescription>
            Last Updated: {new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-4 mb-6">
            <h3 className="font-bold text-blue-800 dark:text-blue-400 text-md">BETA DATA COLLECTION NOTICE</h3>
            <p className="mt-2">
              As a beta tester, you should be aware that we may collect additional usage, performance, and diagnostic data during this phase to improve the Platform before official release. This Privacy Policy explains our practices regarding data collection and use during the beta testing period.
            </p>
          </div>

          <section>
            <h3 className="font-bold text-lg mb-2">1. Introduction</h3>
            <p>
              At [Company Name] ("we," "us," or "our"), we respect your privacy and are committed to protecting it through our compliance with this Privacy Policy. This policy describes:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>The types of information we may collect from you or that you may provide when you use our Business Management Platform (the "Platform").</li>
              <li>Our practices for collecting, using, maintaining, protecting, and disclosing that information.</li>
              <li>Your rights regarding the information we hold about you.</li>
            </ul>
            <p className="mt-2">
              By accessing or using the Platform, you agree to this Privacy Policy. If you do not agree with our policies and practices, you should not use the Platform.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">2. Information We Collect</h3>
            <p>
              We may collect several types of information from and about users of our Platform, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Personal information:</strong> Information that identifies you, such as your name, email address, telephone number, and payment information.
              </li>
              <li>
                <strong>Business information:</strong> Information about your business, including financial data, client information, employee records, and other business operations data that you input into the Platform.
              </li>
              <li>
                <strong>Usage data:</strong> Information about your interaction with the Platform, including features used, time spent, and actions taken.
              </li>
              <li>
                <strong>Device information:</strong> Information about your device and internet connection, including IP address, operating system, browser type, and device identifiers.
              </li>
              <li>
                <strong>Beta testing data:</strong> Additional diagnostic information, error reports, and usage patterns specific to beta testing purposes.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">3. How We Collect Information</h3>
            <p>
              We collect information:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Directly from you when you provide it to us, such as during account registration or when you input business data.</li>
              <li>Automatically as you navigate through the Platform, including through cookies and similar technologies.</li>
              <li>From third parties, such as payment processors when you make a payment.</li>
              <li>Through feedback forms and communications you send during the beta testing period.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">4. Cookies and Similar Technologies</h3>
            <p>
              We use cookies and similar tracking technologies to track activity on our Platform and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.
            </p>
            <p className="mt-2">
              We use cookies for:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Keeping you signed in to the Platform.</li>
              <li>Understanding how you use the Platform.</li>
              <li>Remembering your preferences.</li>
              <li>Improving the Platform based on your usage patterns.</li>
            </ul>
            <p className="mt-2">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Platform.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">5. How We Use Your Information</h3>
            <p>
              We use information that we collect about you or that you provide to us:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>To provide, maintain, and improve the Platform.</li>
              <li>To process your subscription and payments.</li>
              <li>To provide customer support and respond to your requests.</li>
              <li>To send you technical notices, updates, security alerts, and administrative messages.</li>
              <li>To monitor and analyze usage patterns and trends.</li>
              <li>To protect, investigate, and deter against fraudulent, unauthorized, or illegal activity.</li>
              <li>To develop and enhance the Platform based on beta testing feedback and usage data.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">6. Disclosure of Your Information</h3>
            <p>
              We may disclose personal information that we collect or you provide:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>To our subsidiaries and affiliates.</li>
              <li>To contractors, service providers, and other third parties we use to support our business and who are bound by contractual obligations to keep personal information confidential and use it only for the purposes for which we disclose it to them.</li>
              <li>To comply with any court order, law, or legal process, including to respond to any government or regulatory request.</li>
              <li>To enforce or apply our Terms of Service and other agreements.</li>
              <li>If we believe disclosure is necessary or appropriate to protect the rights, property, or safety of our company, our customers, or others.</li>
            </ul>
            <p className="mt-2">
              We do not sell, rent, or lease your personal information to third parties.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">7. Data Security</h3>
            <p>
              We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. All information you provide to us is stored on secure servers behind firewalls. Any payment transactions will be encrypted using industry-standard technology.
            </p>
            <p className="mt-2">
              However, no method of transmission over the Internet or method of electronic storage is 100% secure. Therefore, while we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security, particularly during the beta testing phase.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">8. Beta Testing Special Considerations</h3>
            <p>
              During the beta testing phase:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>We may collect additional diagnostic information, error logs, and usage metrics beyond what is typically collected in the general release version.</li>
              <li>Our engineers and development team may have broader access to your data for troubleshooting purposes.</li>
              <li>We may request your direct feedback about your experience and may use this feedback to improve the Platform.</li>
              <li>The security measures implemented may be evolving as we develop the Platform.</li>
            </ul>
            <p className="mt-2">
              By participating in the beta program, you acknowledge and consent to these additional data collection and processing activities.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">9. Data Retention</h3>
            <p>
              We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.
            </p>
            <p className="mt-2">
              For beta testing purposes, we may retain certain data for a longer period to analyze platform performance and user behavior. At the conclusion of the beta program, we will either delete or anonymize data that is no longer needed.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">10. Your Rights</h3>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>The right to access the personal information we hold about you.</li>
              <li>The right to request correction of inaccurate personal information.</li>
              <li>The right to request deletion of your personal information.</li>
              <li>The right to request restrictions on the processing of your personal information.</li>
              <li>The right to data portability.</li>
              <li>The right to withdraw consent at any time, where we rely on consent to process your personal information.</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, please contact us using the information provided in the "Contact Us" section below.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">11. Children's Privacy</h3>
            <p>
              Our Platform is not intended for children under 16 years of age, and we do not knowingly collect personal information from children under 16. If we learn we have collected or received personal information from a child under 16 without verification of parental consent, we will delete that information.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">12. International Data Transfers</h3>
            <p>
              Your information, including personal information, may be transferred to and maintained on servers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those in your jurisdiction.
            </p>
            <p className="mt-2">
              If you are located outside [Country] and choose to provide information to us, please note that we transfer the information, including personal information, to [Country] and process it there. Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">13. Changes to Our Privacy Policy</h3>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this page.
            </p>
            <p className="mt-2">
              During the beta testing phase, this Privacy Policy may be updated more frequently as we refine our data practices. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">14. Contact Us</h3>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p className="mt-2">
              Email: privacy@yourcompany.com<br />
              Address: [Company Address]<br />
              Phone: [Company Phone Number]
            </p>
          </section>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-between">
          <Button variant="outline" onClick={() => setLocation("/legal")}>
            Back to Legal Hub
          </Button>
          <Button onClick={() => window.print()}>Print Privacy Policy</Button>
        </CardFooter>
      </Card>
    </div>
  );
}