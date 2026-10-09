# Content Migration Checklist — Khaki Tours Rebuild

This checklist inventories every substantive page, tour, itinerary, guide, booking route, form, event, blog post, and policy/help page audited from https://khakitours.com/ (audited September 2026).

Treat this document as the source of truth for all content retention, migration priority, URL mapping, and redirect planning. **No substantive tour, policy, guide, or historical fact is omitted or invented.**

---

## 1. Core Pages & Information Architecture

| Original URL | Page Title | Current Purpose & Content Summary | Migration Action / Target URL | Content & Operational Notes |
| :--- | :--- | :--- | :--- | :--- |
| `https://khakitours.com/` | Home | Hero introduction, group tour promo, private tour categories, Khaki Lab highlight, Ambassadors of Mumbai, guest testimonials, press/media mentions. | **Migrate / Redesign**<br>`/` | High conversion priority: clear "Find a Walk", upcoming departures, private tour enquiry, trusted editorial heritage aesthetic. |
| `https://khakitours.com/walks-tours/` | Walks / Tours | Master directory of all experiences: walking, AC vehicle, open jeep, boat, food, and e-Victoria tours. | **Migrate / Modernize**<br>`/tours/` | Filterable catalogue by format, location, duration, and guest type (Solo/Couple vs. Private/Group). |
| `https://khakitours.com/about/` | About | Mission (#HeritageEvangelism), founder story (Bharat Gothoskar), corporate history (founded 2015), urban safaris origin, KHF introduction. | **Migrate**<br>`/about/` | Preserve authentic founder story, media clips, and historical mission without PR inflation. |
| `https://khakitours.com/khaki-lab/` | Khaki Lab | Dedicated cultural hub at 310, 3rd Floor, Shahid Bhagat Singh Rd, Fort. Library, physical & online talks (Talks #1 to #335+), workshops, exhibits. | **Migrate**<br>`/khaki-lab/` | Preserve event history, speaker credits, location instructions, and event booking/archive. |
| `https://khakitours.com/foundation/` | Foundation | Khaki Heritage Foundation (KHF) — Section 8 Not-for-Profit (CIN: U93000MH2018PTC305786). Focus: conservation, archiving, public education. | **Migrate**<br>`/foundation/` | Retain 80G tax exemption details, mission, project archives, and bank transfer donation instructions. |
| `https://khakitours.com/contact/` | Contact | Physical office address (Fort above Copper Chimney), phone (+91 8828100111), email (`hi@khakitours.com`), enquiry form, map. | **Migrate**<br>`/contact/` | Server-validated contact form with spam protection, rate limiting, direct email/phone/WhatsApp links. |
| `https://khakitours.com/faqs/` | FAQs | In-depth answers: walk logistics, booking, cancellations, monsoon walks, food safety, dress codes, private customization. | **Migrate**<br>`/faqs/` | Grouped by Walk Preparation, Booking & Payment, Private Tours, and Monsoon Policies. Schema-ready (`FAQPage`). |
| `https://khakitours.com/terms-conditions/` | Terms & Conditions | Legal terms for tour participation and donations to KHF. Liability waiver, jurisdiction (Mumbai Courts), dress codes, conduct. | **Migrate**<br>`/terms/` | Retain exact legal language for liability, intellectual property, photographic consent, and jurisdiction. |
| `https://khakitours.com/cancellation-refund-policy/` | Cancellation & Refund Policy | 100% advance required; >72 hrs: 50% refund; <72 hrs: no refund. Weather and organizer cancellation contingencies. | **Migrate**<br>`/cancellation-refund-policy/` | Crucial booking flow requirement. Must be linked directly from booking drawer and checkout. |
| `https://khakitours.com/privacy-policy/` | Privacy Policy | Detailed disclosure of data collected (name, email, phone, passport/country for overseas guests), purpose, storage, KHF data policy. | **Migrate**<br>`/privacy-policy/` | Update to clarify separate consent for marketing vs. operational tour updates. |
| `https://khakitours.com/blogs/` & `/blog/` | Blog / Stories | Narrative posts on Mumbai history, heritage updates, and "This Day That Year" archival accounts. | **Migrate**<br>`/blog/` | Consolidate duplicate `/blog/` and `/blogs/` to `/blog/`. Preserve all 4 published articles. |
| `https://khakitours.com/thank-you/` | Thank You | Post-booking and post-enquiry confirmation screen with next-steps advisory. | **Retain / Update**<br>`/booking/thank-you/` | Add booking reference display, preparation tips, Google Calendar / WhatsApp confirmation links. |
| `https://khakitours.com/khaki-tours-checkout/` | Khaki Tours Checkout | Legacy WP Travel booking handoff page. | **Modernize Flow**<br>`/checkout/` | Retain legacy fallback URL redirect to new checkout flow. |
| `https://khakitours.com/checkout/` | Checkout | Legacy WooCommerce checkout container. | **Consolidate**<br>`/checkout/` | Unify checkout with Razorpay hosted standard checkout and server order verification. |
| `https://khakitours.com/cart/` | Cart | WooCommerce cart page (0 active products). | **Streamline** | Replace multi-step cart with frictionless drawer checkout for single-tour ticket purchases. |
| `https://khakitours.com/shop/` | Shop | Empty WooCommerce shop placeholder. | **Redirect** -> `/tours/` | Redirect legacy shop URL to `/tours/` to eliminate dead ends. |
| `https://khakitours.com/my-account/` | My Account | WooCommerce customer login endpoint. | **Evaluate** | Guest checkout is primary. Provide booking lookup via email + booking token without forced password signup. |
| `https://khakitours.com/khaki-tours-dashboard/` | Dashboard | Legacy WP Travel user login / registration. | **Redirect** -> `/booking/lookup/` | Redirect legacy dashboard to secure booking lookup. |

---

## 2. Group Tour Catalogue (Scheduled Walking & City Tours)

These 10 flagship group walks are the revenue and discovery engine. Every tour has verified pricing, starting locations, durations, and itineraries:

| Tour Title & Hashtag | Slug / Original Link | Verified Price (All-Inclusive) | Verified Duration | Starting Point & Meeting Landmark | Inclusions & Key Highlights |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **#FortWalk** | `fortwalk-2`<br>https://khakitours.com/itinerary/fortwalk-2/ | **INR 1,199** / person | 2.5 Hours | **The Asiatic Society, Town Hall, Fort** | Horniman Circle, Bombay Stock Exchange, Kala Ghoda, Gateway of India, Victorian Gothic & Art Deco Ensemble (UNESCO World Heritage). Led by Ambassador of Mumbai. |
| **#BandraWalk** | `bandrawalk`<br>https://khakitours.com/itinerary/bandrawalk/ | **INR 1,199** / person | 2.5 Hours | **Bandra Fort Garden, Land's End, Bandra West** | Portuguese fort ruins, Castella de Aguada, Mount Mary Basilica history, historic villages (Ranwar/Chimbai), heritage crosses, Bandra's colonial Catholic lineage. |
| **#BangangaWalk** | `bangangawalk-2`<br>https://khakitours.com/itinerary/bangangawalk-2/ | **INR 1,199** / person | 2.0 Hours | **Walkeshwar Bus Depot, Malabar Hill** | Ancient freshwater tank, Walkeshwar Temple complex, Rama & Lakshmana legends, samadhis, dhobi ghats, tranquil heritage pocket amidst Malabar Hill. |
| **#BazarWalk** | `bazarwalk`<br>https://khakitours.com/itinerary/bazarwalk/ | **INR 1,199** / person | 2.0 Hours | **Crawford Market (Mahatma Jyotiba Phule Mandai)** | Crawford Market architecture (Kipling friezes), Mangaldas Market (fabrics), Zaveri Bazaar, flower markets, Mirchi Galli, Bhuleshwar street energy. |
| **#GrislyGirgaon** | `grislygirgaon`<br>https://khakitours.com/itinerary/grislygirgaon/ | **INR 1,199** / person | 2.0 Hours | **Saifee Hospital, Charni Road** | 18th & 19th-century history of Mumbai's "backside" west coast, plague epidemics, ghost lore, burning grounds, royal intrigues, and historic chawls. |
| **#FaithWalk** | `faithwalk`<br>https://khakitours.com/itinerary/faithwalk/ | **INR 1,199** / person | 2.0 Hours | **General Post Office (GPO), Fort** | Multicultural sanctuary: Armenian Church, Parsi Agiaries, Jewish Synagogues, Cathedral of the Holy Name, St. Thomas Cathedral, communal harmony stories. |
| **#ShimmeringCity** | `shimmeringcity`<br>https://khakitours.com/itinerary/shimmeringcity/ | **INR 1,199** / person | 2.0 Hours | **Kala Ghoda Parking Lot, MG Road, Fort** | Night heritage tour in AC vehicle with moonroof. Illuminated heritage buildings of South Mumbai, monsoon-friendly architectural viewing. |
| **#HandmadeInIndia** | `handmadeinindia-in-association-with-swadesh`<br>https://khakitours.com/itinerary/handmadeinindia-in-association-with-swadesh/ | **INR 699** / person | 1.5 Hours | **Swadesh Store, Eros Theatre, Churchgate** | Indian craft traditions, textile heritage from Indus Valley to modern looms, curation in association with Swadesh. |
| **#Fort4Kids** | `fort4kids`<br>https://khakitours.com/itinerary/fort4kids/ | **INR 699** / person | 1.5–2.0 Hours | **Flora Fountain, Fort** | Child-friendly interactive heritage exploration. Story of the 7 islands, how the fortified town was built, cannons, gargoyles, and historical treasure clues. |
| **#Bandra4Kids** | `bandra4kids`<br>https://khakitours.com/itinerary/bandra4kids/ | **INR 699** / person | 1.5–2.0 Hours | **St. Andrew's Church, Hill Road, Bandra** | Interactive village discovery for children: why Bandra looks different, crosses, old houses, sea trade, and Portuguese community stories. |

---

## 3. Private Tours & Tailored Experiences Catalogue

Audited directly from Khaki's vehicle, walking, food, boat, and carriage offerings:

| Category | Experience Title & Hashtag | Slug / Link | Verified Base Price | Duration | Highlights & Logistics |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Private Walking** | **#BombayBazars** | `bombaybazars` | **INR 5,999** (private group) | 2.5 Hours | Private deep dive into native South Mumbai markets, spice streets, and brass alleys. Meeting: Crawford Market. |
| **Private Walking** | **#Castle2Gateway** | `castle2gateway` | **INR 5,999** (private group) | 2.5 Hours | The maritime defensive perimeter: Bombay Castle, naval docks, Old High Court, to Gateway of India. Meeting: Asiatic Society. |
| **Private Walking** | **#SacredBanganga** | `sacredbanganga` | **INR 5,999** (private group) | 2.0 Hours | Exclusive private exploration of Malabar Hill's sacred spring and temples. Meeting: Walkeshwar. |
| **Private Walking** | **#BygoneBandra** | `bygonebandra` | **INR 5,999** (private group) | 2.5 Hours | Private heritage walk through Ranwar Village, Pali, and Portuguese remnants. Meeting: Bandra Fort. |
| **Private Walking** | **#BombayDeco** | `bombaydeco` | **INR 5,999** (private group) | 2.0 Hours | The world's second-largest Art Deco ensemble along Oval Maidan and Marine Drive. Meeting: Oval Maidan / Devika Patkar. |
| **Private Walking** | **#DiscoverDharavi** | `discover-dharavi` | **INR 6,999** (private group) | 2.5 Hours | Ethical, non-voyeuristic exploration of Dharavi's recycling, pottery (Kumbharwada), and micro-enterprises. Meeting: Third Wave Coffee, Mahim. |
| **Private Walking** | **#FreedomTrail** | `freedom-trail` | **INR 5,999** (private group) | 2.5 Hours | Gowalia Tank (August Kranti Maidan), Mani Bhavan, Congress Radio, and Quit India movement sites. |
| **Private Walking** | **#FishingVillage** | `fishingvillage` | **INR 5,999** (private group) | 2.0 Hours | The Koli community: Mumbai’s original inhabitants, fishing docks, customary shrines, and coastal traditions. |
| **Private Walking** | **#FaithAndTheCity** | `faithandthecity` | **INR 5,999** (private group) | 2.5 Hours | Inter-religious heritage walk across historical places of worship. |
| **Private Food Tour** | **#MohallaMunch** | `mohallamunch` | **INR 9,499** (private group) | 2.5 Hours | Bohri Mohalla and Minara Masjid street gastronomy: twelve-hand rotis, slow-cooked haleem, kebabs, handmade ice cream. Meeting: Don Taaki Fountain. |
| **Private Food Tour** | **#IraniChai** | `irani-chai` | **INR 9,499** (private group) | 2.5 Hours | Mumbai's disappearing Parsi & Irani cafe culture, bun maska, mawa cakes, raspberry soda, Irani history. Meeting: Metro INOX Cinema. |
| **Private Food Tour** | **#ChowpattyChat** | `chowpattychat` | Custom / Enquiry | 2.0 Hours | Seaside street food culture, history of bhelpuri, kulfi, and Girgaon beach culinary traditions. |
| **e-Victoria Ride** | **#FortByVictoria** | `fortbyvictoria` | **INR 6,999** (private group) | 1.0–1.5 Hours | Electric Victorian-style open carriage ride past South Mumbai's illuminated heritage monuments. Meeting: Kala Ghoda Statue. |
| **Open Vehicle Jeep** | **#FortByNight** | `fortbynight` | **INR 4,999** (private group) | 1.5–2.0 Hours | World's first #UrbanSafari in open-top jeep past lighted colonial architecture. Meeting: Kala Ghoda. |
| **Open Vehicle Jeep** | **#BandraBreeze** | `bandra-breeze` | **INR 7,999** (private group) | 2.0 Hours | Open jeep tour of suburban sea breeze, Bandra heritage, sea-facing promenades, and film history. Meeting: Bandra Fort Garden. |
| **Open Vehicle Jeep** | **#ImperialFort** | `imperial-fort` | Custom / Enquiry | 2.0 Hours | Open vehicle safari through the grand colonial epicenter of the British Empire in India. |
| **Open Vehicle Jeep** | **#XmasInBandra** | `xmasinbandra` | Seasonal | 2.0 Hours | Annual seasonal open vehicle tour of Bandra's Christmas lights, cribs, and festive spirit. |
| **AC Vehicle Tours** | **#EssentialMumbai** | `essentialmumbai` | Custom / Day Rate | 4.0–8.0 Hours | The definitive Mumbai orientation tour by comfortable AC vehicle with private Ambassador host. |
| **AC Vehicle Tours** | **#ParsiPolis** | `parsipolis` | Custom / Enquiry | 3.0 Hours | Dedicated vehicle tour exploring Mumbai's Parsi baugs, fire temples, statues, and philanthropic legacy. |
| **AC Vehicle Tours** | **#2611Attacks** | `2611attacks` | Custom / Enquiry | 3.0 Hours | Solemn, respectful narrative of the 26/11 terrorist attacks, counter-terror responses, and Mumbai resilience. |
| **AC Vehicle Tours** | **#YeOldeBombay** | `yeoldebombay` | Custom / Enquiry | 3.5 Hours | Exploration of 17th and 18th-century remnants, fortifications, and old native towns. |
| **AC Vehicle Tours** | **#WakeUpMumbai** | `wakeupmumbai` | Custom / Enquiry | 3.0 Hours | Dawn tour: Sassoon Dock fish auctions, newspaper sorting, flower markets, and early city rhythms. |
| **AC Vehicle Tours** | **#VibrantBandra** | `vibrant-bandra` | Custom / Enquiry | 3.0 Hours | Comprehensive vehicle exploration of Bandra's Portuguese, Catholic, and Bollywood geography. |
| **AC Vehicle Tours** | **#ShalomMumbai** | `shalom-mumbai` | Custom / Enquiry | 3.0 Hours | The Baghdadi and Bene Israeli Jewish heritage: Keneseth Eliyahoo Synagogue, Sassoon Docks, David Sassoon Library. |
| **AC Vehicle Tours** | **#MumbaiView** | `mumbaiview` | Custom / Enquiry | 3.0 Hours | Panoramic vantage points, viewpoints, coastal roads, and hill vistas across the archipelago. |
| **AC Vehicle Tours** | **#MumbaiByNight** | `mumbaibynight` | Custom / Enquiry | 3.0 Hours | Nocturnal tour of Queen's Necklace, Marine Drive, illuminated skyline, and midnight city life. |
| **AC Vehicle Tours** | **#CricketCapital** | `cricketcapital` | Custom / Enquiry | 3.0 Hours | Mumbai's cricket shrines: Gymkhanas along Marine Lines, Brabourne, Wankhede, Shivaji Park, maidans. |
| **Boat / Cruise** | **#MumbaiHarbour** | `mumbaiharbour` | **INR 9,999** (private charter) | 2.0 Hours | Private sailing tour on Mumbai harbour: lighthouses, naval dockyards, island forts, maritime history. Meeting: Gateway of India. |
| **Day Excursion** | **#Escape2Elephanta** | `escape2elephanta` | **INR 7,999** (private group) | Full Day (6–7h) | Boat cruise and guided exploration of the 6th-century rock-cut Shiva caves on Gharapuri (Elephanta Island). Meeting: Gateway of India. |

---

## 4. Khaki Lab & Public Events Archive

Khaki Lab has produced over 335 talks, workshops, and exhibitions. These will be preserved in a searchable cultural archive:

| Event ID | Event Title & Speaker | Type / Format | Venue / Medium | Preservation Action |
| :--- | :--- | :--- | :--- | :--- |
| **Talk 335** | `#LegalLessons – Sculptures, Smugglers And The Law` by Dr. Aditi Mann | Lecture / Talk | Online Talk / Khaki Lab | Retain in Events Archive |
| **Talk 333** | `#WhenPersiaMetIndia – The Making Of Parsi Culture` by Dr. Zarin Sethna | Lecture / Talk | Online Talk / Khaki Lab | Retain in Events Archive |
| **Talk 332** | `#TheTasteOfFreedom – Food Challenges In Post-Independence Mumbai` by Meher Mirza | Food History Talk | Online Talk / Khaki Lab | Retain in Events Archive |
| **Talk 331** | `#Megaliths2Temples – Architectural Vocabulary Of Commemoration` by Dr. Srikumar M. Menon | Archaeology Talk | Online Talk / Khaki Lab | Retain in Events Archive |
| **Talk 330** | `#BataNagar – India’s Forgotten Company Town` by Paramita Sen | Industrial Heritage | Online Talk / Khaki Lab | Retain in Events Archive |
| **Workshop** | `#MangalMurti – Making Ganpati Idols Out Of Clay` by Yash Gupte | Hands-on Workshop | Khaki Lab, Fort | Retain in Events Archive |
| **Talk** | `#Pawankhind2Hormuz – How Geography Shapes History` by Akshay Chavan | History Lecture | Khaki Lab, Fort | Retain in Events Archive |
| **Talk 329** | `#MadrasThroughObjects – Discovering Chennai In Unexpected Ways` | City History Talk | Online Talk / Khaki Lab | Retain in Events Archive |
| **Talk 328** | `#MaritimeMatters – India And The Sea Trade` by Nick Collins | Maritime History | Online Talk / Khaki Lab | Retain in Events Archive |
| **Talk** | `#LastWarOfIndependence – Naval Uprising Of 1946` by Cmde (Dr) Srikant Kesnur (Retd) | Military History | Khaki Lab, Fort | Retain in Events Archive |
| **Talk 327** | `#Barygaza2Bharuch – Gujarat Port’s Maritime Heritage` by Dr. Meher Mistry | Maritime Heritage | Online Talk / Khaki Lab | Retain in Events Archive |
| **Special Walk** | `#BarKot: Heritage Bar Crawl` | Experiential Walk | Historic South Mumbai Bars | Retain in Special Walks |
| **Special Walk** | `#GirgaonGanpati` | Seasonal Festival Walk | Girgaon Precinct | Retain in Special Walks |
| **Special Walk** | `#ChuimChronicles` (Easter / Good Friday Specials) | Suburban Walk | Chuim Village, Bandra | Retain in Special Walks |
| **Special Walk** | `#MahanagariWalk` (महानगरी वॉक) | Marathi Language Walk | South Mumbai | Retain in Special Walks |

---

## 5. Guides & Ambassadors of Mumbai

Audited records of Khaki's founder and passionate volunteer-hosts:

| Name | Role / Background | Speciality & Story | Profile Photo Source URL |
| :--- | :--- | :--- | :--- |
| **Bharat Gothoskar** | Founder & CEO, Mechanical Engineer, MBA (16 yrs corporate: Godrej, Pidilite, Mahindra) | Founded Khaki Tours (2015) & KHF (2018). #HeritageEvangelism pioneer, creator of #UrbanSafari. | `https://khakitours.com/wp-content/uploads/2026/02/Website-Walk-Face-photo-2.png` |
| **Aniket** | Ambassador of Mumbai, Lawyer (Bombay High Court) | Originally from Pune; fell in love with Mumbai through a Khaki walk and now guides guests through legal and colonial history. | `https://khakitours.com/wp-content/uploads/2026/08/Website-Walk-Face-photo.png` |
| **Anvi** | Ambassador of Mumbai, Spanish Language Expert, Former Rotary Youth Ambassador in US | Returned to Mumbai after global travel to interpret the city's living stories for international guests. | `https://khakitours.com/wp-content/uploads/2026/04/Website-Walk-Face-photo-1.png` |
| **Preeti** | Ambassador of Mumbai, Anaesthetist | Medical doctor who enlivens visitors on weekends with vibrant cultural history and heritage anecdotes. | `https://khakitours.com/wp-content/uploads/2026/04/Website-Walk-Face-photo-2.png` |
| **Samruddhi** | Ambassador of Mumbai, Banking Professional | Weekday banker, weekend historian who uncovers Mumbai’s financial and architectural wealth. | `https://khakitours.com/wp-content/uploads/2026/04/Website-Walk-Face-photo-3.png` |
| **Aanchal** | Ambassador of Mumbai, Communications Professional | Classical Indian dancer who brings Mumbai's rhythmic cultural stories alive. | `https://khakitours.com/wp-content/uploads/2026/07/Walk-Face-Photo.png` |
| **Adithi** | Ambassador of Mumbai, MBA Student | Storyteller who guides guests through Bollywood lore and vibrant suburban streets. | `https://khakitours.com/wp-content/uploads/2026/02/Walk-Face-photo.png` |
| **Aditi** | Ambassador of Mumbai, Education Researcher | Returned to Mumbai after 11 years to unearth hidden architectural secrets with residents and visitors. | `https://khakitours.com/wp-content/uploads/2026/01/Website-Walk-Face-photo.png` |
| **Aditya** | Ambassador of Mumbai, Supply Chain Transformation Executive | Weekend history buff sharing tales of Mumbai’s trade and colonial expansion. | `https://khakitours.com/wp-content/uploads/2025/11/khaki-team.png` |
| **Ajay** | Ambassador of Mumbai, Venture Capital Investor | Discovered Mumbai’s heritage by chance; now invests his weekends sharing heritage stories. | `https://khakitours.com/wp-content/uploads/2025/11/khaki-team.png` |
| **Sagar Joshi** | Ambassador of Mumbai, Heritage Host | Specialised in BMC Headquarters (#UrbsPrima) and historic South Mumbai architectural walks. | Documented in verified guest reviews |
| **Arun** | Ambassador of Mumbai, Heritage Guide | Renowned for BMC HQ and colonial history walks with high guest acclaim. | Documented in verified guest reviews |

---

## 6. Blog Posts & Heritage Articles

| Post ID | Title | Date Published | Original Slug & URL | Status & Migration Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **427** | ThisDayThatYear: THE DRIVER BEHIND MUMBAI’S DEVELOPMENT | Nov 3, 2025 | `thisdaythatyear-the-driver-behind-mumbais-development`<br>https://khakitours.com/thisdaythatyear-the-driver-behind-mumbais-development/ | **Migrate** to `/blog/thisdaythatyear-the-driver-behind-mumbais-development/`. Historical essay on the 1898 Bombay Improvement Trust. |
| **422** | ThisDayThatYear: THE BAIL-GHODA HOSPITAL | Nov 3, 2025 | `thisdaythatyear-the-bail-ghoda-hospital`<br>https://khakitours.com/thisdaythatyear-the-bail-ghoda-hospital/ | **Migrate** to `/blog/thisdaythatyear-the-bail-ghoda-hospital/`. Account of Sir Dinshaw Petit's 1883 animal hospital in Parel. |
| **417** | ThisDayThatYear: MUMBAI GETS A NEW RAILWAY | Nov 3, 2025 | `thisdaythatyear-mumbai-gets-a-new-railway`<br>https://khakitours.com/thisdaythatyear-mumbai-gets-a-new-railway/ | **Migrate** to `/blog/thisdaythatyear-mumbai-gets-a-new-railway/`. History of Mumbai's Harbour Railway line opened in 1910. |
| **391** | ThisDayThatYear: "I NOW DECLARE THE KHAKI LAB OPEN" | Nov 2, 2025 | `thisdaythatyear-i-now-declare-the-khaki-lab-open`<br>https://khakitours.com/thisdaythatyear-i-now-declare-the-khaki-lab-open/ | **Migrate** to `/blog/thisdaythatyear-i-now-declare-the-khaki-lab-open/`. Opening history of Khaki Lab in Fort. |

---

## 7. Operational Contact, Entity & Legal Information

- **Commercial Operating Entity**: Khaki Tours Private Limited
- **Philanthropic Entity**: Khaki Heritage Foundation (Not-for-Profit Section 8 company, CIN: `U93000MH2018PTC305786`, 80G Certified)
- **Registered Address**: 802 Aster, Dosti Acres, Wadala East, Mumbai 400037
- **Physical Heritage Hub & Office**: 3rd Floor, 310, 58/64, Shahid Bhagat Singh Rd, above Copper Chimney, Fort, Mumbai, Maharashtra 400001
- **Public Phone / WhatsApp**: `+91-8828100111`
- **Official Public Email**: `hi@khakitours.com`
- **Khaki Lab Email**: `khakilab@gmail.com`
- **Social Media Presences**:
  - Instagram: `@khaki.tours`
  - Twitter / X: `@Khaki_Tours`
  - Facebook: `@KhakiToursMumbai`
  - TripAdvisor: Khaki Tours Mumbai (Top Rated Cultural Experience)
