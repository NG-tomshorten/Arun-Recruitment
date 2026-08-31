import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TideLine } from "@/components/TideLine";

/**
 * /privacy — PLAN §4 (same path as the old site, so no redirect) and PLAN §6:
 * the existing policy ported **verbatim** from site-capture.md §5. Nothing here
 * is rewritten, modernised or summarised, including the original's own typos
 * and its mis-ordered contents list. Where the old text describes something the
 * rebuilt site does not do, the text stays and a TODO(PLAN §6) marks it.
 */

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Arun Language Training & Recruitment Ltd collects, uses and protects the personal information of recruitment candidates and anyone who contacts us.",
};

/** One numbered section of the policy. Heading text is verbatim. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-14">
      <h2 className="text-h2">{title}</h2>
      {children}
    </section>
  );
}

/** The original set these subheadings in italics; rendered here as real h3s. */
function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className="mt-8 text-h3">{children}</h3>;
}

export default function Privacy() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      {/* Long-form legal text: one column at a readable measure, ~68ch. */}
      <article className="max-w-[68ch]">
        <p className="kicker">Legal</p>
        <h1 className="mt-4 text-h1">Privacy Policy</h1>
        <TideLine className="mt-4 max-w-40" />

        {/*
          TODO(PLAN §6): this page is a verbatim port of the policy last updated
          13 May 2018 (site-capture.md §5). Two whole-document problems, on top
          of the section-by-section ones marked below:
            1. It is written against the EU General Data Protection Regulation
               and pre-Brexit EEA transfer rules. Since 2021 a UK controller is
               governed by the UK GDPR and the Data Protection Act 2018.
            2. It describes cookies, automatic data collection, marketing
               profiles, user accounts and email marketing — none of which the
               rebuilt site does (CLAUDE.md guardrail 4, PLAN §7).
          It needs a proper legal review before it can be relied on. That review
          is out of scope for the rebuild — not Tom's job and not Barry's.
        */}

        <p className="mt-8 text-lead text-flint">
          Arun Language Training &amp; Recruitment Ltd is committed to protecting
          the privacy of all our recruitment candidates and anyone we hold
          information on.
        </p>
        <p className="mt-5">
          For the purposes of the EU General Data Protection Regulation, GDPR,
          the data controller is Arun Language Training &amp; Recruitment Ltd, 7
          Goda Road, Littlehampton, BN17 6AS, United Kingdom.
        </p>
        <p className="mt-5">
          We have notified the United Kingdom&rsquo;s Information
          Commissioner&rsquo;s Office that we will process your personal
          information in accordance with Data Protection Legislation.
        </p>

        <Section title="This Privacy Policy covers">
          {/*
            TODO(PLAN §6): the original's contents list does not match its own
            body. Items 3 and 4 here are the reverse of body sections 3 and 4,
            and item 7 ("any email alerts that you receive") is worded
            differently from body section 7 ("our emails"). Both preserved as
            printed — do not silently renumber; flag it in the legal review.
          */}
          <ol className="mt-5 list-decimal space-y-2 pl-6">
            <li>
              What personal information we collect about you and how we collect
              it
            </li>
            <li>
              Our legal basis for collecting and using your personal information
            </li>
            <li>How we use your personal information</li>
            <li>Personal information that we share with third parties</li>
            <li>
              Data retention, data security and transfers of personal
              information outside of the European Economic Area (EEA)
            </li>
            <li>Your rights</li>
            <li>
              How to unsubscribe from any email alerts that you receive
            </li>
            <li>Changes to our Privacy Policy</li>
            <li>Legal and Contact Information</li>
          </ol>
        </Section>

        <Section title="1. What personal information we collect about you and how we collect it">
          <SubHeading>Information that you provide us directly</SubHeading>
          <p className="mt-5">
            We collect personal information whenever you contact us with regard
            to employment applications and provide us with information that we
            are able to identify you by, including when you contact us by phone,
            email, via our website or at recruitment fairs. We may request, for
            example, CV and other documents which act as proof of your
            qualifications, your work experience and your identity.
          </p>

          {/*
            TODO(PLAN §6): the rebuilt site does none of this. It logs no IP
            addresses, gathers no demographic data or browsing patterns, and
            builds no marketing profiles. The only measurement is Cloudflare Web
            Analytics (PLAN §9) — cookieless, aggregate, no per-visitor profile.
          */}
          <SubHeading>
            Information that we automatically collect (including use of
            &ldquo;cookies&rdquo;)
          </SubHeading>
          <p className="mt-5">
            We automatically gather certain limited information about your
            visits to our website. This includes demographic data and browsing
            patterns. Information automatically received includes your: IP
            address (which identifies the computer or device that you use to
            access our website); the time and date of your visit; browser;
            operating system; internet connection details, as well information
            regarding which web pages you accessed. This is used to build up
            marketing profiles, to aid strategic development, and to audit usage
            of our website.
          </p>

          {/*
            TODO(PLAN §6): this whole subsection is inaccurate for the new site.
            It sets no cookies at all and has no cookie banner (CLAUDE.md
            guardrail 4) — so there is nothing to disable and no service that
            breaks if you do. There are also no registered users, no sign-in and
            no personalised version of the site; there are no accounts anywhere
            in this architecture.
          */}
          <SubHeading>Use of Cookies</SubHeading>
          <p className="mt-5">
            In particular, we use cookies to collect this information. A cookie
            is a small collection of data sent by a web server to a web browser,
            which lets the server collect information back from the browser. Our
            use of cookies also may allow registered users to be presented with
            a personalised version of our website.
          </p>
          <p className="mt-5">
            Please note that if you do disable cookies, certain services on our
            website may not be available. You can configure your browser to
            accept all cookies, reject all cookies, or notify you when a cookie
            is set. If you reject all cookies, you will not be able to use
            products or services that require you to &ldquo;sign in&rdquo; and
            you may not be able to take full advantage of offerings of our
            website.
          </p>
        </Section>

        {/*
          TODO(PLAN §6): the stated legal basis is consent, under the EU GDPR.
          The only personal data the rebuilt site itself handles is the /contact
          enquiry — name, email, message — which is relayed to info@ and never
          stored (PLAN §7). Both the basis and the regulation cited need a
          lawyer's eye. Also note "Your consent will be cover use of data" is
          mis-typed in the original; left exactly as printed.
        */}
        <Section title="2. Our legal basis for collecting and using your personal information">
          <p className="mt-5">
            Our legal basis for collecting and using your personal information
            is consent.
          </p>
          <p className="mt-5">
            Before processing your information we will ask for your consent to
            do so.
          </p>
          <p className="mt-5">
            The information we collect will be in accordance with the EU General
            Data Protection Regulation. Your consent will be cover use of data
            for the following purposes:
          </p>
          <ul className="mt-5 list-disc space-y-2 pl-6">
            <li>
              processing of your personal information to provide our service to
              you;
            </li>
            <li>
              processing of your personal information where it is in our
              legitimate interests to do so, for example:
              {/* The old page drew these two sub-items with a "►" glyph as
                  their bullet — a list marker, not copy, so they render here as
                  a real nested list. */}
              <ul className="mt-2 list-disc space-y-2 pl-6">
                <li>
                  to analyse and create statistical reports based on the
                  services we provide and our performance of those services; and
                </li>
                <li>for the proper keeping of business records.</li>
              </ul>
            </li>
          </ul>
          <p className="mt-5">
            Where we rely on your consent to process your personal information,
            you may revoke your consent at any time. This will not affect the
            lawfulness of any prior use of that personal information.
          </p>
        </Section>

        {/*
          TODO(PLAN §6): check this against what the rebuilt site actually does.
          The only automated third-party handling is the /contact enquiry relay
          — Cloudflare Worker → Resend → info@ (PLAN §8.3) — which transmits the
          message and stores nothing. Sharing candidate details with schools
          still happens by email, off-site, exactly as before.
        */}
        <Section title="3. Personal information that we share with third parties">
          <p className="mt-5">
            In order to provide the services offered on our website, we need to
            share your personal information with other companies.
          </p>
          <SubHeading>
            Third parties that we share your personal information with
          </SubHeading>
          <p className="mt-5">
            Where you have provided us with consent, we will share your personal
            information with third parties (who will also be data controllers in
            respect of the information that we share).
          </p>
          <SubHeading>
            Other circumstances where we use or share your personal information
          </SubHeading>
          <p className="mt-5">
            In certain circumstances, we may be required by law to disclose your
            personal information to third parties such as government bodies, law
            enforcement agencies, and data protection regulators.
          </p>
        </Section>

        {/*
          TODO(PLAN §6): four things in this section describe features the
          rebuilt site does not have — there is no identity authentication, no
          personalisation, no user account and no registration process, and no
          on-site job application. Candidates apply by plain email with a
          pre-filled subject line (PLAN §7); there is no CV upload anywhere.
        */}
        <Section title="4. How we use your personal information">
          <p className="mt-5">
            We will use your personal information to enable us to provide you
            with the recruitment services you request and to enable you to use
            our website, including for the following purposes:
          </p>
          <ul className="mt-5 list-disc space-y-2 pl-6">
            <li>to authenticate your identity and process your application;</li>
            <li>to personalise aspects of our services;</li>
            <li>to deal with your enquiries and requests;</li>
          </ul>
          <p className="mt-5">
            Additionally, where you have provided us with consent, we will also
            use your personal information for certain other purposes, including:
          </p>
          <ul className="mt-5 list-disc space-y-2 pl-6">
            <li>
              to share with recruitment institutions (if you are applying for a
              job);
            </li>
            <li>
              to contact you about opportunities that we believe may be relevant
              to you and to provide you with updates about developments on our
              website and information about the services we offer;
            </li>
            <li>
              for marketing and strategic development purposes, for example to
              identify trends usage;
            </li>
          </ul>
          <p className="mt-5">
            It is your responsibility to ensure that any information submitted
            as part of the registration process to your user account or as part
            of an application to a job posting is accurate and up to date.
          </p>
        </Section>

        {/*
          TODO(PLAN §6): the EEA framing is pre-Brexit. The United Kingdom has
          been outside the EEA since 2020, so "transfers outside of the EEA" no
          longer describes the position of a UK data controller, and the
          consent-based transfer mechanism described here is not how UK
          international transfers work now.
        */}
        <Section title="5. Data retention, data security and transfers of personal information outside of the European Economic Area (EEA)">
          <p className="mt-5">
            We take steps to protect your personal information from unauthorised
            access and against unlawful processing, accidental loss, destruction
            and damage. We will only keep your personal information for as long
            as we reasonably require and, in any event, only for as long as Data
            Protection Legislation allows.
          </p>
          <p className="mt-5">
            Unfortunately, the transmission of information via the internet is
            not completely secure. Although we will take steps to protect your
            personal information, we cannot guarantee the security of your data
            transmitted via email and/or our website; any transmission is at
            your own risk.
          </p>
          <p className="mt-5">
            We may require third parties that are based outside of the EEA to
            process, host or store your personal information. We will ask for
            your consent to do this and by submitting your personal information
            to us, you are acknowledging this transfer, storing or processing.
            Please note that countries outside the EEA may not have the same
            standard of data protection legislation as countries within the EEA.
          </p>
          <p className="mt-5">
            In the event your personal information is transferred, stored or
            processed outside of the EEA, we will take all reasonable steps to
            ensure that your personal information is treated securely and in
            accordance with this Privacy Policy and the Data Protection
            Legislation. This means that we will only allow third parties to
            access your personal information where those third parties have
            agreed to provide all protections to your personal information as
            set out in the EU General Data Protection Legislation.
          </p>
        </Section>

        {/*
          TODO(PLAN §6): confirm dpo@arunlanguagetraining.com is still a
          monitored mailbox — it appears nowhere else in the rebuild, whose
          published addresses are info@arunlanguagetraining.com and
          barry.shorten@arunlanguagetraining.com (PLAN §6). A rights request
          landing in a dead mailbox is the one failure here with legal teeth.
        */}
        <Section title="6. Your rights">
          <p className="mt-5">
            Should you have any queries or complaints in relation to how we use
            your information, please contact us at{" "}
            <a
              href="mailto:dpo@arunlanguagetraining.com"
              className="text-harbour-deep underline underline-offset-4 transition-colors duration-150 hover:text-harbour"
            >
              dpo@arunlanguagetraining.com
            </a>
            . If you wish to take any complaints or queries further, you have
            the right to contact the Information Commissioner&rsquo;s Office
            regarding such issues. Further information about how to make a
            complaint can be obtained at{" "}
            <a
              href="https://www.ico.org.uk"
              className="text-harbour-deep underline underline-offset-4 transition-colors duration-150 hover:text-harbour"
            >
              www.ico.org.uk
            </a>{" "}
            or by telephoning <span className="tnum">0303 123 1113</span>.
          </p>
          <p className="mt-5">
            You have the right to see the personal information we hold about you
            and to ask us to:
          </p>
          {/* Lettered items: the "(a)" markers are part of the printed text, so
              the list carries no markers of its own. */}
          <ul className="mt-5 list-none space-y-4 pl-0">
            <li>
              (a) make any changes to ensure that any personal information we
              hold about you is accurate and up to date;
            </li>
            <li>
              (b) erase or stop processing any personal information we hold
              about you where there is no longer need for us to hold it;
            </li>
            <li>
              (c) transfer any information we hold about you to a specified
              third party.
            </li>
          </ul>
        </Section>

        {/*
          TODO(PLAN §6): there is no mailing list and no marketing email in the
          rebuilt system, so there is no unsubscribe link to click. The site
          sends nothing; the only outbound mail is Barry replying to an enquiry.
        */}
        <Section title="7. How to unsubscribe from our emails">
          <p className="mt-5">
            If you would like to unsubscribe from our emails please click on the
            &ldquo;unsubscribe&rdquo; link at the bottom of an email.
          </p>
        </Section>

        <Section title="8. Changes to our Privacy Policy">
          <p className="mt-5">
            Arun Language Training &amp; Recruitment Ltd may amend this Privacy
            Policy at any time and where we make material changes to it we will
            provide notice on our website. By continuing to use our services
            and/or our website, you agree to the updated Privacy Policy. If you
            do not agree to any changes that we make, you should not use or
            access our services and/or our website.
          </p>
        </Section>

        <Section title="9. Legal and Contact Information">
          <p className="mt-5">
            The registered office of Arun Language Training and Recruitment Ltd
            is:
          </p>
          <p className="mt-5">
            Arun Language Training and Recruitment Ltd, 7 Goda Road,
            Littlehampton, BN17 6AS, United Kingdom. Registered with Companies
            House, Cardiff. Company registration number{" "}
            <span className="tnum">9744912</span>.
          </p>
          <p className="mt-5">
            We will endeavour to answer any questions or resolve any concerns
            regarding your privacy promptly.
          </p>
          <p className="mt-5">
            We welcome all comments, queries and requests relating to our use of
            your personal information (including in relation to transfers of
            personal information outside the EEA). If you would like to contact
            us, queries should be addressed to{" "}
            <a
              href="mailto:dpo@arunlanguagetraining.com"
              className="text-harbour-deep underline underline-offset-4 transition-colors duration-150 hover:text-harbour"
            >
              dpo@arunlanguagetraining.com
            </a>
          </p>
        </Section>

        <p className="mt-14 border-t border-gull/50 pt-6 text-fine text-flint">
          Arun Language Training &amp; Recruitment Privacy Policy (updated 13th
          May 2018)
        </p>
      </article>
    </div>
  );
}
