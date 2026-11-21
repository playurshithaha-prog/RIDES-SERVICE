'use client';

import { useEffect, useState } from 'react';
import { nextStatus, places, quoteRide, steps } from '../lib/demo';
import type { Quote, Status } from '../lib/demo';

const translations = [
  {
    lang: 'en', dir: 'ltr', demo: 'Casablanca demo', title: 'Book a ride',
    pickup: 'Pickup', dropoff: 'Drop-off', review: 'Get estimate', confirm: 'Confirm demo ride',
    duration: 'Estimated time', minutes: 'min', base: 'Base fare', distance: 'Distance charge', total: 'Demo total',
    valid: 'Choose two different stops.', map: 'Casablanca route schematic',
    statuses: ['Booking confirmed', 'Vehicle approaching', 'On board', 'Ride complete'],
    progress: 'Advance simulation', restart: 'Book another ride', taxi: 'Taxi First',
    note: 'Simulated route and fare. No vehicle is dispatched or payment collected.',
  },
  {
    lang: 'fr', dir: 'ltr', demo: 'Démo Casablanca', title: 'Réserver un trajet',
    pickup: 'Départ', dropoff: 'Arrivée', review: 'Voir le tarif estimé', confirm: 'Confirmer le trajet démo',
    duration: 'Durée estimée', minutes: 'min', base: 'Prix de base', distance: 'Prix de la distance', total: 'Total démo',
    valid: 'Choisissez deux arrêts différents.', map: 'Schéma du trajet à Casablanca',
    statuses: ['Réservation confirmée', 'Véhicule en approche', 'À bord', 'Trajet terminé'],
    progress: 'Avancer la simulation', restart: 'Réserver un autre trajet', taxi: 'Priorité aux taxis',
    note: 'Trajet et tarif simulés. Aucun véhicule envoyé et aucun paiement encaissé.',
  },
  {
    lang: 'ar', dir: 'rtl', demo: 'عرض تجريبي بالدار البيضاء', title: 'احجز رحلة',
    pickup: 'الانطلاق', dropoff: 'الوجهة', review: 'عرض السعر التقديري', confirm: 'تأكيد الرحلة التجريبية',
    duration: 'المدة التقديرية', minutes: 'دقيقة', base: 'السعر الأساسي', distance: 'تكلفة المسافة', total: 'المجموع التجريبي',
    valid: 'اختر محطتين مختلفتين.', map: 'مخطط الرحلة في الدار البيضاء',
    statuses: ['تم تأكيد الحجز', 'المركبة تقترب', 'الراكب على متن المركبة', 'انتهت الرحلة'],
    progress: 'متابعة المحاكاة', restart: 'احجز رحلة أخرى', taxi: 'الأولوية لسيارات الأجرة',
    note: 'المسار والسعر للمحاكاة. لن يتم إرسال مركبة أو تحصيل أي مبلغ.',
  },
] as const;

export default function Home() {
  const [locale, setLocale] = useState(0);
  const [pickup, setPickup] = useState<string>('port');
  const [dropoff, setDropoff] = useState<string>('maarif');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [invalid, setInvalid] = useState(false);
  const t = translations[locale];

  useEffect(() => {
    document.documentElement.lang = t.lang;
    document.documentElement.dir = t.dir;
  }, [t.lang, t.dir]);

  const start = places.find((place) => place.id === pickup)!;
  const end = places.find((place) => place.id === dropoff)!;
  const dx = end.x - start.x;
  const dy = (end.y - start.y) * 0.72;
  const money = (minor: number) =>
    new Intl.NumberFormat(t.lang, { style: 'currency', currency: 'MAD' }).format(minor / 100);

  function selectPoint(setPoint: (id: string) => void, id: string) {
    setPoint(id);
    setQuote(null);
    setInvalid(false);
  }

  return (
    <main>
      <header>
        <strong className="brand">RideFlow<span>.</span></strong>
        <label className="locale">
          <span className="sr-only">Language / Langue / اللغة</span>
          <select value={locale} onChange={(event) => setLocale(Number(event.target.value))}>
            <option value={0}>English</option><option value={1}>Français</option><option value={2}>العربية</option>
          </select>
        </label>
      </header>
      <div className="workspace">
        <section className="panel">
          <p className="context">{t.demo}</p>
          <h1>{t.title}</h1>
          <p className="note">{t.note}</p>
          {!status && <form onSubmit={(event) => {
            event.preventDefault();
            const estimate = quoteRide(pickup, dropoff);
            setQuote(estimate);
            setInvalid(estimate === null);
          }}>
            <label>{t.pickup}<select value={pickup} onChange={(event) => selectPoint(setPickup, event.target.value)}>
              {places.map((place) => <option key={place.id} value={place.id}>{place.names[locale]}</option>)}
            </select></label>
            <label>{t.dropoff}<select value={dropoff} onChange={(event) => selectPoint(setDropoff, event.target.value)}>
              {places.map((place) => <option key={place.id} value={place.id}>{place.names[locale]}</option>)}
            </select></label>
            {invalid && <p role="alert" className="error">{t.valid}</p>}
            {!quote && <button>{t.review}</button>}
          </form>}
          {quote && !status && <div className="details">
            <dl>
              <div><dt>{t.duration}</dt><dd>{quote.minutes} {t.minutes}</dd></div>
              <div><dt>{t.base}</dt><dd>{money(quote.baseMinor)}</dd></div>
              <div><dt>{t.distance}</dt><dd>{money(quote.distanceMinor)}</dd></div>
              <div className="total"><dt>{t.total}</dt><dd>{money(quote.totalMinor)}</dd></div>
            </dl>
            <button onClick={() => setStatus('confirmed')}>{t.confirm}</button>
          </div>}
          {status && <div className="details">
            <p aria-live="polite" className="current">{t.statuses[steps.indexOf(status)]}</p>
            <ol>{steps.map((step, index) => <li key={step} aria-current={step === status ? 'step' : undefined}>{t.statuses[index]}</li>)}</ol>
            {status === 'completed'
              ? <button onClick={() => { setStatus(null); setQuote(null); }}>{t.restart}</button>
              : <button onClick={() => setStatus(nextStatus(status))}>{t.progress}</button>}
          </div>}
        </section>
        <figure className="map">
          <figcaption>{t.map}</figcaption>
          <div className="chart" dir="ltr">
            <div className="shore" />
            <div className="route" style={{
              left: start.x + '%', top: start.y + '%',
              width: Math.hypot(dx, dy) + '%', transform: 'rotate(' + Math.atan2(dy, dx) + 'rad)',
            }} />
            {places.map((place) => <span key={place.id} style={{ left: place.x + '%', top: place.y + '%' }}
              className={'point' + (place === start || place === end ? ' selected' : '')}>
              <span className="dot" /><span className="place">{place.names[locale]}</span>
            </span>)}
          </div>
        </figure>
      </div>
    </main>
  );
}
