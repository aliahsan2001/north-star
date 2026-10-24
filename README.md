# Northstar Academy: "Find your north star"

Concept project 3 of 8 for the Aqoa Systems portfolio. A fictional coaching academy in PECHS, Karachi, for O/A Level, Matric, Intermediate, MDCAT and ECAT.

## What's in it
| Page | Signature moment |
|---|---|
| Home | Scroll through a 3D night sky. Stardust gathers into one constellation per programme (each star is a subject) while the camera glides between them, ending at the North Star and admissions. Stats, top achievers, teachers, and Tara the mascot follow. |
| Programmes | Six constellations hang in the sky. Click one and it zooms in, each star labelled with its subject and class time, beside a panel of batches and fees. A comparison table and full timetables sit below. |
| Faculty | Teacher ID cards fly toward you in 3D, one per scroll step, like flipping through a deck. A table lists everyone at once. |
| Admissions | The fee calculator: pick a programme, tick subjects, and each tick lights a star in that constellation while the monthly fee counts up. Discounts apply automatically: 10% for 4+ subjects, 15% for the full MDCAT/ECAT package, 10% for siblings. Then the full fee structure, and an application form. |
| Results | A gold trophy turns while all 24 top achievers orbit it as cards. Switch between a ring and a rising spiral, drag to spin, click a card or use the arrows. Counters and a filterable results table follow. |
| 404 | Tara looks puzzled, then points the way home. |

**Tara the mascot** is a hand-drawn SVG star with moods (idle, happy, puzzled, cheering). On the application form she frowns at a field that needs fixing and does a spin with star confetti when the application goes through. The confirmation shows an application ID and a ready-to-send WhatsApp message.

Also included: a light-speed warp between pages, chunky buttons that press down, letter-by-letter headlines, and the calculator remembering your picks. The site has no sound, by design.

## Stack
Vite · Three.js · GSAP + ScrollTrigger · Lenis · Barba.js · SplitType

The brief suggests Rive for the mascot. Tara is drawn in SVG and animated with GSAP instead, which keeps her equally light with no extra asset file to maintain.

## Run it
From a terminal:
```bash
npm install
npm run dev
```
The site uses ES modules, so it needs a server. Opening `index.html` by double-clicking won't work. Testing flags: `?lite` forces the lighter version, `?full` forces 3D.

## Deploy on Vercel
Import the repo, set **Root Directory** to `03-northstar-academy`, and keep the detected **Vite** preset. `vercel.json` turns on clean URLs.

## Lighter devices
Weaker phones, data-saver users and anyone without WebGL get:
- A CSS starfield with drawn constellations on Home
- A swipeable row of programme cards on Programmes
- A swipeable row of achiever cards on Results

The content is the same. Reduced-motion visitors get the faculty cards as a plain stack and simple fades everywhere.

## Before publishing
- Search "Northstar Academy Karachi" on Google to check no real academy uses the name.
- Teachers, students, results, fees, numbers and the address are placeholders. Everything lives in `src/data.js`.
- The application form doesn't send anything. A real academy would connect it to a backend or the admissions WhatsApp (set `whatsappNumber` in `src/data.js`).
- Teachers and students are shown as monograms rather than stock photos, since they're fictional people.

Photos from Unsplash (free licence), self-hosted as WebP in `public/img/p/`.
