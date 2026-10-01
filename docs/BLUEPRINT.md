What you're building for Tikiwa Lands Ltd should not be positioned as a website project.

It should be positioned as a Digital Land Sales Platform.

The website is merely one channel. The actual product is an AI-powered sales and customer acquisition platform designed to increase plot sales, automate lead qualification, and give management visibility into the entire sales pipeline.

I would actually stop thinking about this as a "property website" and think about it as:

Tikiwa Smart Sales Platform

A conversational, AI-assisted land sales ecosystem that converts social media traffic into qualified buyers and site visits.

Executive Vision
Current State

Today the process looks like:

Facebook Ad → WhatsApp Chat → Salesperson sends posters manually → Customer disappears

Challenges:

No lead qualification
No buyer profiling
Sales follow-up depends on individual agents
Inventory managed manually
No centralized reporting
Difficult to understand which marketing channels generate sales
Target State

Facebook / Instagram / TikTok / WhatsApp

↓

Tikiwa AI Assistant

↓

Understands customer needs

↓

Recommends suitable projects

↓

Captures lead

↓

Schedules site visit

↓

Hands off to sales team

↓

Tracks conversion

↓

Management dashboard

Product Vision
TIKIWA SMART SALES PLATFORM
Customer Side

Channels:

Website
WhatsApp
Facebook
Instagram
TikTok
QR Codes on posters

The customer should be able to:

Discover Land

Examples:

I need land near Nairobi

I have a budget of KES 700,000

Looking for investment land

Need land to build a home this year

The platform immediately recommends suitable projects.

Ask Questions

Instead of pdf brochures:

Customer asks:

Is there water?

Is title deed ready?

How far from town?

What's the monthly payment plan?

The AI assistant answers instantly.

Calculate Affordability

Example:

KES 950,000 plot

20% deposit

24-month repayment plan

System shows:

Deposit amount
Monthly installment
Total payable
Site Visit Booking

Customer chooses:

Date
Time
Project

System sends confirmation automatically.

WhatsApp Escalation

When purchase intent becomes high:

Example:

I want to visit.

I am ready to pay deposit.

Conversation automatically handed over to sales team.

Admin Platform

This becomes the nerve center of Tikiwa.

Inventory Management

Projects

Example:

Ngong View Estate
Location
Description
GPS Coordinates
Nearby Amenities
Price
Plot Sizes

Upload:

Images
Drone Videos
Maps
Payment Plans
Availability Management

Plots can be:

Available
Reserved
Sold

Immediately updated across:

Website
Chatbot
WhatsApp

No outdated information.

Lead Management

Every inquiry becomes a lead.

Captured information:

Name
Phone
Source

Examples:

Facebook
TikTok
Website
Referral

and

Interests
Budget
Preferred Location
Site Visit Tracking

Status:

New Lead
Contacted
Site Visit Scheduled
Negotiating
Deposit Paid
Sold

Management sees pipeline instantly.

Analytics Dashboard

Management can answer:

Which project generates most leads?
Which salesperson closes best?
Which advertisement works?
Which locations are most searched?
What budgets are most common?
AI Layer

This is where Tikiwa gains competitive advantage.

AI Sales Assistant

Not a generic chatbot.

A trained assistant that understands:

Tikiwa projects
Pricing
Payment plans
Amenities
Land buying process

Example:

Customer:

I have KES 500,000

AI:

Based on your budget, I recommend Green Valley Phase 3 in Matuu. You can secure a plot with KES 100,000 deposit and pay KES 16,700 monthly for 24 months.

Personalized Recommendations

System remembers interests.

Customer browses:

Juja projects
Investment properties

Later:

New Juja project launched. Expected appreciation 20%. Would you like details?

Follow-Up Automation

If customer disappears:

After 3 days:

We noticed you were interested in Kitengela plots. Two plots remain in Phase 2.

After 7 days:

Site visit available this Saturday.

Objection Handling

Common concerns:

Title deed
Water
Roads
Security
Distance

AI trained to answer consistently.

Competitive Differentiation

Most competitors provide:

Brochures
Gallery
Contact forms

Tikiwa should provide:

Conversational Sales Experience

Not searching.

Guided buying.

Intelligent Recommendations

Not static listings.

Automated Follow-up

Most land sellers struggle here.

Unified Customer Journey

Social media → AI → Lead → Site Visit → Sale

Recommended Technology Stack

Keep it lightweight and inexpensive.

Frontend
Next.js

Instead of React + Vite.

Why:

Better SEO
Better for marketing websites
Faster indexing by Google

Deploy on:

Vercel Free/Pro
Backend
Supabase

Use for:

Authentication
Database
Storage
Edge Functions

Perfect for startup stage.

AI
Groq + Llama

Initially:

Very low cost
Fast responses
No large monthly commitment

Later upgrade to:

Meta Llama
OpenAI
Azure OpenAI

if volumes increase.

Workflow Automation
n8n

For:

WhatsApp workflows
Reminders
Follow-up sequences
Lead routing

Host on:

Railway
Render
VPS
Messaging
WhatsApp Cloud API

Direct integration.

Avoid unofficial WhatsApp solutions.

CRM

Initially:

Use your own built-in CRM.

Do not integrate Salesforce, HubSpot, Zoho, etc. yet.

Adds cost and complexity.

Suggested Development Roadmap
Phase 1 (MVP)

Weeks 1-3

Modern website
Projects catalog
Plot inventory
Admin dashboard
Lead capture
WhatsApp integration

Goal:

Generate and manage leads.

Phase 2

Weeks 4-6

AI assistant
Smart recommendations
Payment calculators
Site visit booking

Goal:

Improve conversion.

Phase 3

Weeks 7-10

Analytics
Customer profiling
Automated follow-up
Marketing attribution

Goal:

Increase sales efficiency.

Claude Code Master Prompt

Use this as your top-level prompt:

You are a senior product architect and full-stack engineer.

Build the TIKIWA SMART SALES PLATFORM.

This is not a property listing website.

It is an AI-assisted land sales and customer acquisition platform that helps Tikiwa Lands Ltd increase sales.

Core goals:

1. Convert social media traffic into qualified leads.
2. Manage plot inventory centrally.
3. Automate lead nurturing and follow-up.
4. Enable conversational plot discovery.
5. Integrate WhatsApp as the primary communication channel.
6. Provide analytics on leads, projects, site visits, and sales performance.

Tech stack:

- Next.js
- Tailwind CSS
- Supabase
- n8n
- Groq/Llama AI
- WhatsApp Cloud API
- Vercel

Modules:

1. Marketing Website
2. AI Sales Assistant
3. Plot Inventory Management
4. Lead Management CRM
5. Site Visit Scheduler
6. Analytics Dashboard
7. WhatsApp Automation
8. Recommendation Engine

Design principles:

- Trust first
- Mobile first
- Fast loading
- Modern real-estate visuals
- Conversational UX
- High conversion focus

Generate a complete system architecture, database schema, user flows, Supabase schema, API design, component structure, and implementation roadmap before writing code.


My advice: build the MVP first and leave AI as a modular layer. The biggest business value will come from centralized inventory, WhatsApp lead capture, and automated follow-up. The AI layer should sit on top of a solid sales workflow, not the other way around. That gets Tikiwa to production quickly while keeping hosting costs very low.