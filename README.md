# Notice

Only MVP is complete! While it includes the core features, along w/ some additional enhancements and features, some real functionality related to workflows are needed to mkae this tool more robust. Will work on that next. Have one hour left. 
# Workflow Orchestrator

A lightweight workflow orchestration tool built with Next.js, Tailwind CSS, and React Flow.

## Features

- **Rule-Based Workflows**: Create automation rules using a simple trigger-action model
- **Visual Workflows**: Visualize your workflows with an interactive canvas
- **AI-Assisted Creation**: Use natural language to create automation rules with OpenAI integration
- **Scheduling**: Support for both immediate and delayed execution of actions
- **Simulation**: Test your workflows by simulating trigger events
- **Logging**: Comprehensive logging of all system activities
- **Responsive UI**: Clean, modern interface built with Tailwind CSS

## Tech Stack

- **Frontend**: React, Next.js, Tailwind CSS, React Flow
- **Backend**: Next.js API routes, Supabase (PostgreSQL)
- **AI Integration**: OpenAI API for natural language processing
- **Deployment**: DigitalOcean App Platform (recommended)

## Getting Started

### Prerequisites

- Node.js 14+ and npm/yarn
- Supabase account
- OpenAI API key (for AI features)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/workflow-orchestrator.git
   cd workflow-orchestrator
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   OPENAI_API_KEY=your-openai-api-key (optional, can be added via settings UI)
   ```

4. Set up the database:
   - Create a new Supabase project
   - Run the SQL code from `schema.sql` in the Supabase SQL editor

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Deployment

See `deploy-digitalocean.md` for detailed deployment instructions to DigitalOcean App Platform.

## Usage

### Creating a Rule

1. Navigate to the "Create Rule" page
2. Choose a trigger event that will start your workflow
3. Select an action to be performed when the trigger occurs
4. Choose whether the action should be immediate or delayed
5. Review and save your rule

### AI-Assisted Rule Creation

1. On the "Create Rule" page, enter a description of what you want to automate
2. The system will parse your description and suggest a structured rule
3. Review and adjust if needed, then save

### Simulating Triggers

1. Go to the "Simulate" page
2. Select a trigger type and enter any required parameters
3. Run the simulation to see which rules would be executed

## Future Enhancements

- Browser automation agents
- Advanced rule conditions and filtering
- Multiple actions per rule
- Workflow templates
- User management
- Integration marketplace

## License

MIT

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Flow](https://reactflow.dev/)
- [Supabase](https://supabase.io/)
- [OpenAI](https://openai.com/)

# Example
![Workflow](./styles/image1.png)
![Workflow](./styles/image2.png)
![Workflow](./styles/image3.png)
![Workflow](./styles/image4.png)

```



workflow-orchestrator/
│
├── .env.local                   # Environment variables
├── .gitignore                   # Git ignore file
├── package.json                 # Project dependencies
├── next.config.js               # Next.js configuration
├── postcss.config.js            # PostCSS configuration for Tailwind
├── tailwind.config.js           # Tailwind configuration
│
├── public/                      # Static assets
│   └── favicon.ico              # Favicon
│
├── lib/                         # Shared utilities and functions
│   ├── triggers.js              # Available triggers
│   ├── actions.js               # Available actions
│   ├── supabase.js              # Supabase client setup
│   └── openai.js                # OpenAI API utilities
│   └── deadletterqueue.js               
│   └── langchain.js     
│   └── errorhandling.js                               
│   └── workers/            
│      └── dlqProcessor.js 
│
├── components/                  # React components
│   ├── Layout.jsx               # Main layout component
│   ├── Header.jsx               # Header component
│   ├── RuleBuilder/             # Rule Builder components
│   │   ├── RuleBuilder.jsx      # Main rule builder
│   │   ├── TriggerSelector.jsx  # Trigger selection component
│   │   ├── ActionSelector.jsx   # Action selection component
│   │   └── ScheduleSelector.jsx # Schedule selection component
│   ├── WorkflowCanvas/          # Workflow Canvas components
│   │   ├── WorkflowCanvas.jsx   # React Flow canvas for workflows
│   │   ├── TriggerNode.jsx      # Trigger node component
│   │   └── ActionNode.jsx       # Action node component
│   ├── RulesList/               # Rules List components
│   │   ├── RulesList.jsx        # List of all rules
│   │   └── RuleItem.jsx         # Individual rule item
│   ├── Logger/                  # Logging components
│   │   ├── LogsViewer.jsx       # Logs viewer component
│   │   └── LogItem.jsx          # Individual log item
│   └── Settings/                # Settings components
│       └── ApiKeyForm.jsx       # OpenAI API key form
│   └── DeadLetterQueue/                
│       └── DeadLetterQueueViewer.jsx      
│   ├── AsyncErrorBoundary.jsx 
│   ├── ErrorBoundary.jsx 
│
├── pages/                       # Next.js pages
│   ├── _app.js                  # Custom App component
│   ├── index.js                 # Home page
│   ├── create.js                # Create rule page
│   ├── rules.js                 # Rules list page
│   ├── logs.js                  # Logs page
│   ├── settings.js              # Settings page
│   ├── simulate.js              # Trigger simulation page
│   ├── dead-letter-queue.js         
│   ├── test-error-handling.js              
│   └── api/                     # API routes
│       ├── rules/               # Rules API
│       │   ├── index.js         # GET/POST rules
│       │   ├── [id].js          # GET/PUT/DELETE specific rule
│       │   └── trigger.js       # Trigger a rule
│       ├── openai/              # OpenAI API
│       │   └── parse.js         # Parse natural language to rule
│       │   └── advance-parse.js         
│       │   └── generate-description.js         
│       ├── logs/                # Logs API
│       │   └── index.js         # GET logs
│       └── settings/            # Settings API
│           └── apiKey.js        # Set OpenAI API key
│       └── workers/            
│           └── process-dlq.js        
│       └── dead-letter-queue/            
│           └── [id]
│           └── [id]/retry.js
│           └── index.js
│
└── styles/                      # Styles
    └── globals.css              # Global styles with Tailwind directives
└── types/                      # Styles
    └── errors.ts           
    └── index.ts