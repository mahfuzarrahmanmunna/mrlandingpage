import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { telHref, whatsappHref } from "@/lib/format";
import type { PublicSettings } from "@/lib/types";
import { Wordmark } from "./Header";

const SOCIAL = ["facebook", "instagram", "tiktok", "youtube"] as const;

function Policy({ title, body }: { title: string; body: string }) {
  return (
    <details className="group border-b border-rule py-4">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
        {title}
        <Icon name="plus" size={16} className="text-mist transition-transform duration-300 group-open:rotate-45" />
      </summary>
      <p className="whitespace-pre-line pb-2 pt-1 text-sm leading-relaxed text-graphite">{body}</p>
    </details>
  );
}

/** Section 8b — contact, real policies, social links. */
export function Footer({ settings, year, enquiry }: { settings: PublicSettings; year: number; enquiry?: ReactNode }) {
  const { contact, policies, social } = settings;
  const wa = contact.whatsapp ? whatsappHref(contact.whatsapp, `Hello ${settings.brandName}`) : null;
  const tel = contact.phone ? telHref(contact.phone) : null;
  const policyList = [
    ["Delivery", policies.shipping],
    ["Returns & exchanges", policies.returns],
    ["Warranty", policies.warranty],
    ["Privacy", policies.privacy],
  ].filter(([, body]) => body) as [string, string][];
  const socials = SOCIAL.filter((s) => social[s]);

  return (
    <footer id="site-footer" className="border-t border-ink/80 bg-ivory">
      <div id="contact" className="mx-auto grid w-full max-w-[1360px] gap-14 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:px-12 lg:py-24">
        <div className="lg:col-span-4">
          <Wordmark brandName={settings.brandName} logoUrl={settings.logoUrl} />
          <ul className="mt-8 space-y-3 text-sm">
            {tel ? (
              <li>
                <a href={tel} className="inline-flex min-h-11 items-center gap-3 text-ink hover:text-champagne-ink">
                  <Icon name="phone" size={18} className="text-mist" /> {contact.phone}
                </a>
              </li>
            ) : null}
            {wa ? (
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-3 text-ink hover:text-champagne-ink">
                  <Icon name="whatsapp" size={18} className="text-mist" /> WhatsApp {contact.whatsapp}
                </a>
              </li>
            ) : null}
            {contact.email ? (
              <li>
                <a href={`mailto:${contact.email}`} className="inline-flex min-h-11 items-center gap-3 text-ink hover:text-champagne-ink">
                  <Icon name="mail" size={18} className="text-mist" /> {contact.email}
                </a>
              </li>
            ) : null}
            {contact.address ? <li className="text-graphite">{contact.address}</li> : null}
            {contact.hours ? <li className="text-mist">{contact.hours}</li> : null}
          </ul>
          {socials.length ? (
            <ul className="mt-6 flex gap-2" aria-label="Social media">
              {socials.map((s) => (
                <li key={s}>
                  <a
                    href={social[s]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid size-11 place-items-center rounded-full border border-rule text-graphite transition hover:border-ink hover:text-ink"
                    aria-label={`${settings.brandName} on ${s[0]!.toUpperCase()}${s.slice(1)}`}
                  >
                    <Icon name={s} size={18} />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="lg:col-span-4">
          {enquiry ? (
            <>
              <p className="label text-mist">Have a question?</p>
              <p className="mt-3 font-serif text-2xl text-ink">Leave your number — we&rsquo;ll call you back.</p>
              <div className="mt-6">{enquiry}</div>
            </>
          ) : null}
        </div>

        <div className="lg:col-span-4">
          {policyList.length ? (
            <>
              <p className="label text-mist">Policies</p>
              <div className="mt-3 border-t border-rule">
                {policyList.map(([title, body]) => (
                  <Policy key={title} title={title} body={body} />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
      <div className="border-t border-rule-soft">
        <div className="mx-auto flex w-full max-w-[1360px] flex-col justify-between gap-2 px-5 py-6 text-xs text-mist sm:flex-row sm:px-8 lg:px-12">
          <p>
            © {year} {settings.brandName}. All rights reserved.
          </p>
          <p>Prices in {settings.currency.code} ({settings.currency.symbol}).</p>
        </div>
      </div>
    </footer>
  );
}
