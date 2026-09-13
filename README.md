# I'M INN Hotel Sorsogon — Booking Website

A modern hotel booking website for I'M INN Hotel in Sorsogon City, with live weather (Open-Meteo API) and automated email confirmation via Google Apps Script.

## 🌐 Live Site
**https://iminn-booking.vercel.app**

## ✨ Features
- Responsive home page with hero image, room cards, about section, and embedded Google Map
- Booking form with **live price calculation** and **full client-side validation**
- **Live weather widget** for Sorsogon City using Open-Meteo API (no API key needed)
- **Google Apps Script backend** that generates a **PDF receipt** and emails it to the guest

## 📁 Project Structure


## 🛠 Tech Stack
- **Frontend:** HTML5, CSS3, vanilla JavaScript
- **API:** Open-Meteo (free weather API, no key required)
- **Backend:** Google Apps Script (DocumentApp + DriveApp + MailApp)
- **Hosting:** Vercel (auto-deploy from GitHub main branch)

## 🔧 How It Works
1. User browses rooms on the home page
2. Clicks "Book This" → goes to `booking.html?room=<name>`
3. Booking form auto-selects that room
4. Weather API shows live Sorsogon conditions
5. User fills form → validation runs → total calculates live
6. On submit: POST to Apps Script Web App URL
7. Apps Script creates Google Doc → converts to PDF → emails guest + admin
8. Success message displays on page

## 🚀 Deployment
- **Frontend:** Auto-deployed on Vercel from GitHub `main` branch
- **Backend:** Apps Script deployed as Web App with "Anyone" access