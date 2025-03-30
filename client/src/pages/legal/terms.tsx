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

export default function TermsOfService() {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Terms of Service - BETA VERSION</CardTitle>
          <CardDescription>
            Last Updated: {new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mb-6">
            <h3 className="font-bold text-yellow-800 dark:text-yellow-400 text-md">BETA PROGRAM NOTICE</h3>
            <p className="mt-2">
              These Terms of Service govern your use of the Business Management Platform during the beta testing phase. As a beta tester, you agree to these special terms which may change prior to the official release of the Platform.
            </p>
          </div>

          <section>
            <h3 className="font-bold text-lg mb-2">1. Introduction and Acceptance</h3>
            <p>
              By accessing or using the Business Management Platform (the "Platform"), you agree to be bound by these Terms of Service (the "Terms"). If you do not agree to these Terms, you must not access or use the Platform.
            </p>
            <p className="mt-2">
              The Platform is provided by [Company Name] ("we," "us," or "our"). We may modify these Terms at any time, and such modifications shall be effective immediately upon posting. Your continued use of the Platform constitutes your acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">2. Beta Testing Program</h3>
            <p>
              You are participating in our beta testing program (the "Beta Program"). The Beta Program allows selected users to test the Platform before its official release to identify bugs, provide feedback, and suggest improvements.
            </p>
            <p className="mt-2">
              As a beta tester, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>The Platform is in a pre-release state and may contain bugs, errors, and other issues.</li>
              <li>Features may be added, modified, or removed without notice during the beta period.</li>
              <li>Your use of the Platform during the beta period is at your own risk.</li>
              <li>You will provide feedback, when requested, about your experience using the Platform.</li>
              <li>The beta period will end at our discretion, at which time you may be required to transition to a general release version.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">3. Account Registration and Security</h3>
            <p>
              To use the Platform, you must create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
            </p>
            <p className="mt-2">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account or any other breach of security.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">4. Subscription and Payment</h3>
            <p>
              During the beta period, you may be offered a free trial or special pricing. After the beta period or trial, continued use of the Platform requires a subscription.
            </p>
            <p className="mt-2">
              The current subscription price is $25 per month, which includes a 14-day free trial period. You will not be charged until after the trial period. You can cancel your subscription at any time before the end of the trial period to avoid being charged.
            </p>
            <p className="mt-2">
              Subscription fees are charged in advance on a monthly basis. There are no refunds for partial months of service. We reserve the right to change the subscription price upon notice to you.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">5. User Content</h3>
            <p>
              You retain all rights to your data and content you upload to the Platform ("User Content"). By uploading User Content, you grant us a non-exclusive, worldwide, royalty-free license to use, store, and process your User Content solely for the purpose of providing the Platform services to you.
            </p>
            <p className="mt-2">
              You are solely responsible for your User Content and represent that you have all necessary rights to upload such content. We reserve the right to remove any User Content that violates these Terms or that we determine is inappropriate.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">6. Prohibited Uses</h3>
            <p>
              You agree not to use the Platform:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>In any way that violates any applicable law or regulation.</li>
              <li>To upload, transmit, or distribute any viruses, malware, or other harmful code.</li>
              <li>To attempt to gain unauthorized access to the Platform or related systems.</li>
              <li>To interfere with or disrupt the operation of the Platform.</li>
              <li>To engage in any activity that could harm or impair the functioning of the Platform.</li>
              <li>To impersonate or attempt to impersonate our company, employees, or other users.</li>
              <li>To collect or harvest any personal information from other users.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">7. Intellectual Property</h3>
            <p>
              The Platform, including all content, features, and functionality, is owned by us and is protected by copyright, trademark, and other intellectual property laws. These Terms do not grant you any right, title, or interest in the Platform or our intellectual property.
            </p>
            <p className="mt-2">
              You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any material from the Platform, except as necessary to use the Platform for its intended purpose.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">8. Feedback</h3>
            <p>
              We welcome your feedback, comments, and suggestions for improving the Platform ("Feedback"). By providing Feedback, you grant us an irrevocable, non-exclusive, royalty-free license to use, reproduce, modify, publish, distribute, and otherwise exploit the Feedback for any purpose.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">9. Disclaimer of Warranties</h3>
            <p>
              THE PLATFORM IS PROVIDED "AS IS" AND "WITH ALL FAULTS" WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="mt-2">
              WE DO NOT WARRANT THAT THE PLATFORM WILL FUNCTION WITHOUT INTERRUPTION OR ERRORS, OR THAT DEFECTS WILL BE CORRECTED. YOU ASSUME ALL RISKS ASSOCIATED WITH USING THE PLATFORM.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">10. Limitation of Liability</h3>
            <p>
              IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE PLATFORM, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL THEORY, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p className="mt-2">
              OUR TOTAL LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THE PLATFORM SHALL BE LIMITED TO THE AMOUNT YOU PAID FOR ACCESS TO THE PLATFORM IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE LIABILITY.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">11. Data Security and Business Risk</h3>
            <p>
              While we implement reasonable security measures to protect your data, you acknowledge that no online service is completely secure. You are responsible for maintaining backup copies of your data and implementing appropriate security measures for your business.
            </p>
            <p className="mt-2">
              During the beta period, there is an increased risk of data loss or corruption. We recommend maintaining separate backup copies of all data you enter into the Platform.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">12. Indemnification</h3>
            <p>
              You agree to indemnify, defend, and hold harmless our company, its affiliates, and their respective officers, directors, employees, and agents from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your use of the Platform or your violation of these Terms.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">13. Term and Termination</h3>
            <p>
              These Terms will remain in effect until terminated by either you or us. You may terminate these Terms at any time by discontinuing your use of the Platform and closing your account.
            </p>
            <p className="mt-2">
              We may terminate these Terms and your access to the Platform at any time, with or without cause, and without prior notice. Upon termination, all provisions of these Terms which by their nature should survive termination shall survive, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">14. Governing Law and Dispute Resolution</h3>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], without giving effect to any principles of conflicts of law.
            </p>
            <p className="mt-2">
              Any dispute arising out of or relating to these Terms or the Platform shall be resolved exclusively through binding arbitration in accordance with the rules of [Arbitration Association]. The arbitration shall be conducted in [City, State/Province].
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">15. Miscellaneous</h3>
            <p>
              These Terms constitute the entire agreement between you and us regarding the Platform. If any provision of these Terms is held to be invalid or unenforceable, such provision shall be struck and the remaining provisions shall be enforced.
            </p>
            <p className="mt-2">
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of such right or provision. The waiver of any such right or provision will be effective only if in writing and signed by our authorized representative.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">16. Contact Information</h3>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="mt-2">
              Email: legal@yourcompany.com<br />
              Address: [Company Address]
            </p>
          </section>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-between">
          <Button variant="outline" onClick={() => setLocation("/legal")}>
            Back to Legal Hub
          </Button>
          <Button onClick={() => window.print()}>Print Terms</Button>
        </CardFooter>
      </Card>
    </div>
  );
}