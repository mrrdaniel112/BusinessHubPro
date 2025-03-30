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

export default function LegalDisclaimers() {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Legal Disclaimers - BETA VERSION</CardTitle>
          <CardDescription>
            Last Updated: {new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
            <h3 className="font-bold text-red-800 dark:text-red-400 text-md">IMPORTANT LEGAL NOTICE</h3>
            <p className="mt-2">
              This document contains important disclaimers and limitations of liability regarding your use of our BETA version of the Business Management Platform. Please read it carefully.
            </p>
          </div>

          <section>
            <h3 className="font-bold text-lg mb-2">1. No Accounting or Legal Advice</h3>
            <p>
              The Business Management Platform ("Platform") provides tools to help you organize your business finances and operations. It DOES NOT provide accounting, tax, legal, or professional advice. Any financial or business decisions you make based on information provided by the Platform are made at your own risk and discretion.
            </p>
            <p className="mt-2">
              We strongly recommend consulting with qualified accounting, tax, legal, or other relevant professionals before making important business decisions.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">2. Beta Software "As Is" Disclaimer</h3>
            <p className="mb-2">
              THE PLATFORM IS PROVIDED "AS IS" AND "WITH ALL FAULTS" WITHOUT WARRANTY OF ANY KIND. YOU AGREE THAT THE USE OF THE BETA SOFTWARE IS AT YOUR SOLE RISK. TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE COMPANY DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Warranties of merchantability and fitness for a particular purpose</li>
              <li>Warranties concerning the accuracy, reliability, or quality of the Platform</li>
              <li>Warranties that the Platform will meet your requirements</li>
              <li>Warranties that the operation of the Platform will be uninterrupted or error-free</li>
              <li>Warranties that defects in the Platform will be corrected</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">3. Financial Data Disclaimer</h3>
            <p>
              While we strive to ensure all calculations in the Platform are accurate, we make no guarantees regarding the accuracy of any financial calculations, including but not limited to taxes, interest, depreciation, or other financial computations.
            </p>
            <p className="mt-2">
              It is your responsibility to verify all financial data and calculations before making business decisions or filing any government forms.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">4. Beta Testing Risks</h3>
            <p className="mb-2">
              As a Beta tester, you acknowledge and accept the following risks:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The Platform may contain serious errors or inaccuracies</li>
              <li>The Platform may be incomplete and missing critical features</li>
              <li>The Platform may operate inconsistently and be interrupted frequently</li>
              <li>The Platform may cause loss or corruption of data in extreme cases</li>
              <li>Features available during Beta may be modified, changed, or removed in final release</li>
            </ul>
            <p className="mt-2">
              We strongly recommend maintaining backup copies of all data entered into the Platform during the Beta period.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">5. Limitation of Liability</h3>
            <p>
              IN NO EVENT SHALL THE COMPANY, ITS AFFILIATES, LICENSORS, SERVICE PROVIDERS, EMPLOYEES, AGENTS, OFFICERS, OR DIRECTORS BE LIABLE FOR DAMAGES OF ANY KIND, UNDER ANY LEGAL THEORY, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE PLATFORM, INCLUDING, WITHOUT LIMITATION, ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
            </p>
            <p className="mt-2">
              THIS INCLUDES, BUT IS NOT LIMITED TO, PERSONAL INJURY, PAIN AND SUFFERING, EMOTIONAL DISTRESS, LOSS OF REVENUE, LOSS OF PROFITS, LOSS OF BUSINESS OR ANTICIPATED SAVINGS, LOSS OF USE, LOSS OF GOODWILL, LOSS OF DATA, AND WHETHER CAUSED BY TORT (INCLUDING NEGLIGENCE), BREACH OF CONTRACT, OR OTHERWISE, EVEN IF FORESEEABLE.
            </p>
            <p className="mt-2">
              THIS LIMITATION WILL APPLY EVEN IF THE COMPANY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES AND NOTWITHSTANDING THE FAILURE OF ESSENTIAL PURPOSE OF ANY LIMITED REMEDY.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">6. Business Risk and Data Loss</h3>
            <p>
              You acknowledge that using the Beta version of the Platform for real business operations carries inherent risk. While we implement reasonable data protection measures, we cannot guarantee against data loss or corruption.
            </p>
            <p className="mt-2">
              YOU ARE SOLELY RESPONSIBLE FOR:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Creating regular backups of your data</li>
              <li>Verifying the accuracy of all data and calculations</li>
              <li>Mitigating the risks of using Beta software in your business</li>
              <li>Reporting any errors or bugs discovered during testing</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">7. No Warranty Against Infringement</h3>
            <p>
              We do not warrant that the Platform does not infringe the intellectual property rights of others. If you become aware of any potential infringement related to the Platform, please contact us immediately at legal@yourcompany.com.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">8. Third-Party Services</h3>
            <p>
              The Platform may integrate with or otherwise link to third-party services. We are not responsible for any third-party services, and your use of such services is at your own risk. Any third-party terms and policies will govern your use of those services.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">9. Indemnification</h3>
            <p>
              You agree to defend, indemnify, and hold harmless the Company, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your use of the Platform.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">10. Financial and Business Management Software Disclaimer</h3>
            <p>
              Our Platform is designed to help businesses manage their operations, but it is not a replacement for industry-specific software in regulated fields. The Platform is a general business management solution that:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Provides tools for tracking income, expenses, invoicing, and business operations</li>
              <li>Offers features to help organize and manage your business data</li>
              <li>Is designed as a comprehensive business management platform</li>
              <li>Functions independently as our own unique software solution with original code and architecture</li>
            </ul>
            <p className="mt-2">
              The Platform is developed with our own proprietary code and unique approach. Any functional similarities with other business software platforms are coincidental and the result of addressing common business needs, rather than copying or replicating any specific competitor's product.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">11. Contact Us</h3>
            <p>
              If you have any questions about these Disclaimers, please contact us at legal@yourcompany.com.
            </p>
          </section>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-between">
          <Button variant="outline" onClick={() => setLocation("/login")}>
            Back to Login
          </Button>
          <Button onClick={() => window.print()}>Print Disclaimers</Button>
        </CardFooter>
      </Card>
    </div>
  );
}