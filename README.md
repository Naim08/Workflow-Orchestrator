

# 🚀 Workflow Orchestrator

A lightweight, extensible workflow orchestration tool built with **Next.js**, **Tailwind CSS**, and **React Flow**.

> **Live Demo**: [https://suiteop.tech](https://suiteop.tech/)

---

## ⚠️ Notice

> **Only the MVP is complete!** While the tool includes core functionality and several enhancements, additional features — especially around workflow execution — are needed to make it more robust. Planning to continue development shortly — got about one hour left today.

---

## ✨ Features

- **Rule-Based Workflows** – Build automations using a simple trigger-action model
- **Visual Workflow Builder** – Interactive canvas for designing your workflows
- **AI-Assisted Creation** – Leverage OpenAI to generate rules from natural language
- **Scheduling** – Support for immediate and delayed action execution
- **Simulation Engine** – Test workflows by simulating trigger events
- **Comprehensive Logging** – Track all system activities with detailed logs
- **Responsive UI** – Clean and modern interface powered by Tailwind CSS

---

## 🧰 Tech Stack

| Layer        | Technology                                      |
|--------------|-------------------------------------------------|
| Frontend     | React, Next.js, Tailwind CSS, React Flow        |
| Backend      | Next.js API Routes, Supabase (PostgreSQL)       |
| AI Features  | OpenAI API for natural language processing      |
| Deployment   | DigitalOcean App Platform (recommended)         |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and `pnpm`
- Supabase account (for database)
- OpenAI API Key (for AI features, optional)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/workflow-orchestrator.git
   cd workflow-orchestrator
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   OPENAI_API_KEY=your-openai-api-key  # optional, can be added via the UI
   ```

4. Set up the database:
   - Create a new project in Supabase
   - Run the `schema.sql` file using Supabase SQL editor

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deployment

Deploy on **DigitalOcean App Platform** with ease. See [`deploy-digitalocean.md`](deploy-digitalocean.md) for detailed instructions.

---

## 🧪 Usage Overview

### Creating a Rule

1. Navigate to **Create Rule**
2. Select a trigger event
3. Choose an action to perform
4. Schedule it (immediate or delayed)
5. Review and save your rule

### AI-Assisted Rule Creation

1. Enter a description of the automation you want
2. OpenAI parses your input into a structured rule
3. Review, adjust, and save

### Simulate Triggers

1. Go to the **Simulate** page
2. Select trigger type + parameters
3. Run simulation to preview workflow behavior

---

## 📋 Example (only few in app atm) Workflows

| Trigger                          | Condition (Optional)                         | Action                                                | Action Type                  |
|----------------------------------|----------------------------------------------|-------------------------------------------------------|------------------------------|
| Guest checks in                  | If after 10 PM                               | Send a welcome email                                  | Immediate                    |
| Guest checks out                 | No condition                                 | Notify cleaning staff                                 | Immediate                    |
| Cleaning task completed         | No condition                                 | Notify front desk                                     | Immediate                    |
| Guest requests late checkout     | If availability allows                       | Approve request and send confirmation                 | Immediate                    |
| Guest leaves a review            | If rating > 4 stars                          | Send thank-you email with promo code                  | Immediate                    |
| Smart lock battery low           | No condition                                 | Notify maintenance team                               | Immediate                    |
| Noise level exceeds threshold    | If after 11 PM                               | Send warning notification to guest                    | Immediate                    |
| Payment failed                   | No condition                                 | Notify admin and request alternative                  | Immediate                    |
| Occupancy rate < 50%             | No condition                                 | Offer discounts via email                             | Scheduled (weekly)           |
| Flight delay detected            | If guest arrival is same day                 | Update check-in time automatically                    | Immediate                    |
| Severe weather warning issued    | No condition                                 | Notify guests with safety instructions                | Immediate                    |
| New reservation booked           | No condition                                 | Send booking confirmation and welcome packet          | Immediate                    |
| Guest requests housekeeping      | If within housekeeping hours                 | Create task for housekeeping staff                    | Immediate                    |
| Room inspection completed        | If issues found                              | Notify maintenance team with issue details            | Immediate                    |
| Maintenance request created      | No condition                                 | Create maintenance task and notify technician         | Immediate                    |
| Maintenance request overdue      | Over 24 hours                                | Escalate to admin with priority status                | Scheduled (daily)            |
| Guest Wi-Fi usage exceeds limit  | No condition                                 | Notify guest and offer data upgrade                   | Immediate                    |
| Guest requests early check-in    | If room ready                                | Approve request and notify guest                      | Immediate                    |
| Reservation modified             | No condition                                 | Notify front desk and update schedule                 | Immediate                    |
| Reservation conflict detected    | No condition                                 | Flag for review and notify admin                      | Immediate                    |
| Guest cancels reservation        | If within penalty-free window                | Process cancellation and confirm refund               | Immediate                    |
| Guest opens support ticket       | No condition                                 | Assign to support staff and send acknowledgment       | Immediate                    |
| Guest extends stay               | No condition                                 | Update booking and notify cleaning schedule           | Immediate                    |
| ID verification pending          | More than 12 hours after request             | Send verification reminder to guest                   | Scheduled (daily)            |
| Security motion detected         | If after 12 AM and in restricted zone        | Alert security team                                   | Immediate                    |
| Noise level normalizes           | After previous warning                       | Send thank-you message to guest                       | Immediate                    |
| Carbon monoxide detected         | No condition                                 | Trigger alarm, notify guests and emergency contacts   | Immediate                    |
| Thermostat adjusted manually     | If outside comfort range                     | Reset to default or notify admin                      | Immediate                    |
| VIP guest arriving               | No condition                                 | Notify staff to prepare VIP amenities                 | Scheduled (2h before check-in)|
| Supply inventory low             | Below threshold                              | Notify procurement to reorder supplies                | Scheduled (daily)            |
| Loyalty milestone reached        | No condition                                 | Send personalized reward email                        | Immediate                    |
| Staff shift change scheduled     | No condition                                 | Send shift reminder to staff                          | Scheduled (daily)            |
| Guest has upcoming checkout      | 24 hours before checkout                     | Send checkout instructions and feedback form          | Scheduled (24h before)       |
| Local event near property        | No condition                                 | Send guests event details and travel tips             | Scheduled (48h before event) |
| Smart device offline             | No condition                                 | Notify admin and suggest troubleshooting steps        | Immediate                    |
| Power outage detected            | No condition                                 | Alert maintenance and notify affected guests          | Immediate                    |
| Emergency alert triggered        | No condition                                 | Notify emergency services and all staff               | Immediate                    |

---

## 🔮 Planned Enhancements

- Browser automation agents
- Complex conditions + filtering
- Multiple actions per rule
- Workflow templates
- User management
- Integration marketplace

---

## 📄 License

MIT

---

## 🙌 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Flow](https://reactflow.dev/)
- [Supabase](https://supabase.io/)
- [OpenAI](https://openai.com/)

---

## 📸 Example Screenshots

![Workflow](./styles/image1.png)
![Workflow](./styles/image2.png)
![Workflow](./styles/image3.png)
![Workflow](./styles/image4.png)

---
