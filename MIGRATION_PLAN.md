# Plan migracji Webflow → Next.js (sprytnykupiec.pl)

> Status: **propozycja / wersja robocza**
> Branch źródłowy do analizy: `dev` (nie `main`)
> Cel: odtworzyć aplikację Webflow + jQuery w Next.js, postawić na Vercel pod
> `beta.sprytnykupiec.pl`, a docelowo przepiąć produkcyjną domenę `sprytnykupiec.pl`.

---

## 1. Czy to jest możliwe? — TAK

Migracja jest wykonalna i to typowy scenariusz. Najważniejszy fakt obniżający
ryzyko: **backend i API się nie zmieniają**. Migrujemy wyłącznie warstwę
frontendu. Next.js stanie się nowym klientem tego samego API
(`api.smartcommerce.net/v0/`) i tego samego auth (AWS Cognito + cookies).

---

## 2. Co dziś mamy (analiza repo `Smartcommerce`, branch `dev`)

To repozytorium **to stara warstwa Webflow + JS** — zbiór skryptów
wstrzykiwanych do stron Webflow przez CDN (jsDelivr → gitRaw, widać w historii).
Design (HTML/CSS) żyje w Webflow i nie ma go w repo.

### Architektura starej aplikacji
| Warstwa | Gdzie żyje | Technologia |
|---|---|---|
| Design / HTML / CSS | Webflow (poza repo) | Webflow Designer, assety na `cdn.prod.website-files.com` |
| Logika frontendu | to repo (`*.js`) | jQuery + vanilla JS, ręczna manipulacja DOM |
| Tabele danych | każdy moduł | **DataTables** (jQuery) — ~280 wywołań łącznie |
| Formularze | Webflow | `#wf-form-*` (40+ formularzy), przechwytywane przez JS |
| Auth / sesja | przeglądarka | AWS Cognito (`OrganizationclientId`), tokeny w cookies (`sprytnycookie`, `sprytnyToken`, `sprytnyInvokeURL`, `sprytnyDomainName`, `sprytnyUsername`, `sprytnyUserRole`) |
| Login | webhook | Integromat/Make (`hook.integromat.com/...`) → Cognito |
| Backend API | AWS | `api.smartcommerce.net/v0/` (prod), API Gateway us-east-1 (dev) |

### Zakres kodu do migracji (branch `dev`, ~37 000 linii JS)
| Moduł (plik) | Linie | Rola | DataTables |
|---|---:|---|---:|
| `app/orders/order.js` | 7 507 | Zamówienia (najbogatszy) | 56 |
| `app/tenants/organization.js` | 5 755 | Organizacja: sklepy, role, zaproszenia | 40 |
| `app/shops/shop.js` | 5 589 | Sklepy | 27 |
| `app/deliveries/delivery.js` | 3 786 | Dostawy | 11 |
| `app/offers/offer.js` | 2 468 | Oferty | 14 |
| `app/wholesalers/wholesaler.js` | 2 132 | Hurtownicy | 4 |
| `app/exclusive-products/creator.js` | 1 673 | Kreator produktów exclusive | 7 |
| `app/van/pricats/pricat.js` | 1 561 | PRICAT (VAN/EDI) | 18 |
| `app/exclusive-products/exclusive-products.js` | 1 561 | Produkty exclusive | 11 |
| `app/wholesalers/wholesaler-page.js` | 1 258 | Strona hurtownika | 4 |
| `app/integrations/kc-firma.js` | 1 284 | Integracja KC-Firma | 4 |
| `app/users/me.js` | 1 118 | Profil użytkownika | 4 |
| `app/integrations/merchant-console.js` | 1 082 | Merchant Console | 5 |
| `app/integrations/pc-market.js` | 1 048 | Integracja PC-Market | 4 |
| `app/pricelists/new.js` | 932 | Cenniki | 4 |
| `app/integrations/contracts.js` | 705 | Kontrakty | 4 |
| `app/utils/tenant-onboarding.js` | 678 | Onboarding tenanta | 7 |
| `app/utils/shop-onboarding.js` | 553 | Onboarding sklepu | — |
| `login-page.js` | 313 | Logowanie + auth | 4 |
| `app/utils/access-pool.js` | 0 | (pusty) | — |

### Dług techniczny do uprzątnięcia przy okazji
- Masowy **copy-paste** boilerplate: `whenReadyAndDataTables`, `getCookie`,
  `enablePasswordToggle`, `setCookie` — powtórzone w każdym pliku. W Next.js → jeden
  współdzielony moduł.
- Logika wpleciona w DOM Webflow (ID-ki `#wf-form-*`, `getElementById`) — w React
  zastąpiona stanem komponentów.
- Sekrety/identyfikatory zaszyte w kodzie (Cognito client id, URL webhooków) → do
  zmiennych środowiskowych.

---

## 3. Architektura docelowa (Next.js)

- **Framework:** Next.js (App Router) + TypeScript.
- **Hosting:** Vercel.
- **Style / design 1:1:** eksport HTML/CSS z Webflow → przeniesienie do
  komponentów. Klasy Webflow zachowujemy 1:1 albo mapujemy na Tailwind (do
  ustalenia). Globalny CSS Webflow ładowany jako baza, komponenty na wierzchu.
- **Tabele:** zamiana DataTables na natywny komponent React (TanStack Table)
  lub — dla szybkiego 1:1 w pierwszej fazie — opakowanie DataTables w komponent.
- **Auth:** zachowujemy Cognito. Tokeny: zamiast ręcznych cookies po stronie JS →
  httpOnly cookies ustawiane przez Route Handler / middleware Next.js (bezpieczniej).
  Ścieżka logowania może na start korzystać z istniejącego webhooka, docelowo
  bezpośrednio z Cognito (SDK / amazon-cognito-identity-js).
- **Warstwa API:** cienki klient (`lib/api.ts`) z bazowym URL z env
  (`NEXT_PUBLIC_API_URL` / per-środowisko) i automatycznym dołączaniem tokena.
- **Konfiguracja środowisk:** dev / beta / prod przez zmienne środowiskowe Vercel
  (zamiast `if (DomainName == ...)` w kodzie).

### Mapowanie tras (Webflow → Next.js App Router)
```
/login-page                         → app/(auth)/login/page.tsx
/app/users/me                       → app/(panel)/users/me/page.tsx
/app/tenants/organization           → app/(panel)/tenants/organization/page.tsx
/app/shops/shop                     → app/(panel)/shops/[id]/page.tsx
/app/orders/order                   → app/(panel)/orders/[id]/page.tsx
/app/deliveries/delivery            → app/(panel)/deliveries/[id]/page.tsx
/app/offers/offer                   → app/(panel)/offers/page.tsx
/app/wholesalers/...                → app/(panel)/wholesalers/...
/app/exclusive-products/...         → app/(panel)/exclusive-products/...
/app/integrations/{kc-firma,pc-market,merchant-console,contracts} → app/(panel)/integrations/...
/app/pricelists/new                 → app/(panel)/pricelists/...
/app/van/pricats/pricat             → app/(panel)/van/pricats/...
```

---

## 4. Plan fazowy

### Faza 0 — Fundament (1 iteracja)
- Dodać repo Next.js (`sprytny-kupiec`) do sesji.
- Ustalić: czysty start vs istniejący kod; Tailwind vs surowy CSS Webflow.
- Skonfigurować env (API URL, Cognito client id, webhooki) dla dev/beta/prod.
- Zbudować współdzielone fundamenty: `lib/api.ts`, helpery auth/cookies,
  layout panelu, nawigacja.

### Faza 1 — Auth (fundament całej reszty)
- Migracja `login-page.js`: formularz logowania, Cognito, ustawianie sesji,
  reset hasła, toggle widoczności hasła, wygasanie sesji / wylogowanie.
- Middleware chroniący trasy `/app/*`.

### Faza 2 — Moduły panelu (iteracyjnie, wg priorytetu biznesowego)
Sugerowana kolejność (od najczęściej używanych / fundamentalnych):
1. `users/me` (profil) — mały, dobry do wypracowania wzorca.
2. `tenants/organization` — sklepy, role, zaproszenia (rdzeń multi-tenant).
3. `shops/shop`
4. `orders/order` (największy — rozbić na pod-zadania)
5. `deliveries`, `offers`, `wholesalers`
6. `exclusive-products`, `pricelists`, `van/pricats`
7. `integrations/*` (KC-Firma, PC-Market, Merchant Console, Contracts)

Każdy moduł = osobna iteracja: trasa + komponenty + tabele + formularze +
podpięcie API + parytet funkcjonalny ze starą wersją.

### Faza 3 — Deploy na beta i testy
- Deploy na Vercel → `beta.sprytnykupiec.pl` (stary Webflow dalej żyje na prod).
- Testy na realnych danych/klientach. Stary i nowy system działają równolegle.

### Faza 4 — Cutover produkcji
- Po akceptacji bety: przepięcie DNS `sprytnykupiec.pl` z Webflow na Vercel.
- Rollback = cofnięcie DNS (prosty, odwracalny).
- Plan komunikacji migracji klientów (konta zostają — auth na Cognito bez zmian).

---

## 5. Ryzyka i decyzje do podjęcia
- **„1:1" wizualne:** najszybsza droga to eksport Webflow (HTML/CSS). Decyzja:
  zachować klasy Webflow czy przepisać na Tailwind.
- **DataTables:** szybkie opakowanie vs natywny TanStack Table (rekomendacja:
  docelowo TanStack, na start ewentualnie wrapper dla parytetu).
- **Login przez Integromat/Make:** zostawić webhook czy iść wprost na Cognito.
- **Sekrety w kodzie:** przenieść Cognito client id i URL-e do env.
- **SEO / strona marketingowa:** czy `sprytnykupiec.pl` to tylko panel (`/app/*`),
  czy też landing/marketing? To zmienia zakres eksportu z Webflow.

---

## 6. Następny krok
Czeka na: dodanie repo Next.js `sprytny-kupiec` do sesji (potrzebny dokładny
slug `owner/repo`), żeby ruszyć z Fazą 0.
